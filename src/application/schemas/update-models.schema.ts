import { Schema } from "@roastery/terroir/schema";
import { UpdateModelsDTO } from "../dtos";

export const UpdateModelsSchema: Schema<typeof UpdateModelsDTO> =
	Schema.make<typeof UpdateModelsDTO>(UpdateModelsDTO);

export type UpdateModelsSchema = typeof UpdateModelsDTO;
