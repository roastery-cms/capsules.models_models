import type { IModels } from "../models.interface";

export interface IModelsWriter {
	create(data: IModels): Promise<void>;
	update(data: IModels): Promise<void>;
	delete(data: IModels): Promise<void>;
}
