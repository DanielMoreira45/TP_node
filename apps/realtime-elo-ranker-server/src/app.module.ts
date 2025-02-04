import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Player } from '../class/player.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite', // Nom du fichier de base de données SQLite
      entities: [Player], // Spécifier les entités à utiliser
      synchronize: true, // Crée les tables automatiquement, utile pour le développement
    }),
    TypeOrmModule.forFeature([Player]), // Permet d'utiliser l'entité Player dans le service
    EventEmitterModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
