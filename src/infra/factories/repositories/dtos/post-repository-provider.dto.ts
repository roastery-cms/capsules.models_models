import { t } from "@roastery/terroir";

export const ModelsRepositoryProviderDTO = t.Union([
	t.Literal("PRISMA"),
	t.Literal("MEMORY"),
]);

export type ModelsRepositoryProviderDTO = t.Static<
	typeof ModelsRepositoryProviderDTO
>;
