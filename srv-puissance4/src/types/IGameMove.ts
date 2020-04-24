import { Room } from '../entities/Room.entity';
import { User } from '../entities/User.entity';

export interface IGameMove {
    /**
     * Game id.
     */
    id?: number;

    /**
     * Room id.
     */
    room: Room;

    /**
     * User who played.
     */
    user: User;

    /**
     * Move.
     */
    move: string;
}