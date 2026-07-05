export const EMPTY = ".";
export const PLAYER = "X";
export const AI = "O";

/** Row a piece would land in if dropped in `col`, or -1 if the column is full. */
export function findLandingRow(grid, col) {
  for (let r = grid.length - 1; r >= 0; r--) {
    if (grid[r][col] === EMPTY) return r;
  }
  return -1;
}

/** The four [row, col] cells of a connect-four for `piece`, or [] if none. */
export function findWinningCells(grid, piece) {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down-right
    [-1, 1], // diagonal up-right
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of directions) {
        const cells = [];
        for (let i = 0; i < 4; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (rr < 0 || rr >= rows || cc >= cols || grid[rr][cc] !== piece) break;
          cells.push([rr, cc]);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return [];
}
