import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  rank: number;

  constructor(id: string, rank: number) {
    this.id = id;
    this.rank = rank;
  }

  // Méthode pour mettre à jour le score du joueur
  updateRank(newRank: number) {
    this.rank += newRank;
  }
}
