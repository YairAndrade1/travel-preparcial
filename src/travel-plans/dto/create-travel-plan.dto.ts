
import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsOptional,
    Length,
    IsDate,
} from 'class-validator';

export class CreateTravelPlanDto {
    @IsString()
    @IsNotEmpty()
    @Length(3,3,{ message: "Alpha 3 code must be exactly 3 characters long" })
    countryAlpha3: string; 

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsString()
    description?: string; 
}