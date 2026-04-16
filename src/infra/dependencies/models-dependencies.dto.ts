import { t } from "@roastery/terroir";
import { ModelsRepositoryProviderDTO } from "../factories/repositories/dtos";
import { UrlDTO } from "@roastery/beans/collections/dtos";
import { CacheEnvDependenciesDTO } from "@roastery-adapters/cache/dtos";

export const ModelsDependenciesDTO = t.Composite([
    CacheEnvDependenciesDTO,
    t.Object({
        DATABASE_URL: t.Optional(t.String()),
        DATABASE_PROVIDER: t.Optional(ModelsRepositoryProviderDTO),
        MODELS_TYPE_BASE_URL: t.Optional(UrlDTO),
    }),
]);

export type ModelsDependenciesDTO = t.Static<typeof ModelsDependenciesDTO>;
