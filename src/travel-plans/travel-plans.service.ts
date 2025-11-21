import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanDocument } from './schemas/travel-plan.schema';
import { Model } from 'mongoose';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelDataRepository } from '../common/repositories/travel-data.repository';

@Injectable()
export class TravelPlansService {

    constructor(
        @InjectModel(TravelPlan.name)
        private readonly travelPlanModel: Model<TravelPlanDocument>,
        private readonly travelDataRepository: TravelDataRepository,
    ) {}

    async create(dto: CreateTravelPlanDto): Promise<TravelPlan> {
        const code = dto.countryAlpha3.toLowerCase();
        const countryExists = await this.travelDataRepository.countryExists(code);
        if (!countryExists) {
            throw new NotFoundException(`Country with code ${dto.countryAlpha3} not found`);
        }
    
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

    async findByCountryAlpha3(alpha3Code: string): Promise<TravelPlan[]> {
        return this.travelDataRepository.findTravelPlansByCountry(alpha3Code);
    }

}
