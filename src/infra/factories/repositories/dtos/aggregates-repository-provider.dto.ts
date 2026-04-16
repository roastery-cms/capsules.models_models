import { t } from "@roastery/terroir";

export const AggregatesRepositoryProviderDTO = t.Union([
	t.Literal("API"),
	t.Literal("MEMORY"),
]);

export type AggregatesRepositoryProviderDTO = t.Static<
	typeof AggregatesRepositoryProviderDTO
>;
