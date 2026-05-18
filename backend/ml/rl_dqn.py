import random
import torch
import torch.nn as nn
import numpy as np

class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.net(x)


class Agent:
    def __init__(self, model):
        self.model = model
        self.epsilon = 0.1
        self.gamma = 0.95

    def act(self, state):
        # ✅ FIX: ensure correct shape
        state = torch.FloatTensor(state).unsqueeze(0)

        if random.random() < self.epsilon:
            return random.randint(0, state.shape[1] - 1)

        with torch.no_grad():
            q = self.model(state)
            return torch.argmax(q[0]).item()