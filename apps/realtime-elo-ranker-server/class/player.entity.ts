import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryColumn('text')
  id: string;

  @Column('int')
  rank: number;

  constructor(id: string, rank: number) {
    this.id = id;
    this.rank = rank;
  }

  updateRank(newRank: number) {
    this.rank = newRank;
  }

  calculerClassementElo(
    playerAdversaire: Player,
    resultatMatch: number,
    coefficientPonderation: number = 32,
  ): Player {
    const probabiliteVictoire =
      1 / (1 + Math.pow(10, (playerAdversaire.rank - this.rank) / 400));
    const nouveauClassement =
      this.rank +
      coefficientPonderation * (resultatMatch - probabiliteVictoire);
    this.updateRank(Math.round(nouveauClassement));

    return this;
  }
}
