from board import EMPTY

class Evaluator:
    @staticmethod
    def evaluate(board, piece, opponent_piece):
        """
        Calculates a heuristic score for the current board state.
        Positive scores favor the AI, negative scores favor the opponent.
        """
        score = 0

        # 1. Center column control (center pieces are most valuable)
        center_array = [int(board.grid[r][board.cols // 2] == piece) for r in range(board.rows)]
        center_count = sum(center_array)
        score += center_count * 3

        # 2. Score Horizontal
        for r in range(board.rows):
            row_array = board.grid[r]
            for c in range(board.cols - 3):
                window = row_array[c:c+4]
                score += Evaluator.evaluate_window(window, piece, opponent_piece)

        # 3. Score Vertical
        for c in range(board.cols):
            col_array = [board.grid[r][c] for r in range(board.rows)]
            for r in range(board.rows - 3):
                window = col_array[r:r+4]
                score += Evaluator.evaluate_window(window, piece, opponent_piece)

        # 4. Score Positive Diagonal (/)
        # Using the same traversal as WinChecker but looking at windows
        for r in range(board.rows - 3):
            for c in range(board.cols - 3):
                # We need to construct the window correctly. 
                # (row+3, col) going up-right to (row, col+3)
                window = [board.grid[r+3-i][c+i] for i in range(4)]
                score += Evaluator.evaluate_window(window, piece, opponent_piece)

        # 5. Score Negative Diagonal (\)
        for r in range(board.rows - 3):
            for c in range(board.cols - 3):
                # (row, col) going down-right to (row+3, col+3)
                window = [board.grid[r+i][c+i] for i in range(4)]
                score += Evaluator.evaluate_window(window, piece, opponent_piece)

        return score

    @staticmethod
    def evaluate_window(window, piece, opponent_piece):
        """Scores a 4-slot window based on how close it is to a Connect Four."""
        score = 0
        piece_count = window.count(piece)
        empty_count = window.count(EMPTY)
        opp_count = window.count(opponent_piece)

        # Offensive scoring
        if piece_count == 4:
            score += 1000000
        elif piece_count == 3 and empty_count == 1:
            score += 50  # Very strong offensive position
        elif piece_count == 2 and empty_count == 2:
            score += 10  # Building block

        # Defensive scoring (blocking opponent)
        if opp_count == 3 and empty_count == 1:
            score -= 80  # Must heavily penalize if opponent is 1 move away from winning

        return score
