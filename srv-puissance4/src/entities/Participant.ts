export class Participant {
    /**
     * Participant's pseudo.
     */
    pseudo: String;

    /**
     * Participant's id.
     */
    id: Number;

    /**
     * Participant's websocket information.
     */
    ws: any;

    constructor(pseudo: String, id:Number, ws:any) {
        this.id = id;
        this.pseudo = pseudo;
        this.ws = ws;
    }
}