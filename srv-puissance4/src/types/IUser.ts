import { Room } from '../entities/Room.entity';

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
     * Current user room.
     */
    room: Room;
}