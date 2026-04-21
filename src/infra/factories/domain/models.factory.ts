import { Models } from "@/domain";
import type { IModels } from "@/domain/types";
import { makeModelsType } from "@roastery-capsules/models.models-type/infra/factories/domain";
import { t } from "@roastery/terroir";
import { Schema } from "@roastery/terroir/schema";

const targetDTO = t.Object({
	name: t.String({ minLength: 1 }),
	age: t.Number({ minimum: 0 }),
});

const targetSchema = Schema.make(targetDTO);

export function makeModels(
	data: t.Static<typeof targetDTO> = { age: 22, name: "Alan Reis" },
): IModels {
	const type = makeModelsType(
		"models-type",
		"example models type for makeModels factory",
		targetSchema.toString(),
	);

	return Models.make({ data: JSON.stringify(data), type });
}
