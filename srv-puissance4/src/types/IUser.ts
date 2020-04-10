import { Message } from '../entities/Message.entity';
import { Room } from '../entities/Room.entity';
import { Queue } from '../entities/Queue.entity';

export interface IUser {
    /**
     * User id.
     */
    id: number;

    /**
     * User email.
     */
    email?: string;

    /**
     * User password.
     */
    password?: string;

    /**
     * User pseudo.
     */
    pseudo?: string;

    /**
     * User messages.
     */
    messages: Message[];

    /**
     * Current user room.
     */
    room: Room;

    /**
     * Current user queue.
     */
    queue: Queue;
}