import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from '../class/player.entity';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            createPlayer: jest
              .fn()
              .mockResolvedValue(new Player('Dalaigre', 0)),
            getRank: jest.fn().mockResolvedValue([]),
            playMatch: jest.fn().mockResolvedValue('Match enregistré'),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('doit créer un joueur', async () => {
    const result = await appController.createPlayer('123');
    expect(result).toBeInstanceOf(Player);
    expect(appService.createPlayer).toHaveBeenCalledWith('123');
  });

  it('doit récupérer le classement des joueurs', async () => {
    const result = await appController.getRank();
    expect(result).toEqual([]);
    expect(appService.getRank).toHaveBeenCalled();
  });

  it('doit enregistrer un match', async () => {
    const result = await appController.playMatch('123', '456', false);
    expect(result).toBe('Match enregistré');
    expect(appService.playMatch).toHaveBeenCalledWith('123', '456', false);
  });
});
