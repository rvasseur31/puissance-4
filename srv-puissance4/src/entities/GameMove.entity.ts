import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { IGameMove } from '../types/IGameMove';
import { User } from "./User.entity";
import { Room } from './Room.entity';

/**
 * GameMove entity.
 */
@Entity()
export class GameMove implements IGameMove {
    /**
     * GameMove id.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Id of the user who played.
     */
    @OneToOne(type => User)
    @JoinColumn()
    user_id: User;

    /**
     * Room id.
     */
    @ManyToOne(type => Room, room => room.gameMoves)
    room_id: Room;

    /**
     * User move.
     */
    @Column()
    move: string;
}



