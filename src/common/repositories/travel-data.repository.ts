import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from '../../countries/schemas/country.schema';
import { TravelPlan, TravelPlanDocument } from '../../travel-plans/schemas/travel-plan.schema';

@Injectable()
export class TravelDataRepository {
    constructor(
        @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
        @InjectModel(TravelPlan.name) private readonly travelPlanModel: Model<TravelPlanDocument>,
    ) {}

    async countTravelPlansByCountry(alpha3Code: string): Promise<number> {
        const code = alpha3Code.toLowerCase();
        return this.travelPlanModel.countDocuments({countryAlpha3: code}).exec();
    }

    async findTravelPlansByCountry(alpha3Code: string): Promise<TravelPlan[]> {
        const code = alpha3Code.toLowerCase();
        return this.travelPlanModel.find({ countryAlpha3: code }).exec();
    }

    async countryExists(alpha3Code: string): Promise<boolean> {
        const code = alpha3Code.toLowerCase();
        const count = await this.countryModel.countDocuments({ alpha3Code: code }).exec();
        return count > 0;
    }

    async findCountryByAlpha3(alpha3Code: string): Promise<Country | null> {
        const code = alpha3Code.toLowerCase();
        return this.countryModel.findOne({ alpha3Code: code }).exec();
    }

    async deleteCountryByAlpha3(alpha3Code: string): Promise<{ deletedCount: number }> {
        const code = alpha3Code.toLowerCase();
        return this.countryModel.deleteOne({ alpha3Code: code }).exec();
    }
}