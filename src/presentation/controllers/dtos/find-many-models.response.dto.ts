import { UnpackedModelsDTO } from "@/domain/dtos";
import { t } from "@roastery/terroir";

export const FindManyModelsResponseDTO = t.Array(UnpackedModelsDTO, {
	description:
		"A paginated list of models entries scoped to a single models type.",
});

export type FindManyModelsResponseDTO = t.Static<
	typeof FindManyModelsResponseDTO
>;
