import type { IModelsTypeRepository } from "@/domain/types/repositories";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";

export class ModelsTypeRepository implements IModelsTypeRepository {
	private types: Map<string, IModelsType>;

	constructor() {
		this.types = new Map();
	}

	async findById(id: string): Promise<IModelsType | null> {
		return this.types.get(id) ?? null;
	}

	seed(types: IModelsType[]): void {
		for (const type of types) {
			this.types.set(type.id, type);
		}
	}

	clear(): void {
		this.types.clear();
	}

	getAll(): IModelsType[] {
		return Array.from(this.types.values());
	}

	count(): number {
		return this.types.size;
	}
}
