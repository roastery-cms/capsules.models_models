import type { IModelsReader } from "./models-reader.interface";
import type { IModelsWriter } from "./models-writer.interface";

export interface IModelsRepository extends IModelsWriter, IModelsReader {}
