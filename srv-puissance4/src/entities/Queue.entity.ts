import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, AfterInsert, getConnection } from 'typeorm';
import { IQueue } from "../types/IQueue";
import { User } from './User.entity';
import { isDate } from 'util';

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
    @OneToOne(type => User)
    @JoinColumn()
    user: User;

    /**
     * Timestamp when user entered in the queue.
     */
    @Column("datetime")
    created_at: Date;

    @AfterInsert()
    async searchForOthersPlayers() {
        const usersInQueue: Queue[] = await getConnection()
            .getRepository(Queue)
            .createQueryBuilder("queue")
            .select('queue')
            .addSelect(['user.id', 'user.pseudo'])
            .innerJoin("queue.user", "user")
            .getMany();
        if (usersInQueue.length) {

        }
    }


    public constructor(user_id?: User, created_at?: Date) {
        this.user = user_id;
        this.created_at = created_at;
    }

    addUsersIntoRoom = async (ids: number[]) => {
        const repository = getConnection().manager;
        let users: User[];
        for (let index = 0; index < ids.length; index++) {
            users.push(await repository.findOne(User, ids[index]));
        } 
        // const preUserToQueue: Queue = new Queue(currentUser, new Date());
        // const newUserToQueue: Queue = await repository.save(preUserToQueue)
        // return newUserToQueue;
    }
}