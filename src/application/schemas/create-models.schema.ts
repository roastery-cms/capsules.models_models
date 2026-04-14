import { Schema } from "@roastery/terroir/schema";
import { CreateModelsDTO } from "../dtos";

export const CreateModelsSchema: Schema<typeof CreateModelsDTO> =
    Schema.make<typeof CreateModelsDTO>(CreateModelsDTO);

export type CreateModelsSchema = typeof CreateModelsDTO;
