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
    room: Room;

    /**
     * Id of the user who sent the message.
     */
    user: User;

    /**
     * Message.
     */
    message: string;

    /**
     * Timestamp when user sent the message.
     */
    send_at: Date;
}