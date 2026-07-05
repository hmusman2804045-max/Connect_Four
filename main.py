"""Connect Four — two-player console game.

Run with:  python main.py
Players take turns entering a column number (1-7). First to connect
four in a row (horizontally, vertically, or diagonally) wins.
"""

from board import Board
from win_checker import WinChecker
from minimax_agent import MinimaxAgent
from logger import Logger

PLAYER_PIECES = {1: "X", 2: "O"}


def get_column_choice(player, board):
    """Prompt until the player enters a valid, non-full column."""
    while True:
        raw = input(f"Player {player} ({PLAYER_PIECES[player]}), choose a column (1-{board.cols}): ").strip()
        if not raw.isdigit():
            print("Please enter a number.")
            continue
        col = int(raw) - 1
        if col < 0 or col >= board.cols:
            print(f"Column must be between 1 and {board.cols}.")
            continue
        if not board.is_valid_column(col):
            print("That column is full. Pick another one.")
            continue
        return col


def play():
    board = Board()
    checker = WinChecker(board)
    logger = Logger()
    current_player = 1
    
    ai_agent = MinimaxAgent(piece=PLAYER_PIECES[2], opponent_piece=PLAYER_PIECES[1], logger=logger, depth=5)

    print("=" * 40)
    print("        CONNECT FOUR")
    print("=" * 40)
    board.print_board()

    while True:
        piece = PLAYER_PIECES[current_player]
        
        if current_player == 1:
            col = get_column_choice(current_player, board)
        else:
            print(f"Player {current_player} (AI) is thinking...")
            col = ai_agent.get_best_move(board, checker)
            print(f"AI chooses column {col + 1}")
            
        board.drop_piece(col, piece)
        board.print_board()

        if checker.check_win(piece):
            print(f"\nPlayer {current_player} ({piece}) wins! Connect four!")
            return
        if checker.is_draw():
            print("\nIt's a draw — the board is full!")
            return

        current_player = 2 if current_player == 1 else 1


def main():
    while True:
        play()
        replay = input("\nPlay again? (y/n): ").strip().lower()
        if replay != 'y':
            print("Thanks for playing!")
            break

if __name__ == "__main__":
    main()
