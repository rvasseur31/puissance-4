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
    room_id: Room;

    /**
     * User who played.
     */
    user_id: User;

    /**
     * Move.
     */
    move: string;
}