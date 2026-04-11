import type { IRawEntity } from "@roastery/beans/entity/types";
import type { IRawModels } from "./raw-models.interface";

export interface IUnpackedModels extends IRawModels, IRawEntity {}
