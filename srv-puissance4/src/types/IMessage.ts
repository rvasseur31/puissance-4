import { Room } from '../entities/Room.entity';
import { User } from '../entities/User.entity';

export interface IMessage {
    /**
     * Message id.
     */
    id?: number;

    /**
     * Room id.
     */
    room_id: Room;

    /**
     * Id of the user who sent the message.
     */
    user_id: User;

    /**
     * Message.
     */
    message: string;

    /**
     * Timestamp when user sent the message.
     */
    send_at: Date;
}