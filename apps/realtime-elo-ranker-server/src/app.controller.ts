import { Controller, Get, Post, Body, Sse } from '@nestjs/common';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from './app.service';
import { Player } from '../class/player.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private eventEmitter: EventEmitter2,
  ) {}

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
  async playMatch(
    @Body('winner') winnerId: string,
    @Body('loser') looserId: string,
    @Body('draw') matchNull: boolean,
  ) {
    return this.appService.playMatch(winnerId, looserId, matchNull);
  }

  @Sse('/api/ranking/events')
  sendRankingUpdates(): Observable<MessageEvent> {
    return fromEvent<Player>(this.eventEmitter, 'ranking.updated').pipe(
      map(
        (player: Player) =>
          new MessageEvent('message', {
            data: {
              type: 'RankingUpdate',
              player: {
                id: player.id,
                rank: player.rank,
              },
            },
          }),
      ),
    );
  }
}
