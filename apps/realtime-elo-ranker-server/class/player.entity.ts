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
    this.rank += newRank;
  }
}

