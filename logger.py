class Logger:
    def __init__(self):
        self.nodes_without_pruning = 0
        self.nodes_with_pruning = 0

    def reset(self):
        self.nodes_without_pruning = 0
        self.nodes_with_pruning = 0

    def report(self):
        """Prints the analytical comparison between plain Minimax and Alpha-Beta."""
        print("\n" + "=" * 40)
        print("📊 SEARCH TREE ANALYTICS")
        print("=" * 40)
        print(f"Nodes visited WITHOUT Alpha-Beta: {self.nodes_without_pruning:,}")
        print(f"Nodes visited WITH Alpha-Beta:    {self.nodes_with_pruning:,}")
        
        if self.nodes_without_pruning > 0:
            saved_nodes = self.nodes_without_pruning - self.nodes_with_pruning
            percentage = (saved_nodes / self.nodes_without_pruning) * 100
            print(f"Efficiency Gain: Pruned {saved_nodes:,} nodes ({percentage:.1f}% reduction!)")
        print("=" * 40 + "\n")
