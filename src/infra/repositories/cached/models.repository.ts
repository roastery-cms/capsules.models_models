import type { IModels } from "@/domain/types";
import type { IModelsRepository } from "@/domain/types/repositories";
import { ModelsMapper } from "./models.mapper";
import { Models } from "@/domain";
import { CACHE_EXPIRATION_TIME } from "@roastery/seedbed/constants";
import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import { SafeCache } from "@roastery-adapters/cache/decorators";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { Mapper } from "@roastery/beans";

export class ModelsRepository implements IModelsRepository {
	private readonly cacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

	constructor(
		private readonly repository: IModelsRepository,
		private readonly cache: BaristaCacheInstance,
	) {}

	@SafeCache(Models[EntitySource])
	async create(models: IModels): Promise<void> {
		await this.repository.create(models);

		await Promise.all([this.cacheModels(models), this.invalidateListCache()]);
	}

	@SafeCache(Models[EntitySource])
	async findById(id: string): Promise<IModels | null> {
		const storedModels = await this.cache.get(
			`${Models[EntitySource]}::$${id}`,
		);

		if (storedModels)
			return ModelsMapper.run(`${Models[EntitySource]}::$${id}`, storedModels);

		const targetModels = await this.repository.findById(id);

		if (!targetModels) return null;

		await this.cacheModels(targetModels);

		return targetModels;
	}

	@SafeCache(Models[EntitySource])
	async findByModelsTypeId(
		modelsTypeId: string,
		page: number,
	): Promise<IModels[]> {
		const key = `${Models[EntitySource]}:type::$${modelsTypeId}:page::${page}`;
		const storedIds = await this.cache.get(key);

		if (storedIds) {
			const ids: string[] = JSON.parse(storedIds);
			const models = await this.findManyByIds(ids);

			if (models.length === ids.length) return models;

			await this.cache.del(key);
		}

		const targetModels = await this.repository.findByModelsTypeId(
			modelsTypeId,
			page,
		);

		await Promise.all([
			...targetModels.map((models) => this.cacheModels(models)),
			this.cache.set(
				key,
				JSON.stringify(targetModels.map((models) => models.id)),
				"EX",
				this.cacheExpirationTime,
			),
		]);

		return targetModels;
	}

	@SafeCache(Models[EntitySource])
	async findManyByIds(ids: string[]): Promise<IModels[]> {
		if (ids.length === 0) return [];

		const keys = ids.map((id) => `${Models[EntitySource]}::$${id}`);
		const cachedValues = await this.cache.mget(...keys);

		const modelsMap = new Map<string, IModels>();
		const missedIds: string[] = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			if (!id) continue;

			const cached = cachedValues[i];

			if (cached) {
				try {
					const models = ModelsMapper.run(
						`${Models[EntitySource]}::$${id}`,
						cached,
					);
					modelsMap.set(id, models);
				} catch {
					missedIds.push(id);
				}
			} else {
				missedIds.push(id);
			}
		}

		if (missedIds.length > 0) {
			const fetchedModels = await this.repository.findManyByIds(missedIds);

			await Promise.all(
				fetchedModels.map(async (models) => {
					await this.cacheModels(models);
					modelsMap.set(models.id, models);
				}),
			);
		}

		return ids
			.map((id) => modelsMap.get(id))
			.filter((models): models is IModels => models !== undefined);
	}

	@SafeCache(Models[EntitySource])
	async update(models: IModels): Promise<void> {
		await this.cache.del(`${Models[EntitySource]}::$${models.id}`);

		await this.repository.update(models);

		await Promise.all([this.cacheModels(models), this.invalidateListCache()]);
	}

	@SafeCache(Models[EntitySource])
	async delete(models: IModels): Promise<void> {
		await this.repository.delete(models);

		await Promise.all([
			this.cache.del(`${Models[EntitySource]}::$${models.id}`),
			this.invalidateListCache(),
		]);
	}

	countByModelsTypeId(modelsTypeId: string): Promise<number> {
		return this.repository.countByModelsTypeId(modelsTypeId);
	}

	@SafeCache(Models[EntitySource])
	private async cacheModels(models: IModels): Promise<void> {
		const unpacked = Mapper.toDTO(models);

		await this.cache.set(
			`${Models[EntitySource]}::$${models.id}`,
			JSON.stringify(unpacked),
			"EX",
			this.cacheExpirationTime,
		);
	}

	@SafeCache(Models[EntitySource])
	private async invalidateListCache(): Promise<void> {
		const patterns = [`${Models[EntitySource]}:type:*`];

		for (const pattern of patterns) {
			let cursor = "0";
			do {
				const [newCursor, keys] = await this.cache.scan(
					cursor,
					"MATCH",
					pattern,
					"COUNT",
					100,
				);

				cursor = newCursor;

				if (keys.length > 0) {
					await this.cache.del(...keys);
				}
			} while (cursor !== "0");
		}
	}
}
