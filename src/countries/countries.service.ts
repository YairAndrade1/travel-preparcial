import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from './schemas/country.schema';
import { COUNTRY_EXTERNAL_SERVICE } from './providers/country-external.token';
import type { CountryExternalService, ExternalCountry } from './providers/country-external.interface';
import { TravelDataRepository } from '../common/repositories/travel-data.repository';

@Injectable()
export class CountriesService {

    constructor(
        @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
        @Inject(COUNTRY_EXTERNAL_SERVICE) private readonly externalService : CountryExternalService,
        private readonly travelDataRepository: TravelDataRepository,
    ) {}

    async findAll(): Promise<Country[]> {
        return this.countryModel.find().exec();
    }

    async findByAlpha3(alpha3Code: string): Promise<{ country: Country, source: 'cached' | 'api'} | null> {

        const code = alpha3Code.toLowerCase();
        // 1. Check in the local database
        const cached = await this.countryModel.findOne({ alpha3Code: code }).exec();
        if (cached) {
            return { country: cached, source: 'cached'};
        }
        // 2. Fetch from external API
        const external: ExternalCountry | null = await this.externalService.getCountryByAlpha3(code);

        if (!external){
            throw new NotFoundException(`Country with code ${alpha3Code} not found in the external API`);
        }
        // 3. Store it locally
        const created = await this.countryModel.create({
            ...external, 
            alpha3Code: code,
        })
        return { country: created, source: 'api' };
    }

    async deleteByAlpha3(alpha3Code: string): Promise<void> {
        const code = alpha3Code.toLowerCase();
        //1. Check if country exists
        const countryExists = await this.travelDataRepository.countryExists(code);
        if (!countryExists) {
            throw new NotFoundException(`Country with code ${alpha3Code} not found in the cache`);
        }
        //2. Check for associated travel plans
        const planCount = await this.travelDataRepository.countTravelPlansByCountry(code);
        if (planCount > 0) {
            throw new BadRequestException(
                `Cannot delete country ${alpha3Code}. There are ${planCount} travel plan(s) associated with this country.`
            );
        }
        // 3. Delete the country
        const result = await this.travelDataRepository.deleteCountryByAlpha3(code);
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Country with code ${alpha3Code} not found in the cache`);
        }
    }
}

