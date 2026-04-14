import { Models } from "@/domain";
import type { IModels } from "@/domain/types";
import type { IModelsRepository } from "@/domain/types/repositories";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import {
	ConflictException,
	ResourceNotFoundException,
} from "@roastery/terroir/exceptions/infra";

export class ModelsRepository implements IModelsRepository {
	private models: Map<string, IModels>;
	private readonly PAGE_SIZE = MAX_ITEMS_PER_QUERY;

	constructor() {
		this.models = new Map();
	}

	async create(data: IModels): Promise<void> {
		if (this.models.has(data.id)) {
			throw new ConflictException(Models[EntitySource]);
		}

		this.models.set(data.id, data);
	}

	async findById(id: string): Promise<IModels | null> {
		return this.models.get(id) ?? null;
	}

	async findByModelsTypeId(
		modelsTypeId: string,
		page: number,
	): Promise<IModels[]> {
		const filtered = Array.from(this.models.values()).filter(
			(models) => models.type.id === modelsTypeId,
		);
		return this.paginate(filtered, page);
	}

	async findManyByIds(ids: string[]): Promise<IModels[]> {
		return ids
			.map((id) => this.models.get(id))
			.filter((models): models is IModels => models !== undefined);
	}

	async countByModelsTypeId(modelsTypeId: string): Promise<number> {
		return Array.from(this.models.values()).filter(
			(models) => models.type.id === modelsTypeId,
		).length;
	}

	async update(data: IModels): Promise<void> {
		if (!this.models.has(data.id)) {
			throw new ResourceNotFoundException(Models[EntitySource]);
		}

		this.models.set(data.id, data);
	}

	async delete(data: IModels): Promise<void> {
		if (!this.models.has(data.id)) {
			throw new ResourceNotFoundException(Models[EntitySource]);
		}

		this.models.delete(data.id);
	}

	seed(models: IModels[]): void {
		for (const model of models) {
			this.models.set(model.id, model);
		}
	}

	clear(): void {
		this.models.clear();
	}

	getAll(): IModels[] {
		return Array.from(this.models.values());
	}

	count(): number {
		return this.models.size;
	}

	private paginate(items: IModels[], page: number): IModels[] {
		const startIndex = (page - 1) * this.PAGE_SIZE;
		const endIndex = startIndex + this.PAGE_SIZE;
		return items.slice(startIndex, endIndex);
	}
}
