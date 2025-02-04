import { Injectable, Sse } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../class/player.entity';  // Assurez-vous que Player est correctement importé
import { Observable, interval, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) {}

  // Créer un joueur et l'ajouter à la base de données
  async createPlayer(id: string): Promise<Player> {
    const newPlayer = this.playerRepository.create({ id, rank: 0 });
    return this.playerRepository.save(newPlayer);
  }

  // Gérer un match, mettre à jour les rangs des joueurs
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
      player1.rank += 10;  // Gagner donne des points
      player2.rank -= 5;   // Perdre enlève des points
      message = `${player1.id} gagne contre ${player2.id}`;
    }

    // Sauvegarde des modifications en base de données
    await this.playerRepository.save([player1, player2]);

    return message;
  }

  // Récupérer le classement à partir de la base de données, trié par rang
  async getRank(): Promise<Player[]> {
    return this.playerRepository.find({
      order: {
        rank: 'DESC',
      },
    });
  }
}
