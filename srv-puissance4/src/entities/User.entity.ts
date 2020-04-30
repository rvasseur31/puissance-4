import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { IUser } from '../types/IUser'
import { Room } from './Room.entity';
import { Message } from './Message.entity';
import { Queue } from './Queue.entity';

/**
 * User entity.
 */
@Entity()
export class User implements IUser {
    /**
     * User id.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * User email.
     */
    @Column({ unique: true })
    email: string;

    /**
     * User password.
     */
    @Column()
    password: string;

    /**
     * User pseudo.
     */
    @Column({ unique: true })
    pseudo: string;

    /**
     * User messages.
     */
    @OneToMany(type => Message, message => message.user, {
        nullable: true
    })
    messages: Message[];


    @Column({ nullable: true })
    roomId: number;

    /**
     * Current user room.
     */
    @ManyToOne(type => Room, room => room.users, {
        nullable: true
    })
    @JoinColumn()
    room: Room;

    /**
     * Constructor.
     * 
     * @param id: user's id.
     * @param email user's email.
     * @param password user's password.
     * @param pseudo user's pseudo.
     */
    public constructor(email?: string, password?: string, pseudo?: string) {
        this.email = email;
        this.password = password;
        this.pseudo = pseudo;
    }
}



