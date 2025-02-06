import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './../class/player.entity';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppService {
  private updateRank = new BehaviorSubject<Player[]>([]);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) {}

  async createPlayer(id: string): Promise<Player> {
    const newPlayer = this.playerRepository.create({ id, rank: 0 });
    await this.playerRepository.save(newPlayer);
    await this.updateRanking(newPlayer);
    return newPlayer;
  }

  async playMatch(
    winnerId: string,
    looserId: string,
    matchNull: boolean,
  ): Promise<string> {
    const player1 = await this.playerRepository.findOne({
      where: { id: winnerId },
    });
    const player2 = await this.playerRepository.findOne({
      where: { id: looserId },
    });

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
      player1.calculerClassementElo(player2, 1);
      player2.calculerClassementElo(player1, 0);
      message = `${player1.id} gagne contre ${player2.id}`;
    }

    await this.playerRepository.save([player1, player2]);

    await this.updateRanking(player1);
    await this.updateRanking(player2);

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

  async updateRanking(player: Player) {
    if (!player) {
      return;
    }
    const updatedPlayer = await this.playerRepository.findOne({
      where: { id: player.id },
    });
    if (updatedPlayer) {
      this.updateRank.next([updatedPlayer]);
      this.eventEmitter.emit('ranking.updated', updatedPlayer);
    }
  }
}
