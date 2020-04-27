import { IRoom } from '../types/IRoom';
import { Message } from './Message.entity';
import { OneToMany, OneToOne, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameMove } from './GameMove.entity';
import { User } from './User.entity';

@Entity()
export class Room implements IRoom {
    /**
     * Room id.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Players in the room.
     */
    @OneToMany(type => User, user => user.room)
    users: User[];

    /**
     * To know who win [1, 2, N, NULL]
     */
    @Column({ nullable: true})
    who_win: string;

    /**
     * Messages of the room.
     */
    @OneToMany(type => Message, message => message.room)
    messages: Message[]

    /**
     * List of users moves
     */
    @OneToMany(type => GameMove, gameMove => gameMove.room)
    gameMoves: GameMove[]

}