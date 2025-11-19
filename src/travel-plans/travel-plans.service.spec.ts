import { Test, TestingModule } from '@nestjs/testing';
import { TravelPlansService } from './travel-plans.service';
import { getModelToken } from '@nestjs/mongoose';
import { CountriesService } from '../countries/countries.service';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';

describe('TravelPlansService', () => {
  let service: TravelPlansService;
  let modelMock: any;
  let countriesServiceMock: any;

  beforeEach(async () => {
    modelMock = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
    };
    countriesServiceMock = {
      findByAlpha3: jest.fn().mockResolvedValue({ country: { alpha3Code: 'col', name: 'Colombia' }, source: 'api' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelPlansService,
        { provide: getModelToken('TravelPlan'), useValue: modelMock },
        { provide: CountriesService, useValue: countriesServiceMock },
      ],
    }).compile();

    service = module.get<TravelPlansService>(TravelPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a travel plan normalizing country code and ensuring country exists', async () => {
    const dto: CreateTravelPlanDto = {
      countryAlpha3: 'COL',
      title: 'Vacation',
      startDate: '2025-01-01',
      endDate: '2025-01-10',
      description: 'Beach time',
    };
    const created = { _id: 'abc123', countryAlpha3: 'col', title: dto.title };
    modelMock.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(countriesServiceMock.findByAlpha3).toHaveBeenCalledWith('col');
    expect(modelMock.create).toHaveBeenCalledWith({
      countryAlpha3: 'col',
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
      description: dto.description,
    });
    expect(result).toBe(created);
  });
});
