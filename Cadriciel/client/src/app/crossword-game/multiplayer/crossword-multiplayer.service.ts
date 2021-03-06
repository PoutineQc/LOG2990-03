import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CrosswordSocketService } from '../socket/crossword-socket.service';
import { CrosswordPlayerService } from '../player/crossword-player.service';

import { Word } from '../../../../../commun/word';
import { MultiplayerCrosswordGame } from '../../../../../commun/crossword/multiplayer-crossword-game';
import { Crossword } from '../../../../../commun/crossword/crossword';

@Injectable()
export class CrosswordMultiplayerService {
    public gameStartSubject: Subject<any>;
    public opponentHintSelection: Subject<any>;
    public opponentFoundWord: Subject<any>;
    public opponentDeselection: Subject<any>;
    public serverClock: Subject<number>;
    public opponentLeft: Subject<any>;
    public opponentRestarted: Subject<any>;
    public mutation: Subject<Crossword>;
    public listeningOnSockets: boolean;

    constructor(
        private socketService: CrosswordSocketService,
        private playerService: CrosswordPlayerService
    ) {
        this.initializeObservableSubjects();
        this.listenToSocketRequests();
    }

    private initializeObservableSubjects(): void {
        this.gameStartSubject = new Subject();
        this.opponentHintSelection = new Subject();
        this.opponentFoundWord = new Subject();
        this.opponentDeselection = new Subject();
        this.serverClock = new Subject();
        this.opponentLeft = new Subject();
        this.opponentRestarted = new Subject();
        this.mutation = new Subject();
    }

    private listenToSocketRequests(): void {
        this.socketService.socket.on(
            'game started',
            this.handleGameStart.bind(this)
        );
        this.socketService.socket.on(
            'opponent selected a hint',
            this.handleOpponentHintSelection.bind(this)
        );
        this.socketService.socket.on(
            'opponent found a word',
            this.handleOpponentFoundWord.bind(this)
        );
        this.socketService.socket.on(
            'opponent unselected all',
            this.handleOpponentDeselectAll.bind(this)
        );
        this.socketService.socket.on(
            'current countdown',
            this.handleServerCountdown.bind(this)
        );
        this.socketService.socket.on(
            'opponent left',
            this.handleOpponentLeft.bind(this)
        );
        this.socketService.socket.on(
            'opponent restarted game',
            this.handleOpponentRestartedGame.bind(this)
        );
        this.socketService.socket.on(
            'update mutation',
            this.handleMutation.bind(this)
        );
        this.listeningOnSockets = true;
    }

    public gameStartAlerts(): Observable<any> {
        return this.gameStartSubject.asObservable();
    }

    public opponentHintSelectionAlerts(): Observable<any> {
        return this.opponentHintSelection.asObservable();
    }

    public opponentFoundWordAlerts(): Observable<any> {
        return this.opponentFoundWord.asObservable();
    }

    public opponentDeselectedAllAlerts(): Observable<any> {
        return this.opponentDeselection.asObservable();
    }

    public opponentLeftAlerts(): Observable<any> {
        return this.opponentLeft.asObservable();
    }

    public serverClockAlerts(): Observable<any> {
        return this.serverClock.asObservable();
    }

    public createGame(difficulty: string, mode: string): boolean {
        if (!this.playerService.isHost) {
            this.playerService.isHost = true;
            this.socketService.socket.emit(
                'create game', difficulty, mode, this.playerService.username
            );
            return true;
        }
        return false;
    }

    public emitLeavingGame(): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('leaveGame');
            return true;
        }
        return false;
    }

    public emitRestartGame(difficulty: string, mode: string): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit(
                'restart game', difficulty, mode, this.playerService.username
            );
            return true;
        }
        return false;
    }

    public emitSelectHint(
        hintSelection: { 'previous': string, 'current': Word }
    ): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('selected hint', hintSelection);
            return true;
        }
        return false;
    }

    public emitFoundWord(word: Word): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('found word', word);
            return true;
        }
        return false;
    }

    public emitDeselectAll(): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('unselect all');
            return true;
        }
        return false;
    }

    public emitNewCountdown(newCountdown: number): boolean {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('new countdown', newCountdown);
            return true;
        }
        return false;
    }

    private handleGameStart(game: MultiplayerCrosswordGame): void {
        this.gameStartSubject.next(game);
    }

    private handleOpponentHintSelection(
        hintSelection: { 'previous': string, 'current': Word }
    ): void {
        this.opponentHintSelection.next(hintSelection);
    }

    private handleOpponentFoundWord(foundWord: Word): void {
        this.opponentFoundWord.next(foundWord);
    }

    private handleOpponentDeselectAll(): void {
        this.opponentDeselection.next(true);
    }

    private handleServerCountdown(count: number): void {
        this.serverClock.next(count);
    }

    private handleOpponentLeft(): void {
        this.playerService.isHost = false;
        this.opponentLeft.next(true);
    }

    private handleOpponentRestartedGame(gameId: string): void {
        this.socketService.socket.emit(
            'join game', gameId, this.playerService.username
        );
        this.opponentRestarted.next(true);
    }

    private handleMutation(crossword: Crossword): void {
        this.mutation.next(crossword);
    }
}
