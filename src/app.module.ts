import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CountriesModule } from './countries/countries.module';
import { TravelPlansModule } from './travel-plans/travel-plans.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:secret@localhost:27017/travel-preparcial?authSource=admin', {}),
    CountriesModule,
    TravelPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
