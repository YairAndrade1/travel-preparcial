import { Module } from '@nestjs/common';
import { TravelPlansController } from './travel-plans.controller';
import { TravelPlansService } from './travel-plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanSchema } from './schemas/travel-plan.schema';
import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TravelPlan.name, schema: TravelPlanSchema }]),
    CountriesModule
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService]
})
export class TravelPlansModule {}
