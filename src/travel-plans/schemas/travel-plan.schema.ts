import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TravelPlanDocument = TravelPlan & Document;

@Schema({ timestamps: true})
export class TravelPlan {

    @Prop({ required: true })
    countryAlpha3: string; 

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    startDate: Date;   

    @Prop({ required: true })
    endDate: Date;

    @Prop()
    description?: string;

}

export const TravelPlanSchema = SchemaFactory.createForClass(TravelPlan);