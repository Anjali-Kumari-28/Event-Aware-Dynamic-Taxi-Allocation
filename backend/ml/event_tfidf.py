import json
import re
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


NYC_KEYWORDS = [
    "nyc", "new york", "manhattan", "brooklyn", "queens", "bronx",
    "staten island", "jfk", "laguardia", "ewr", "newark",
    "madison square", "central park", "times square", "wall street",
    "harlem", "flushing", "astoria", "hoboken",
    "subway", "metro", "mta", "PATH train",
    "concert", "game", "match", "rain", "snow", "storm", "flood",
    "traffic", "rush hour", "commute", "flight", "delay", "airport",
    "emergency", "fire", "accident", "exam", "university",
    "parade", "festival", "marathon", "protest", "rally",
    "nba", "nfl", "mlb", "nhl", "yankees", "mets"
]


class EventClassifier:
    def __init__(self):
        self.df = pd.read_csv("data/event_dataset.csv")

        self.vectorizer = TfidfVectorizer()
        self.model = LogisticRegression(max_iter=1000)

        X = self.vectorizer.fit_transform(self.df["text"])
        self.model.fit(X, self.df["label"])

        self.multiplier_map = dict(zip(self.df["label"], self.df["multiplier"]))

        with open("data/event_vocab.json") as f:
            self.vocab = json.load(f)

    # ✅ FIXED: now proper class method
    def extract_location(self, text):
        t = text.lower()

        zone_keywords = {
            "manhattan": 1,
            "brooklyn": 2,
            "queens": 3,
            "bronx": 4,
            "jfk": 132,
            "laguardia": 138
        }

        for key, zone in zone_keywords.items():
            if key in t:
                return zone

        return None

    def is_valid_input(self, text):
        if not text or len(text.strip()) < 5:
            return False, "Input is too short. Please describe a real event."

        words = re.findall(r'[a-zA-Z]{3,}', text)
        if len(words) < 2:
            return False, "Please enter at least 2 real words describing an event."

        gibberish_count = 0
        for word in words:
            vowels = sum(1 for c in word.lower() if c in 'aeiou')
            if len(word) > 3 and vowels == 0:
                gibberish_count += 1

        if gibberish_count >= len(words):
            return False, "Input looks like gibberish. Please describe a real event."

        return True, None

    def is_nyc_relevant(self, text):
        t = text.lower()

        non_nyc_cities = [
            "patna", "mumbai", "delhi", "london", "paris", "chicago",
            "los angeles", "miami", "boston", "seattle", "tokyo"
        ]

        for city in non_nyc_cities:
            if city in t:
                return False, f"This system only handles NYC events. '{city}' not allowed."

        return True, None

    def rule_override(self, text):
        t = text.lower()
        for label, words in self.vocab.items():
            for w in words:
                if w in t:
                    return label, 0.99, self.multiplier_map[label]
        return None

    def predict(self, text):

        valid, error_msg = self.is_valid_input(text)
        if not valid:
            return {
                "eventType": "unknown",
                "confidence": 0.0,
                "multiplier": 1.0,
                "is_emergency": False,
                "zone_id": None,
                "error": error_msg
            }

        nyc_ok, nyc_error = self.is_nyc_relevant(text)
        if not nyc_ok:
            return {
                "eventType": "unknown",
                "confidence": 0.0,
                "multiplier": 1.0,
                "is_emergency": False,
                "zone_id": None,
                "error": nyc_error
            }

        rule = self.rule_override(text)
        if rule:
            label, conf, mult = rule
            return {
                "eventType": label,
                "confidence": conf,
                "multiplier": mult,
                "is_emergency": label == "emergency",
                "zone_id": self.extract_location(text),
                "error": None
            }

        X = self.vectorizer.transform([text])
        pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        max_confidence = float(np.max(proba))

        if max_confidence < 0.40:
            return {
                "eventType": "unknown",
                "confidence": round(max_confidence, 2),
                "multiplier": 1.0,
                "is_emergency": False,
                "zone_id": self.extract_location(text),
                "error": "Could not confidently classify this event."
            }
        zone_id = self.extract_location(text)
        return {
            "eventType": pred,
            "confidence": round(max_confidence, 2),
            "multiplier": self.multiplier_map.get(pred, 1.0),
            "is_emergency": pred == "emergency",
            "zone_id": zone_id,
            "error": None
        }  