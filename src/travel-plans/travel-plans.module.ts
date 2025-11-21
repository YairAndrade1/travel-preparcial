import { Module, forwardRef, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TravelPlansController } from './travel-plans.controller';
import { TravelPlansService } from './travel-plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanSchema } from './schemas/travel-plan.schema';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';
import { TravelDataRepository } from '../common/repositories/travel-data.repository';
import { Country, CountrySchema } from '../countries/schemas/country.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TravelPlan.name, schema: TravelPlanSchema },
      { name: Country.name, schema: CountrySchema }
    ])
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService, TravelDataRepository],
  exports: [TravelPlansService, TravelDataRepository]
})
export class TravelPlansModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('travel-plans');
  }
}
