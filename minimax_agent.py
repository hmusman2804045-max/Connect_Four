import math
from board import EMPTY
from evaluator import Evaluator

class MinimaxAgent:
    def __init__(self, piece, opponent_piece, logger, depth=5):
        """
        piece: The piece the AI is playing as.
        opponent_piece: The piece the opponent is playing as.
        logger: Analytics logger to track node count.
        depth: The search depth limit.
        """
        self.piece = piece
        self.opponent_piece = opponent_piece
        self.logger = logger
        self.depth = depth

    def get_best_move(self, board, checker):
        """Find the optimal move using Minimax, running both algorithms for logging."""
        self.logger.reset()
        
        # 1. Run without pruning strictly to log the node count
        self.get_move_no_pruning(board, checker)
        
        # 2. Run with Alpha-Beta pruning (this handles the actual AI decision)
        best_col = self.get_move_with_pruning(board, checker)
        
        # 3. Print the analytics report
        self.logger.report()
        
        return best_col

    def get_move_with_pruning(self, board, checker):
        """Alpha-Beta search entry point."""
        best_score = -math.inf
        best_col = None
        valid_locations = board.get_valid_columns()
        alpha = -math.inf
        beta = math.inf

        for col in valid_locations:
            board.drop_piece(col, self.piece)
            score = self.minimax(board, checker, self.depth - 1, alpha, beta, False)
            board.undo_move(col)

            if score > best_score:
                best_score = score
                best_col = col
            alpha = max(alpha, best_score)

        if best_col is None and valid_locations:
            best_col = valid_locations[0]
        return best_col

    def get_move_no_pruning(self, board, checker):
        """Plain Minimax search entry point (for comparison only)."""
        valid_locations = board.get_valid_columns()
        for col in valid_locations:
            board.drop_piece(col, self.piece)
            self.minimax_no_pruning(board, checker, self.depth - 1, False)
            board.undo_move(col)

    def minimax(self, board, checker, depth, alpha, beta, maximizing_player):
        """Recursive minimax algorithm WITH alpha-beta pruning."""
        self.logger.nodes_with_pruning += 1  # Log node visit
        
        if checker.check_win(self.piece): return 1000000
        if checker.check_win(self.opponent_piece): return -1000000
        if checker.is_draw(): return 0
        if depth == 0: return Evaluator.evaluate(board, self.piece, self.opponent_piece)

        valid_locations = board.get_valid_columns()

        if maximizing_player:
            value = -math.inf
            for col in valid_locations:
                board.drop_piece(col, self.piece)
                value = max(value, self.minimax(board, checker, depth - 1, alpha, beta, False))
                board.undo_move(col)
                alpha = max(alpha, value)
                if alpha >= beta:
                    break  # Prune branch
            return value
        else:
            value = math.inf
            for col in valid_locations:
                board.drop_piece(col, self.opponent_piece)
                value = min(value, self.minimax(board, checker, depth - 1, alpha, beta, True))
                board.undo_move(col)
                beta = min(beta, value)
                if alpha >= beta:
                    break  # Prune branch
            return value

    def minimax_no_pruning(self, board, checker, depth, maximizing_player):
        """Recursive minimax algorithm WITHOUT alpha-beta pruning."""
        self.logger.nodes_without_pruning += 1  # Log node visit
        
        if checker.check_win(self.piece): return 1000000
        if checker.check_win(self.opponent_piece): return -1000000
        if checker.is_draw(): return 0
        if depth == 0: return Evaluator.evaluate(board, self.piece, self.opponent_piece)

        valid_locations = board.get_valid_columns()

        if maximizing_player:
            value = -math.inf
            for col in valid_locations:
                board.drop_piece(col, self.piece)
                value = max(value, self.minimax_no_pruning(board, checker, depth - 1, False))
                board.undo_move(col)
            return value
        else:
            value = math.inf
            for col in valid_locations:
                board.drop_piece(col, self.opponent_piece)
                value = min(value, self.minimax_no_pruning(board, checker, depth - 1, True))
                board.undo_move(col)
            return value
