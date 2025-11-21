import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanDocument } from './schemas/travel-plan.schema';
import { Model } from 'mongoose';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class TravelPlansService {

    constructor(
        @InjectModel(TravelPlan.name)
        private readonly travelPlanModel: Model<TravelPlanDocument>,
        @Inject(forwardRef(() => CountriesService))
        private readonly countriesService: CountriesService,
    ) {}

    async create(dto: CreateTravelPlanDto): Promise<TravelPlan> {
        // Verificar que el país existe consultando CountriesService
        const countryResult = await this.countriesService.findByAlpha3(dto.countryAlpha3);
        if (!countryResult) {
            throw new NotFoundException(`Country with code ${dto.countryAlpha3} not found`);
        }
    
        const created = await this.travelPlanModel.create({
            countryAlpha3: dto.countryAlpha3.toLowerCase(),
            title: dto.title,
            startDate: dto.startDate,
            endDate: dto.endDate,
            description: dto.description,
        });

        return created; 
    }

    async findAll(): Promise<TravelPlan[]> {
        return this.travelPlanModel.find().exec(); 
    }

    async findOne(id: string): Promise<TravelPlan | null> {
        const plan = await this.travelPlanModel.findById(id).exec();
        if (!plan) {
            throw new NotFoundException(`Travel plan with id ${id} not found`);
        }
        return plan;
    }

    async findByCountryAlpha3(alpha3Code: string): Promise<TravelPlan[]> {
        return this.travelPlanModel.find({ countryAlpha3: alpha3Code.toLowerCase() }).exec();
    }

}
