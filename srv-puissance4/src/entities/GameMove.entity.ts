import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
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
    @ManyToOne(type => User, user => user.gameMoves)
    user: User;

    /**
     * Room id.
     */
    @ManyToOne(type => Room, room => room.gameMoves)
    room: Room;

    /**
     * User move.
     */
    @Column()
    move: number;

    /**
     * Constructor.
     */
    constructor(user:User, room:Room, col:number) {
        this.user = user;
        this.room = room;
        this.move = col;
    }
}



