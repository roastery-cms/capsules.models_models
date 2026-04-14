import { Schema } from "@roastery/terroir/schema";
import { UnpackedModelsDTO } from "../dtos";

export const UnpackedModelsSchema: Schema<typeof UnpackedModelsDTO> =
    Schema.make<typeof UnpackedModelsDTO>(UnpackedModelsDTO);

export type UnpackedModelsSchema = typeof UnpackedModelsDTO;
