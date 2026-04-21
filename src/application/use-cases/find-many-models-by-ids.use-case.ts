import type { IModels } from "@/domain/types";
import type { IModelsReader } from "@/domain/types/repositories";

export class FindManyModelsByIdsUseCase {
	public constructor(private readonly reader: IModelsReader) {}

	public async run(ids: string[]): Promise<IModels[]> {
		return await this.reader.findManyByIds(ids);
	}
}
