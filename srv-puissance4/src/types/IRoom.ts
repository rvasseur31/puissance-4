import { User } from '../entities/User.entity';
import { GameMove } from '../entities/GameMove.entity';

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
     * Char [user_id, N, NULL]
     */
    who_win: string;

    /**
     * List of users moves
     */
    gameMoves: GameMove[]
}