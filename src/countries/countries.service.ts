import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from './schemas/country.schema';
import { TravelPlan, TravelPlanDocument } from '../travel-plans/schemas/travel-plan.schema';
import { COUNTRY_EXTERNAL_SERVICE } from './providers/country-external.token';
import type { CountryExternalService, ExternalCountry } from './providers/country-external.interface';

@Injectable()
export class CountriesService {

    constructor(
        @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
        @InjectModel(TravelPlan.name) private readonly travelPlanModel: Model<TravelPlanDocument>,
        @Inject(COUNTRY_EXTERNAL_SERVICE) private readonly externalService : CountryExternalService,
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
        const countryExists = await this.countryModel.exists({ alpha3Code: code });
        if (!countryExists) {
            throw new NotFoundException(`Country with code ${alpha3Code} not found in the cache`);
        }
        //2. Check for associated travel plans
        const planCount = await this.travelPlanModel.countDocuments({ countryAlpha3: code });
        if (planCount > 0) {
            throw new BadRequestException(
                `Cannot delete country ${alpha3Code}. There are ${planCount} travel plan(s) associated with this country.`
            );
        }
        // 3. Delete the country
        await this.countryModel.deleteOne({ alpha3Code: code });
    }
}

