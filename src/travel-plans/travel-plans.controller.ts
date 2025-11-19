import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlansService } from './travel-plans.service';

@Controller('travel-plans')
export class TravelPlansController {
    constructor(private readonly travelPlansService: TravelPlansService) {}

    @Post()
    create(@Body () dto: CreateTravelPlanDto) {
        return this.travelPlansService.create(dto); 
    }

    @Get()
    findAll() {
        return this.travelPlansService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.travelPlansService.findOne(id);
    }
}
