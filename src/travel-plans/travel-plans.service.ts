import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanDocument } from './schemas/travel-plan.schema';
import { Model } from 'mongoose';
import { CountriesService } from '../countries/countries.service';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';

@Injectable()
export class TravelPlansService {

    constructor(
        @InjectModel(TravelPlan.name)
        private readonly travelPlanModel: Model<TravelPlanDocument>,
        private readonly countriesService: CountriesService,
    ) {}

    async create(dto: CreateTravelPlanDto): Promise<TravelPlan> {
        const code = dto.countryAlpha3.toLowerCase();

        await this.countriesService.findByAlpha3(code);
        
        const created = await this.travelPlanModel.create({
            countryAlpha3: code,
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

}
