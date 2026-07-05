"""WinChecker class for Connect Four.

Detects horizontal, vertical, and diagonal four-in-a-row wins, plus draws.
"""

from board import EMPTY

CONNECT = 4


class WinChecker:
    def __init__(self, board):
        self.board = board

    def check_win(self, piece):
        """True if `piece` has four in a row in any direction."""
        return (
            self._check_horizontal(piece)
            or self._check_vertical(piece)
            or self._check_diagonal_down_right(piece)
            or self._check_diagonal_up_right(piece)
        )

    def is_draw(self):
        """True when the board is full (call after checking for a win)."""
        return self.board.is_full()

    def _check_horizontal(self, piece):
        grid = self.board.grid
        for row in range(self.board.rows):
            for col in range(self.board.cols - CONNECT + 1):
                if all(grid[row][col + i] == piece for i in range(CONNECT)):
                    return True
        return False

    def _check_vertical(self, piece):
        grid = self.board.grid
        for col in range(self.board.cols):
            for row in range(self.board.rows - CONNECT + 1):
                if all(grid[row + i][col] == piece for i in range(CONNECT)):
                    return True
        return False

    def _check_diagonal_down_right(self, piece):
        r"""Diagonals going down-right (\) as row and column both increase."""
        grid = self.board.grid
        for row in range(self.board.rows - CONNECT + 1):
            for col in range(self.board.cols - CONNECT + 1):
                if all(grid[row + i][col + i] == piece for i in range(CONNECT)):
                    return True
        return False

    def _check_diagonal_up_right(self, piece):
        """Diagonals going up-right (/) as row decreases while column increases."""
        grid = self.board.grid
        for row in range(CONNECT - 1, self.board.rows):
            for col in range(self.board.cols - CONNECT + 1):
                if all(grid[row - i][col + i] == piece for i in range(CONNECT)):
                    return True
        return False
