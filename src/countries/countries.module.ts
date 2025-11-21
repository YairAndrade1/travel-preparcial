import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { RestCountriesService } from './restcountries.service';
import { CountriesService } from './countries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schemas/country.schema';
import { HttpModule } from '@nestjs/axios';
import { TravelPlansModule } from '../travel-plans/travel-plans.module';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';

import { TravelPlan, TravelPlanSchema } from '../travel-plans/schemas/travel-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: TravelPlan.name, schema: TravelPlanSchema }
    ]), 
    HttpModule,
    TravelPlansModule
  ],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    {provide: 'COUNTRY_EXTERNAL_SERVICE', useClass: RestCountriesService}
  ],
  exports: [CountriesService],
})
export class CountriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('countries');
  }
}
