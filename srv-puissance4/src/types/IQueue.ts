import { User } from '../entities/User.entity';

export interface IQueue {
    /**
     * Queue id.
     */
    id: number;

    /**
     * User id
     */
    user: User;

    /**
     * Timestamp when user entered in the queue.
     */
    created_at: Date;
}