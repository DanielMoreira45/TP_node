import { Controller, Get, Post, Body, Sse, Logger } from '@nestjs/common';
import { Observable, interval, from, fromEvent } from 'rxjs';
import { switchMap, map, mergeMap } from 'rxjs/operators';
import { AppService } from './app.service';
import { Player } from '../class/player.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  
  constructor(private readonly appService: AppService, private eventEmitter: EventEmitter2) { }

  @Post('/api/player')
  async createPlayer(@Body('id') id: string): Promise<Player> {
    const newPlayer = this.appService.createPlayer(id);
    return newPlayer;
  }

  @Get('/api/ranking')
  async getRank(): Promise<Player[]> {
    return this.appService.getRank();
  }

  @Post('/api/match')
  async playMatch(@Body('winner') winnerId: string, @Body('loser') looserId: string, @Body('draw') matchNull: boolean) {
    return this.appService.playMatch(winnerId, looserId, matchNull);
  }


  @Sse('/api/ranking/events')
  sendRankingUpdates(): Observable<MessageEvent> {
    return fromEvent<Player[]>(this.eventEmitter, 'ranking.updated').pipe(
      map((players) =>
        new MessageEvent('ranking.update', {
          data: JSON.stringify(players.map(player => ({
            id: player.id,
            rank: player.rank
          })))
        })
      )
    );
  }

}