import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '../crossword-game-manager.service';
import { PlayerManagerService } from '../crossword-player-manager.service';
import { Game } from '../../../../../commun/crossword/game';

@Component({
  selector: 'app-crossword-room',
  templateUrl: './crossword-room.component.html',
  styleUrls: ['./crossword-room.component.css']
})
export class CrosswordRoomComponent implements OnInit {

  public games: Game[] = [];
  public username: string;

  constructor(private gameManagerService: GameManagerService, private playerManagerService: PlayerManagerService) {
    this.username = '';
  }

  public ngOnInit() {
    this.gameManagerService.getGames().then(games => {
      this.games = games;
    });
  }

  public joinGame(gameId: string) {
    this.setPlayerUsername();
    this.gameManagerService.joinGame(gameId, this.playerManagerService.getPlayer());
  }

  public setPlayerUsername(): void {
    this.playerManagerService.getPlayer().setUsername(this.username);
  }

}
