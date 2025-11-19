import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Get()
    findAll() {
        return this.countriesService.findAll();
    }

    @Get(':code')
    findByAlpha3(@Param('code') code: string){
        return this.countriesService.findByAlpha3(code);
    }


}
