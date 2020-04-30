import { factory } from './utils/ConfigLog4j';
import WebSocket from 'ws';
import { Queue } from './entities/Queue.entity';
import { User } from './entities/User.entity';
import * as http from "http";
import { getManager, getConnection } from 'typeorm';

/**
 * Logger.
 */
const LOGGER = factory.getLogger("SocketServer");

export class SocketServer {

    private participants: any[] = [];

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
                    this.participants.push({ pseudo: json["sender_pseudo"], id: json["sender_id"], ws: ws });
                    json["participants"] = this.participants;
                    this.broadcastSocket(JSON.stringify(json));
                    this.addUserToQueue(json["sender_id"]);
                } 
                else if (json.action == "participant-left") {
                    console.log(json);
                    this.participants = this.participants.filter(participant => participant !== json["sender_pseudo"]);
                    json["participants"] = this.participants;
                    this.broadcastSocket(JSON.stringify(json));
                    this.userLeave(json.sender_id, json.roomId);
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

            ws.on("close", () => {
                console.log("closed");
            })
        });
    }

    private broadcastSocket = (message: string) => {
        LOGGER.debug("Broadcast on global participants");
        this.participants.forEach((client) => {
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

    addUserToRoom = (roomId: number, ids: number[]) => {
        LOGGER.debug("New room created, users are added !")
        for (let index = 0; index < ids.length; index++) {
            let user = this.participants.find(x => x.id === ids[index]);
            user.ws.send(JSON.stringify({ "action": "new-room", "roomId": roomId }));
            // Add user in room
            this.rooms[roomId] ? this.rooms[roomId].push(user) : this.rooms[roomId] = [user];
            // Remove user of global participant
            this.participants.splice(this.participants.findIndex(function(i){
                return i.id === ids[index];
            }), 1);
        }
    }

    private userLeave = async (userId: number, roomId: number) => {
        delete this.rooms[roomId];
        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ roomId: null })
            .where("id = :id", { id: userId })
            .execute();
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Queue)
            .where("userId = :userId", { userId: userId })
            .execute();

    }

    private newMessageInRoom = (roomId: number, message: String) => {
        //const preNewMessage: Message = new Message()
    }
}