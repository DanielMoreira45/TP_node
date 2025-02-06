import { Injectable, Sse } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './../class/player.entity';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppService {
  private updateRank = new BehaviorSubject<Player[]>([]);

  constructor(private eventEmitter: EventEmitter2,@InjectRepository(Player) private playerRepository: Repository<Player>) {}

  async createPlayer(id: string): Promise<Player> {
    const newPlayer = this.playerRepository.create({ id, rank: 0 });
    await this.playerRepository.save(newPlayer);
    this.updateRanking();
    return newPlayer;
  }


  async playMatch(winnerId: string, looserId: string, matchNull: boolean): Promise<string> {
    const player1 = await this.playerRepository.findOne({ where: { id: winnerId } });
    const player2 = await this.playerRepository.findOne({ where: { id: looserId } });

    if (!player1 || !player2) {
      return 'Un ou plusieurs joueurs non trouvés!';
    }

    if (winnerId === looserId) {
      return 'Un joueur ne peut pas se jouer contre lui-même!';
    }

    let message = '';
    if (matchNull) {
      message = `Match nul entre ${player1.id} et ${player2.id}`;
    } else {
      player1.rank += 10;
      player2.rank -= 5;
      message = `${player1.id} gagne contre ${player2.id}`;
    }

    await this.playerRepository.save([player1, player2]);

    await this.updateRanking();

    return message;
  }

  async getRank(): Promise<Player[]> {
    return this.playerRepository.find({
      order: {
        rank: 'DESC',
      },
    });
  }

  getRankingObservable() {
    return this.updateRank.asObservable();
  }

  private lastRanks = new Map<string, number>();

  async updateRanking() {
    const players = await this.getRank();
    const updatedPlayers = players.filter(player => {
      if (this.lastRanks.get(player.id) !== player.rank) {
        this.lastRanks.set(player.id, player.rank);
        return true;
      }
      return false;
    });

    if (updatedPlayers.length > 0) {
      this.updateRank.next(updatedPlayers);
      this.eventEmitter.emit('ranking.updated', updatedPlayers);
    }
  }
}
