import { User } from '../entities/User.entity';

export interface IQueue {
    /**
     * Queue id.
     */
    id: number;

    /**
     * User id
     */
    users: User[];

    /**
     * User pseudo.
     */
    pseudo: string;

    /**
     * Timestamp when user entered in the queue.
     */
    created_at: Date;
}