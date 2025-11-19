import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { getModelToken } from '@nestjs/mongoose';
import { COUNTRY_EXTERNAL_SERVICE } from './providers/country-external.token';

describe('CountriesService', () => {
  let service: CountriesService;
  let modelMock: any;
  let externalMock: any;

  beforeEach(async () => {
    modelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
    };
    externalMock = {
      getCountryByAlpha3: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        { provide: getModelToken('Country'), useValue: modelMock },
        { provide: COUNTRY_EXTERNAL_SERVICE, useValue: externalMock },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns cached country when found locally', async () => {
    const cachedDoc = { alpha3Code: 'col', name: 'Colombia' };
    modelMock.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(cachedDoc) });

    const result = await service.findByAlpha3('COL');

    expect(result).toEqual({ country: cachedDoc, source: 'cached' });
    expect(modelMock.findOne).toHaveBeenCalledWith({ alpha3Code: 'col' });
    expect(externalMock.getCountryByAlpha3).not.toHaveBeenCalled();
    expect(modelMock.create).not.toHaveBeenCalled();
  });

  it('fetches from external API and stores when not cached', async () => {
    modelMock.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const externalCountry = { alpha3Code: 'col', name: 'Colombia', region: 'Americas' };
    externalMock.getCountryByAlpha3.mockResolvedValue(externalCountry);
    const createdDoc = { _id: '123', alpha3Code: 'col', name: 'Colombia', region: 'Americas' };
    modelMock.create.mockResolvedValue(createdDoc);

    const result = await service.findByAlpha3('COL');

    expect(externalMock.getCountryByAlpha3).toHaveBeenCalledWith('col');
    expect(modelMock.create).toHaveBeenCalledWith({ ...externalCountry, alpha3Code: 'col' });
    expect(result).toEqual({ country: createdDoc, source: 'api' });
  });
});
