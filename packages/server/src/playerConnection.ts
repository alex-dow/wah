import { Socket } from "socket.io";
import { IPlayer } from "@wah/lib/src/models";

export class PlayerConnection  {

  private socket: Socket;
  private player: IPlayer;

  constructor(socket: Socket, player: IPlayer) {
    this.socket = socket;
    this.player = player;
  }
}