import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { RestCountriesService } from './restcountries.service';
import { CountriesService } from './countries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schemas/country.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]), 
    HttpModule,
  ],
  controllers: [CountriesController],
  providers: [CountriesService,
    {provide: 'COUNTRY_EXTERNAL_SERVICE', useClass: RestCountriesService}
  ],
  exports: [CountriesService],
})
export class CountriesModule {}
