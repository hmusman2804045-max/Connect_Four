"""Board class for Connect Four.

Manages the grid state, renders the board to the console, and handles
gravity/drop logic for pieces.
"""

EMPTY = "."


class Board:
    def __init__(self, rows=6, cols=7):
        self.rows = rows
        self.cols = cols
        # grid[0] is the TOP row, grid[rows-1] is the BOTTOM row
        self.grid = [[EMPTY for _ in range(cols)] for _ in range(rows)]

    def is_valid_column(self, col):
        """A column is playable if it exists and its top cell is empty."""
        return 0 <= col < self.cols and self.grid[0][col] == EMPTY

    def drop_piece(self, col, piece):
        """Drop a piece into a column; it falls to the lowest empty cell.

        Returns the row the piece landed in, or None if the column is
        full or out of range.
        """
        if not self.is_valid_column(col):
            return None
        for row in range(self.rows - 1, -1, -1):
            if self.grid[row][col] == EMPTY:
                self.grid[row][col] = piece
                return row
        return None  # unreachable, but kept for safety

    def is_full(self):
        """True when no column can accept another piece."""
        return all(self.grid[0][col] != EMPTY for col in range(self.cols))

    def get_valid_columns(self):
        return [c for c in range(self.cols) if self.is_valid_column(c)]

    def undo_move(self, col):
        """Remove the top piece from the given column."""
        for row in range(self.rows):
            if self.grid[row][col] != EMPTY:
                self.grid[row][col] = EMPTY
                return

    def render(self):
        """Return the board as a printable string with column numbers."""
        lines = []
        lines.append("")
        lines.append("  " + "   ".join(str(c + 1) for c in range(self.cols)))
        lines.append("+" + "---+" * self.cols)
        for row in self.grid:
            lines.append("| " + " | ".join(row) + " |")
            lines.append("+" + "---+" * self.cols)
        return "\n".join(lines)

    def print_board(self):
        print(self.render())
