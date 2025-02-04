import { Controller, Get, Post, Body, Sse } from '@nestjs/common';
import { Observable, interval, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AppService } from './app.service';
import { Player } from '../class/player.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/api/player')
  async createPlayer(@Body('id') id: string): Promise<Player> {
    return this.appService.createPlayer(id);
  }

  @Get('/api/ranking')
  async getRank(): Promise<Player[]> {
    return this.appService.getRank();
  }

  @Post('/api/match')
  async playMatch(@Body('winner') winnerId : string, @Body('loser') looserId : string, @Body('draw') matchNull : boolean) {
    return this.appService.playMatch(winnerId, looserId, matchNull);
  }

  // SSE pour envoyer les mises à jour du classement
  @Sse('api/ranking/events')
  sendRankingUpdates(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() => {
        return from(this.getRank()).pipe(
          map(players => {
            return {
              data: JSON.stringify(players),
            } as MessageEvent;
          }),
        );
      }),
    );
  }
}
