import { expect } from 'chai';
import * as io from 'socket.io-client';

import { CrosswordDynamicService } from './crossword-dynamic-service';
import { CrosswordGamesManager } from './crossword-games-manager';
import { CrosswordMutationManager } from './crossword-mutation-manager';
import { MultiplayerCrosswordGame } from '../../../commun/crossword/multiplayer-crossword-game';

import { INITIAL_COUNTDOWN_VALUE } from '../config';
import { TEST_HOST, TEST_PORT, socketServer } from '../../testing/mock-socket-server';
import { Crossword } from '../../../commun/crossword/crossword';

let dynamicService: CrosswordDynamicService;
let gamesManager: CrosswordGamesManager;
let mutationManager: CrosswordMutationManager;

describe('#CrosswordDynamicService', () => {
    let socket: SocketIOClient.Socket;
    const SOCKET_ID = 'testSocketId';
    const DYNAMIC_GAME_ID = 'dynamicGameId';
    const CLASSIC_GAME_ID = 'classicGameId';
    const DIFFICULTY = 'easy';
    const DYNAMIC_MODE = 'dynamic';
    const CLASSIC_MODE = 'classic';
    const HOST_USERNAME = 'testUser';
    let game: MultiplayerCrosswordGame;

    before(() => {
        dynamicService = CrosswordDynamicService.getInstance();
        gamesManager = CrosswordGamesManager.getInstance();
        mutationManager = CrosswordMutationManager.getInstance();
        socketServer.on('connection',
            (serverSocket: SocketIO.Socket) => {
                serverSocket.join(DYNAMIC_GAME_ID);

                serverSocket.on('disconnect', () => {
                    serverSocket.leave(DYNAMIC_GAME_ID);
                });
            });
    });

    before(async () => {
        game = await gamesManager
            .createGame(DIFFICULTY, DYNAMIC_MODE, HOST_USERNAME, SOCKET_ID);
    });

    beforeEach((done) => {
        socket = io.connect(`${TEST_HOST}:${TEST_PORT}`);
        socket.on('connect', () => {
            done();
        });
    });

    afterEach(() => {
        if (socket.connected) {
            socket.disconnect();
        }
    });

    describe('getInstance()', () => {
        it('should return a singleton', () => {
            expect(CrosswordDynamicService.getInstance())
                .to.equal(CrosswordDynamicService.getInstance());
        });
    });

    describe('startDynamicGame()', () => {

        it('should tell the mutation manager to manage a new dynamic game', () => {
            expect(dynamicService.startDynamicGame(DYNAMIC_GAME_ID, game)).to.be.true;
            expect(mutationManager.getNextMutation(DYNAMIC_GAME_ID).difficulty)
                .to.equal(DIFFICULTY);
        });

        it('should emit the current countdown to players in the game to synchronize their clocks', (done) => {
            socket.on('current countdown', (count: number) => {
                expect(count)
                    .to.equal(game.countdown.count.value);
                done();
            });
        });

        it('should start the countdown of the game', (done) => {
            const previousCount = game.countdown.count.value;
            let capturedCounts = 0;
            game.countdown.count.subscribe((count) => {
                if (capturedCounts === 1) {
                    expect(count).to.not.equal(previousCount);
                    done();
                }
                capturedCounts++;
            });
        });

        it('should not accept a game that is not dynamic', () => {
            const classicGame = new MultiplayerCrosswordGame('', DIFFICULTY, CLASSIC_MODE, HOST_USERNAME, new Crossword());
            expect(
                dynamicService
                    .startDynamicGame(CLASSIC_GAME_ID, classicGame)
            ).to.be.false;
        });
    });

    describe('foundWord()', () => {
        it('should reset the countdown', (done) => {
            let capturedCounts = 0;
            const subscription = game.countdown.count
                .subscribe((count) => {
                    if (capturedCounts === 1) {
                        expect(count)
                            .to.equal(INITIAL_COUNTDOWN_VALUE);
                        subscription.unsubscribe();
                        done();
                    }
                    capturedCounts++;
                });
            const foundWord = game.crossword.wordsWithIndex[0];
            dynamicService.foundWord(DYNAMIC_GAME_ID, game, foundWord);
        });

        it('should tell the mutation manager that a word was found', () => {
            const foundWord = game.crossword.wordsWithIndex[1];

            // Word not marked as found in mutation manager
            expect(
                mutationManager
                    .getNextMutation(DYNAMIC_GAME_ID)
                    .wordsWithIndex
                    .filter((word) => {
                        return word.word === foundWord.word;
                    }).length
            ).to.equal(0);

            dynamicService.foundWord(DYNAMIC_GAME_ID, game, foundWord);

            // Word now found in mutation manager
            expect(
                mutationManager
                    .getNextMutation(DYNAMIC_GAME_ID)
                    .wordsWithIndex
                    .filter((word) => {
                        return word.word === foundWord.word;
                    }).length
            ).to.equal(1);
        });

        it('should emit the next mutated crossword to players in the game', (done) => {
            const foundWord = game.crossword.wordsWithIndex[2];

            socket.on('update mutation', (mutation: Crossword) => {
                expect(mutation.difficulty)
                    .to.equal(DIFFICULTY);
                expect(
                    mutation.wordsWithIndex
                        .filter((word) => {
                            return word.word === foundWord.word;
                        }).length
                ).to.equal(1);
                done();
            });

            dynamicService.foundWord(DYNAMIC_GAME_ID, game, foundWord);
        });
    });

    describe('listenForNewCountdown()', () => {
        before(() => {
            dynamicService.listenForNewCountdown();
        });

        it('should listen for new initial countdown values on sockets, and set them when the game is dynamic', (done) => {
            gamesManager
                .createGame(DIFFICULTY, DYNAMIC_MODE, HOST_USERNAME, socket.id)
                .then((cheatModeGame) => {
                    const newCountdown = 123;
                    expect(cheatModeGame.countdown.initialCountdownValue)
                        .to.equal(INITIAL_COUNTDOWN_VALUE);

                    let capturedCounts = 0;
                    cheatModeGame.countdown.count
                        .subscribe((count: number) => {
                            if (capturedCounts === 1) {
                                expect(cheatModeGame.countdown.initialCountdownValue)
                                    .to.equal(newCountdown);
                                expect(count)
                                    .to.equal(newCountdown);
                                done();
                            }
                            capturedCounts++;
                        });

                    socket.emit('new countdown', newCountdown);
                });
        });
    });
});
