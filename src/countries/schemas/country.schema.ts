import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CountryDocument = Country & Document;

@Schema({timestamps: true})
export class Country {
    
    @Prop({ required: true, unique: true })
    alpha3Code: string; 

    @Prop({ required: true })
    name: string;

    @Prop()
    region?: string;

    @Prop()
    subregion?: string;

    @Prop()
    capital?: string;

    @Prop()
    population?: number;

    @Prop()
    flagUrl?: string;

}

export const CountrySchema = SchemaFactory.createForClass(Country);