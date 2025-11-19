import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from './schemas/country.schema';
import { COUNTRY_EXTERNAL_SERVICE } from './providers/country-external.token';
import type { CountryExternalService, ExternalCountry } from './providers/country-external.interface';
import { error } from 'console';

@Injectable()
export class CountriesService {

    constructor(
        @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
        @Inject(COUNTRY_EXTERNAL_SERVICE) private readonly externalService : CountryExternalService,
    ) {}

    // Find all countries stored locally
    async findAll(): Promise<Country[]> {
        return this.countryModel.find().exec();
    }
    /** 
     * Find a country by alpha 3 code
     * 1. Check in the loacl database
     * 2. If not found, fetch from the external API and store it locally 
     * 3. Return the country and the "source" (local or external)
     */
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
            throw new error(`Country with code ${alpha3Code} not found in the external API`);
        }

        // 3. Store it locally
        const created = await this.countryModel.create({
            ...external, 
            alpha3Code: code,
        })
        return { country: created, source: 'api' };
    }
}

    
