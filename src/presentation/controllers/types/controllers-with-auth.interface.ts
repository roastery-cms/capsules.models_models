import type { SimpleUrlDTO } from "@roastery/beans/collections/dtos";
import type { CacheProviderDTO } from "@roastery-adapters/cache/dtos";
import type { IControllersWithoutAuth } from "./controllers-without-auth.interface";

export interface IControllersWithAuth extends IControllersWithoutAuth {
	jwtSecret: string;
	cacheProvider: CacheProviderDTO;
	redisUrl?: SimpleUrlDTO;
}
