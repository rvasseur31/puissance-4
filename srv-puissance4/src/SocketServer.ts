import { factory } from './utils/ConfigLog4j';
import WebSocket from 'ws';
import { Queue } from './entities/Queue.entity';
import { User } from './entities/User.entity';
import * as http from "http";
import { getManager, getConnection } from 'typeorm';
import { Participant } from './entities/Participant';

/**
 * Logger.
 */
const LOGGER = factory.getLogger("SocketServer");

export class SocketServer {
    private participantsInQueue: Participant[] = [];

    private rooms: any = {};

    private wss: WebSocket.Server;

    /**
     * SocketServer instance.
     */
    private static INSTANCE: SocketServer;

    /**
     * Private constructor.
     */
    private constructor(server: http.Server) {
        this.wss = new WebSocket.Server({ server });
        this.listen();
    }

    /**
     * Singleton instance accessor.
     */
    public static getInstance(server: http.Server): SocketServer {
        if (this.INSTANCE == null) {
            this.INSTANCE = new SocketServer(server);
        }
        return this.INSTANCE;
    }

    public static getCurrentInstance(): SocketServer {
        return this.INSTANCE;
    }

    /**
     * shut down the user management service.
     */
    public static shutDownService(): void {
        this.INSTANCE = null;
        LOGGER.info(this.constructor.name + " : shutted down");
    }

    private listen(): void {
        this.wss.on('connection', (ws: any) => {
            ws.on('message', (message: string) => {
                let json = JSON.parse(message);
                if (json.action == "new-participant") {
                    this.participantsInQueue.push(new Participant(json["sender_pseudo"], json["sender_id"], ws));
                    json["participants"] = this.participantsInQueue;
                    this.broadcastSocket(JSON.stringify(json));
                    this.addUserToQueue(json["sender_id"]);
                }
                else if (json.action == "participant-left") {
                    console.log(json);
                    this.participantsInQueue = this.participantsInQueue.filter(participant => participant.pseudo != json["sender_pseudo"]);
                    this.userLeave(json.sender_id, json.roomId);
                    json["participants"] = this.participantsInQueue;
                    this.broadcastSocket(JSON.stringify(json));
                    ws.close();
                }
                else if (json.action == "new-message") {
                    if (json.roomId) {
                        for (let index = 0; index < this.rooms[json.roomId].length; index++) {
                            this.rooms[json.roomId][index].ws.send(JSON.stringify(json))
                        }
                    }
                    else {
                        this.broadcastSocket(message);
                    }
                }
            });
        });
    }

    private broadcastSocket = (message: string) => {
        LOGGER.debug("Broadcast on global participantsInQueue");
        this.participantsInQueue.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }

    private addUserToQueue = async (id: number) => {
        LOGGER.debug("Add the user into the queue")
        const repository = getManager();
        const currentUser: User = await repository.findOne(User, id);
        const preUserToQueue: Queue = new Queue(currentUser, new Date());
        const newUserToQueue: Queue = await repository.save(preUserToQueue)
        return newUserToQueue;
    }

    addUserToRoom = (roomId: number, idsOfPlayers: number[]) => {
        LOGGER.debug("New room created, users are added !")
        for (let index = 0; index < idsOfPlayers.length; index++) {
            let user = this.participantsInQueue.find((participant: Participant) => participant.id === idsOfPlayers[index]);
            user.ws.send(JSON.stringify({ "action": "new-room", "roomId": roomId }));
            // Add user in room
            this.rooms[roomId] ? this.rooms[roomId].push(user) : this.rooms[roomId] = [user];
            // Remove user of global participant
            this.participantsInQueue.splice(this.participantsInQueue.findIndex(function (participant) {
                return participant.id === idsOfPlayers[index];
            }), 1);
        }
        console.log("Mes rooms :")
        console.log(this.rooms);
    }

    private userLeave = async (userId: number, roomId: number) => {
        // Put the other user into queue in ram
        this.participantsInQueue.push(this.rooms[roomId].find((participant: Participant) => participant.id !== userId));
        // Delete the room in ram
        delete this.rooms[roomId];
        // Remove the user of the room in database (update roomId of User table)
        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ roomId: null })
            .where("id = :id", { id: userId })
            .execute();
        // Get the other participant of the room
        let otherParticipant: User = await getConnection().getRepository(User).findOne({
            roomId: roomId
        });
        // Set roomId as null
        otherParticipant.roomId = null;
        // Save
        otherParticipant = await getConnection().getRepository(User).save(otherParticipant);
        // Add him into queue
        this.addUserToQueue(otherParticipant.id)
        // Remove user from queue table
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Queue)
            .where("userId = :userId", { userId: userId })
            .execute();
    }
}