import { Injectable } from '@nestjs/common';
import { ExternalCountry, CountryExternalService } from './providers/country-external.interface';
import { HttpService } from '@nestjs/axios';
import { error } from 'console';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RestCountriesService implements CountryExternalService {
    constructor(private readonly http: HttpService) {}

    async getCountryByAlpha3(alpha3Code: string): Promise<ExternalCountry | null> {
        const code = alpha3Code.toLowerCase(); 

        try {
            const response = await firstValueFrom(
                this.http.get(`https://restcountries.com/v3.1/alpha/${code}?fields=cca3,name,region,subregion,population,flags`),
            )

            const raw = Array.isArray(response.data) ? response.data[0] : response.data;

            if (!raw) {
                return null; 
            }

            const external: ExternalCountry = {
                alpha3Code: raw.cca3,
                name: raw.name.common,
                region: raw.region,
                subregion: raw.subregion,
                population: raw.population,
                flagUrl: raw.flags?.png || raw.flags?.svg,
            };

            return external;
        } catch (error) {
            if (error?.response?.status === 404) {
                return null;
            }
        }

        throw error;
    }
}


