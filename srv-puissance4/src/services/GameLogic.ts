import { factory } from "../utils/ConfigLog4j";

/**
 * Logger.
 */
const LOGGER = factory.getLogger("GameLogic");

/**
 * Game Logic
 * Handle all game treatment.
 */
export class GameLogic {
    /**
     * GameLogic instance.
     */
    private static INSTANCE: GameLogic;

    /**
     * All Rooms
     */
    private rooms: any = {};

    /**
     * Private constructor.
     */
    private constructor(rooms: any) {
        this.rooms = rooms
    }

    /**
     * Singleton instance accessor.
     */
    public static getInstance(rooms: any): GameLogic {
        if (this.INSTANCE == null) {
            this.INSTANCE = new GameLogic(rooms);
        }
        return this.INSTANCE;
    }

    /**
     * Shut down game logic.
     */
    public static shutDownService(): void {
        this.INSTANCE = null;
        LOGGER.info(this.constructor.name + " : shutted down");
    }

    makeMove = (roomId: number, col: number, userId: number) => {
        let board = this.rooms[roomId].board;
        let move_made = false;
        for (let i = board.length - 1; i >= 0; i--) {
            if (board[i][col] == 0) {
                board[i][col] = userId;
                move_made = true;
                break;
            }
        }
        this.rooms[roomId].numberOfMove++;
        return move_made;
    }

    checkForWin = (roomId: number) => {
        let board = this.rooms[roomId].board;
        let found = 0;
        let winner_coins = [];
        let winner = 0;
        let person = 0;
        /*horizontal*/
        for (let row = 0; row < board.length; row++) {
            if (winner) break;
            found = 0;
            person = 0;
            for (let col = 0; col < board[row].length; col++) {
                let selected = board[row][col];
                if (selected !== 0) found = (person != selected) ? 1 : found + 1;
                person = selected;
                if (found >= 4) {
                    winner = person;
                    for (let k = 0; k < 4; k++) {
                        winner_coins[k] = row + '' + (col - k);
                    }
                }
                if ((col > 2 && found == 0) || found >= 4) break;
            }
        }
        /*vertical*/
        if (!winner) {
            for (let col = 0; col < board[0].length; col++) {
                if (winner) break;
                found = 0;
                person = 0;
                for (let row = 0; row < board.length; row++) {
                    let selected = board[row][col];
                    if (selected !== 0) found = (person != selected) ? 1 : found + 1;
                    person = selected;
                    if (found >= 4) {
                        winner = person;
                        for (let k = 0; k < 4; k++) {
                            winner_coins[k] = (row - k) + '' + col;
                        }
                    }
                    if ((row > 1 && found == 0) || found >= 4) break;
                }
            }
        }
        /*diagonal left-up->right*/
        if (!winner) {
            for (let col = 0; col < board[0].length - 3; col++) {
                if (winner) break;
                for (let row = 0; row < board.length - 3; row++) {
                    let firstValue = board[row][col];
                    if (firstValue == 0) continue;
                    if (firstValue === board[row + 1][col + 1] &&
                        firstValue === board[row + 2][col + 2] &&
                        firstValue === board[row + 3][col + 3]) {
                        winner = firstValue;
                        winner_coins = [row + '' + col, (row + 1) + '' + (col + 1), (row + 2) + '' + (col + 2), (row + 3) + '' + (col + 3)];
                        break;
                    }
                }
            }
        }
        /*diagonal right-up->left*/
        if (!winner) {
            for (let col = board[0].length - 1; col > 2; col--) {
                if (winner) break;
                for (let row = 0; row < board.length - 3; row++) {
                    let firstValue = board[row][col];
                    if (firstValue == 0) continue;
                    if (firstValue === board[row + 1][col - 1] &&
                        firstValue === board[row + 2][col - 2] &&
                        firstValue === board[row + 3][col - 3]) {
                        winner = firstValue;
                        winner_coins = [row + '' + col, (row + 1) + '' + (col - 1), (row + 2) + '' + (col - 2), (row + 3) + '' + (col - 3)];
                        break;
                    }
                }
            }
        }
        /*Check if null game */
        if (this.rooms[roomId].numberOfMove == 42) return -1;
        if (winner) return winner;
        return 0;
    }

}
