import type {
	IModelsRepository,
	IModelsTypeRepository,
} from "@/domain/types/repositories";

export interface IControllersWithoutAuth {
	modelsRepository: IModelsRepository;
	modelsTypeRepository: IModelsTypeRepository;
}
