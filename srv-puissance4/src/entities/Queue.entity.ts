import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IQueue } from "../types/IQueue";
import { User } from './User.entity';

@Entity()
export class Queue implements IQueue {
    /**
     * Queue id.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * User id
     */
    @OneToMany(type => User, user => user.queue)
    users: User[];

    /**
     * User pseudo.
     */
    @Column()
    pseudo: string;

    /**
     * Timestamp when user entered in the queue.
     */
    @Column("datetime")
    created_at: Date;
}