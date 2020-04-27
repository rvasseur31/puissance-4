import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, AfterInsert, getConnection, Any } from 'typeorm';
import { IQueue } from "../types/IQueue";
import { User } from './User.entity';
import { isDate } from 'util';
import { Room } from './Room.entity';

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
            const ids: number[] = [this.user.id, usersInQueue[0].user.id];
            this.addUsersIntoRoom(ids);

        }
    }


    public constructor(user_id?: User, created_at?: Date) {
        this.user = user_id;
        this.created_at = created_at;
    }

    addUsersIntoRoom = async (ids: number[]) => {
        const repository = getConnection().manager;
        let users: User[] = await getConnection()
            .getRepository(User)
            .createQueryBuilder("user")
            .where("user.id IN (:ids)", { ids: ids })
            .getMany();
        const newRoom: Room = await repository.save(new Room())
            await getConnection()
                .createQueryBuilder()
                .update(User)
                .set({
                    room: newRoom
                })
                .where("id IN (:ids)", { ids: ids })
                .execute();

        await this.deleteUsersFromQueue(ids);
        return newRoom;
    }

    deleteUsersFromQueue = async (ids: number[]) => {
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Queue)
            .where("userId IN (:ids)", { ids: ids })
            .execute();
    }
}