import { Models } from "@/domain";
import type { IModels } from "@/domain/types";
import type { IModelsRepository } from "@/domain/types/repositories";
import type { PrismaClient } from "@roastery-adapters/models";
import { SafePrisma } from "@roastery-adapters/models/decorators";
import { Mapper } from "@roastery/beans";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import { ModelsMapper } from "./models.mapper";

type SELECT = { [key: string]: boolean | SELECT };

const ENTITY_DEFAULT_SELECT = {
    id: true,
    createdAt: true,
    updatedAt: true,
} as const satisfies SELECT;

const MODELS_DEFAULT_SELECT = {
    modelType: {
        select: {
            ...ENTITY_DEFAULT_SELECT,
            name: true,
            slug: true,
            description: true,
            schema: true,
        },
    },
    ...ENTITY_DEFAULT_SELECT,
    data: true,
} as const satisfies SELECT;

export class ModelsRepository implements IModelsRepository {
    public constructor(private readonly prisma: PrismaClient) {}

    @SafePrisma(Models[EntitySource])
    async create(_data: IModels): Promise<void> {
        const { type, ...content } = Mapper.toDTO(_data);

        await this.prisma.model.create({
            data: { modelTypeId: type.id, ...content },
        });
    }

    @SafePrisma(Models[EntitySource])
    async update(_data: IModels): Promise<void> {
        const { id, createdAt: _1, type: _2, ...data } = Mapper.toDTO(_data);

        await this.prisma.model.update({ where: { id }, data });
    }

    @SafePrisma(Models[EntitySource])
    async delete({ id }: IModels): Promise<void> {
        await this.prisma.model.delete({ where: { id } });
    }

    @SafePrisma(Models[EntitySource])
    async findByModelsTypeId(
        modelTypeId: string,
        page: number,
    ): Promise<IModels[]> {
        return (
            await this.prisma.model.findMany({
                where: { modelTypeId },
                skip: MAX_ITEMS_PER_QUERY * (page - 1),
                take: MAX_ITEMS_PER_QUERY,
                select: MODELS_DEFAULT_SELECT,
            })
        ).map((models) => ModelsMapper.run(models as never));
    }

    @SafePrisma(Models[EntitySource])
    async findManyByIds(ids: string[]): Promise<IModels[]> {
        return (
            await this.prisma.model.findMany({
                where: { id: { in: ids } },
                select: MODELS_DEFAULT_SELECT,
            })
        ).map((models) => ModelsMapper.run(models as never));
    }

    @SafePrisma(Models[EntitySource])
    async countByModelsTypeId(modelTypeId: string): Promise<number> {
        return await this.prisma.model.count({ where: { modelTypeId } });
    }

    @SafePrisma(Models[EntitySource])
    async findById(id: string): Promise<IModels | null> {
        const data = await this.prisma.model.findUnique({
            where: { id },
            select: MODELS_DEFAULT_SELECT,
        });

        if (!data) return null;

        return ModelsMapper.run(data as never);
    }
}
