import { UnpackedModelsTypeDTO } from "@roastery-capsules/models.models-type/domain/dtos";
import { Schema } from "@roastery/terroir/schema";

export const UnpackedModelsSchema = Schema.make(UnpackedModelsTypeDTO);

export type UnpackedModelsSchema = typeof UnpackedModelsTypeDTO;
