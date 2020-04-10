import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { IMessage } from '../types/IMessage';
import { User } from './User.entity';
import { Room } from './Room.entity';

/**
 * GameMove entity.
 */
@Entity()
export class Message implements IMessage {
    /**
     * Message id.
     */
    @PrimaryGeneratedColumn()
    id?: number;

    /**
     * Room id.
     */
    @ManyToOne(type => Room, room => room.messages)
    room_id: Room;

    /**
     * Id of the user who sent the message.
     */
    @ManyToOne(type => User, user => user.messages)
    user_id: User;

    /**
     * Message.
     */
    @Column({type: "longtext"})
    message: string;

    /**
     * Timestamp when user sent the message.
     */
    @Column({type: "datetime"})
    send_at: Date;
}