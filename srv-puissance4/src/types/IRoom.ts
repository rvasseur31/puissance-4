import { User } from '../entities/User.entity';
import { GameMove } from '../entities/GameMove.entity';
import { Message } from '../entities/Message.entity';

export interface IRoom {
    /**
     * Room id.
     */
    id: number;

    /**
     * Users id.
     */
    users: User[];

    /**
     * True if the game is finish
     */
    is_end: boolean;
    
    /**
     * Char [1, 2, N, NULL]
     */
    who_win: string;

    /**
     * Messages of the room.
     */
    messages: Message[]

    /**
     * List of users moves
     */
    gameMoves: GameMove[]
}