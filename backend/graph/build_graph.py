import numpy as np
import torch
from torch_geometric.data import Data
from sklearn.neighbors import kneighbors_graph


def build_graph(features):
    # Ensure numpy array
    features = np.array(features, dtype=float)

    # Node features tensor
    x = torch.tensor(features, dtype=torch.float32)

    # Build k-NN graph
    A = kneighbors_graph(features, n_neighbors=4, mode='connectivity', include_self=False)

    # Convert to COO format
    A = A.tocoo()

    # Edge index (2, num_edges)
    edge_index = torch.tensor(
        np.vstack((A.row, A.col)),
        dtype=torch.long
    )

    # Optional: make graph undirected (important for GNN stability)
    edge_index = torch.cat([edge_index, edge_index.flip(0)], dim=1)

    return Data(x=x, edge_index=edge_index)