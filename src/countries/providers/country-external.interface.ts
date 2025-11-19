
export interface ExternalCountry {
    alpha3Code: string;
    name: string;
    region?: string;
    subregion?: string;
    capital?: string;
    population?: number;
    flagUrl?: string;
}

export interface CountryExternalService {
    getCountryByAlpha3(alpha3Code: string): Promise<ExternalCountry | null>;
}