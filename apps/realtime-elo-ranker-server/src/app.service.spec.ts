import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../class/player.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AppService', () => {
  let appService: AppService;
  let playerRepository: Repository<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Player),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
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

    appService = module.get<AppService>(AppService);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
  });

  it('doit créer un joueur', async () => {
    const newPlayer = { id: '123', rank: 0 };
    playerRepository.create = jest.fn().mockReturnValue(newPlayer);
    playerRepository.save = jest.fn().mockResolvedValue(newPlayer);

    const result = await appService.createPlayer('123');
    expect(result).toEqual(newPlayer);
    expect(playerRepository.create).toHaveBeenCalledWith({
      id: '123',
      rank: 0,
    });
    expect(playerRepository.save).toHaveBeenCalledWith(newPlayer);
  });

  it('doit retourner une erreur si un joueur manque lors d’un match', async () => {
    playerRepository.findOne = jest.fn().mockResolvedValue(null);
    const result = await appService.playMatch('123', '456', false);
    expect(result).toBe('Un ou plusieurs joueurs non trouvés!');
  });

  it('doit enregistrer un match nul', async () => {
    const player1 = {
      id: '123',
      rank: 1000,
      calculerClassementElo: jest.fn(),
    } as any;
    const player2 = {
      id: '456',
      rank: 1000,
      calculerClassementElo: jest.fn(),
    } as any;

    playerRepository.findOne = jest
      .fn()
      .mockResolvedValueOnce(player1)
      .mockResolvedValueOnce(player2);

    const result = await appService.playMatch('123', '456', true);
    expect(result).toBe('Match nul entre 123 et 456');
  });
});
