import { fakeAsync, tick, TestBed } from '@angular/core/testing';
import { GameManagerService } from './crossword-game-manager.service';
import { GameManagerServicePlayer1 } from './crossword-game-manager-player1.service';
import { GameManagerServicePlayer2 } from './crossword-game-manager-player2.service';
import { SocketHandlerSerivce } from './crossword-socket-handler.service';
import { Player } from '../../../../commun/crossword/player';
import * as io from 'socket.io-client';

let gameManagerService1: GameManagerServicePlayer1;
let gameManagerService2: GameManagerServicePlayer2;
const HOST_NAME = 'http://' + window.location.hostname;
const SERVER_PORT = ':3000';
const clientSocket1: SocketIOClient.Socket = io.connect(HOST_NAME + SERVER_PORT, { forceNew: true });
const clientSocket2: SocketIOClient.Socket = io.connect(HOST_NAME + SERVER_PORT, { forceNew: true });


describe('GameManagerService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GameManagerService,
                SocketHandlerSerivce,
                GameManagerServicePlayer1,
                GameManagerServicePlayer2
            ]
        });
        gameManagerService1 = TestBed.get(GameManagerServicePlayer1);
        gameManagerService1.socket = clientSocket1;
        gameManagerService2 = TestBed.get(GameManagerServicePlayer2);
        gameManagerService2.socket = clientSocket2;
    });

    it('client 1 should be created', () => {
        expect(gameManagerService1).toBeDefined();
    });

    it('client 2 should be created', () => {
        expect(gameManagerService2).toBeDefined();
    });

    it('client 1 should be connected', () => {
        expect(gameManagerService1.connectionStatus()).toBeTruthy();
    });

    it('client 2 should be connected', () => {
        expect(gameManagerService2.connectionStatus()).toBeTruthy();
    });

    it('client 1 and 2 should have different connections', () => {
        expect(gameManagerService1.socket.id === gameManagerService2.socket.id).toBeFalsy();
    });

    /*it('client should be able to create a multiplayer game', (done) => {
        const player1 = new Player();
        player1.socketID = gameManagerService1.socket.id;
        gameManagerService1.createGame('multiplayer', 'easy', 'classic', player1);
        setTimeout(function () {
            expect(gameManagerService1.getGame().id === '-1').toBeFalsy();
            done();
        }, 2000);
    });*/

   /* it('client 2 should be able to join created game', (done) => {
        const player1 = new Player();
        player1.socketID = gameManagerService1.socket.id;
        gameManagerService1.createGame('multiplayer', 'easy', 'classic', player1);
        setTimeout(function () {
            const player2 = new Player();
            player2.socketID = gameManagerService2.socket.id;
            gameManagerService2.joinGame(gameManagerService1.getGame().id, player2);
            expect(gameManagerService1.getGame().option).toEqual('multiplayer');
            done();
        }, 1000);
    });*/

});