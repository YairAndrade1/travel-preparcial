import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('countries')
export class CountriesController {
    constructor(
        private readonly countriesService: CountriesService,
    ) {}

    @Get()
    findAll() {
        return this.countriesService.findAll();
    }

    @Get(':code')
    findByAlpha3(@Param('code') code: string){
        return this.countriesService.findByAlpha3(code);
    }

    @Delete(':code')
    @UseGuards(AuthGuard)
    async deleteByAlpha3(@Param('code') code: string) {
        await this.countriesService.deleteByAlpha3(code);
        return { message: `Country ${code} deleted successfully` };
    }
}
