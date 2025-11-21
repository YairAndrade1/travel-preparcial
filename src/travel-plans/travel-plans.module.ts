import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { TravelPlansController } from './travel-plans.controller';
import { TravelPlansService } from './travel-plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlan, TravelPlanSchema } from './schemas/travel-plan.schema';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TravelPlan.name, schema: TravelPlanSchema }
    ]),
    forwardRef(() => import('../countries/countries.module').then(m => m.CountriesModule))
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService],
  exports: [TravelPlansService]
})
export class TravelPlansModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('travel-plans');
  }
}
