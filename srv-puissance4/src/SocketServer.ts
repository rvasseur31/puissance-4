import { factory } from './utils/ConfigLog4j';
import WebSocket from 'ws';
import { Queue } from './entities/Queue.entity';
import { User } from './entities/User.entity';
import * as http from "http";
import { getManager, getConnection } from 'typeorm';
import { Participant } from './entities/Participant';
import { Room } from './entities/Room.entity';
import { GameLogic } from './services/GameLogic';

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
                    this.participantsInQueue = this.participantsInQueue.filter(participant => participant.pseudo != json["sender_pseudo"]);
                    this.userLeave(json.sender_id, json.roomId);
                    json["participants"] = this.participantsInQueue;
                    this.broadcastSocket(JSON.stringify(json));
                    ws.close();
                }
                else if (json.action == "new-message") {
                    if (json.roomId) {
                        this.rooms[json.roomId].sendSocketToParticipants(JSON.stringify(json));
                    }
                    else {
                        this.broadcastSocket(message);
                    }
                } else if (json.action == "new-move") {
                    if (json.roomId) {
                        let gameLogic = GameLogic.getInstance(this.rooms);
                        if (gameLogic.makeMove(json.roomId, parseInt(json.message), json.sender_id)) {
                            this.rooms[json.roomId].sendSocketToParticipants(JSON.stringify({action: "new-move", "board": this.rooms[json.roomId].getBoard}));
                        } else {
                            this.rooms[json.roomId].sendSocketToParticipants(JSON.stringify({action: "new-move"}));
                        }
                    }
                } else if (json.action == "end-game") {
                    if (json.roomId) {
                        this.rooms[json.roomId].sendSocketToParticipants(JSON.stringify({ action: "end-game", status: "Victoire du joueur 1" }));
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

    private userLeave = async (userId: number, roomId: number) => {
        console.log("My roomId : " + roomId);
        if (roomId) {
            let otherParticipantInRam: Participant = this.rooms[roomId].getParticipants.find((participant: Participant) => participant.id !== userId);
            // Put the other user into queue in ram
            this.participantsInQueue.push(otherParticipantInRam);
            // Send socket to put roomId to NULL
            otherParticipantInRam.ws.send(JSON.stringify({ action: "leave-room" }))
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
        }
        // Remove user from queue table
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Queue)
            .where("userId = :userId", { userId: userId })
            .execute();
    }

    addUserToRoom = (roomId: number, idsOfPlayers: number[]) => {
        LOGGER.debug("New room created, users are added !");
        let room: Room = new Room();
        for (let index = 0; index < idsOfPlayers.length; index++) {
            let participant = this.participantsInQueue.find((participant: Participant) => participant.id === idsOfPlayers[index]);
            participant.ws.send(JSON.stringify({ "action": "new-room", "roomId": roomId }));
            room.addNewParticipantIntoTheRoom(roomId, participant);
            // Remove participant of global participant
            this.participantsInQueue.splice(this.participantsInQueue.findIndex(function (participant) {
                return participant.id === idsOfPlayers[index];
            }), 1);
        }
        this.rooms[roomId] = room;
        console.log(this.rooms);

    }
}



/// Test Game Logic
// this.rooms = {
//     "1": new Room()
// }
// console.log("Room created")
// console.log(this.rooms[1].getBoard)
// let gameLogic = GameLogic.getInstance(this.rooms);
// gameLogic.makeMove(1, 0, 1)
// console.log(gameLogic.checkForWin(1));
// gameLogic.makeMove(1, 0, 1)
// console.log(gameLogic.checkForWin(1));
// gameLogic.makeMove(1, 0, 1)
// console.log(gameLogic.checkForWin(1));
// gameLogic.makeMove(1, 0, 1)
// console.log(gameLogic.checkForWin(1));
// console.log("Move :")
// console.log(this.rooms[1].getBoard);