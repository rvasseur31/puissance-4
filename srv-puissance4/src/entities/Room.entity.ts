import { IRoom } from '../types/IRoom';
import { OneToMany, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameMove } from './GameMove.entity';
import { User } from './User.entity';
import { Participant } from './Participant';

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
    @Column({ nullable: true })
    who_win: string;

    /**
     * List of users moves
     */
    @OneToMany(type => GameMove, gameMove => gameMove.room)
    gameMoves: GameMove[]

    /**
     * List of participants.
     */
    private participants: Participant[] = [];

    /**
     * Board of the game, two dimentinal array.
     */
    private board: number[][] = [];

    /**
     * Number of move
     */
    private numberOfMove:number = 0;

    /**
     * Constructor.
     */
    constructor() {
        for (let i = 0; i < 6; i++) {
            let row: number[] = [];
            for (let j = 0; j < 7; j++) {
                row.push(0)
            }
            this.board.push(row);
        }
    }

    get getParticipants() {
        return this.participants;
    }

    get getBoard() {
        return this.board;
    }

    public restartGame = () => {
        this.board = [];
        for (let i = 0; i < 6; i++) {
            let row: number[] = [];
            for (let j = 0; j < 7; j++) {
                row.push(0)
            }
            this.board.push(row);
        }
        this.numberOfMove = 0;
    }

    public addNewParticipantIntoTheRoom = (roomId: number, participant: Participant): void => {
        // Add participant in room
        this.participants.push(participant);
    }

    public sendSocketToParticipants = (action: String) => {
        for (let index = 0; index < this.participants.length; index++) {
            this.participants[index].ws.send(action);
        }
    }

}