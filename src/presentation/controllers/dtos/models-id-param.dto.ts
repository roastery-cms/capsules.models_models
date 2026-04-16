import { UuidDTO } from "@roastery/beans/collections/dtos";
import { t } from "@roastery/terroir";

export const ModelsIdParamDTO = t.Object(
	{ id: UuidDTO },
	{
		description:
			"Route parameters carrying the unique identifier of a models entry.",
	},
);

export type ModelsIdParamDTO = t.Static<typeof ModelsIdParamDTO>;
