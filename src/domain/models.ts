import { Entity } from "@roastery/beans";
import { UnpackedModelsSchema } from "./schemas";
import type { IConstructorModels, IModels, IRawModels } from "./types";
import type { Schema } from "@roastery/terroir/schema";
import {
    EntityContext,
    EntitySchema,
    EntitySource,
    EntityStorage,
} from "@roastery/beans/entity/symbols";
import { AutoUpdate } from "@roastery/beans/entity/decorators";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { ValidInfoVO } from "./value-objects";
import type { EntityDTO } from "@roastery/beans/entity/dtos";
import { makeEntity } from "@roastery/beans/entity/factories";

export class Models extends Entity<UnpackedModelsSchema> implements IModels {
    public override readonly [EntitySource]: string = "models@models";
    public static readonly [EntitySource]: string = "models@models";
    public override readonly [EntitySchema]: Schema<UnpackedModelsSchema> =
        UnpackedModelsSchema;

    private _type: IModelsType;
    private _content: ValidInfoVO;

    private constructor({ content, type }: IRawModels, entityProps: EntityDTO) {
        super(entityProps);
        this[EntityStorage].set("schema", type.schema.toString());

        this._type = type;
        this._content = ValidInfoVO.make(
            content,
            this[EntityContext]("content"),
            this[EntityStorage].get("schema")!,
        );
    }

    public static make(
        data: IConstructorModels,
        entityProps?: EntityDTO,
    ): IModels {
        return new Models(data, entityProps ?? makeEntity());
    }

    @AutoUpdate
    updateContent(value: string): void {
        this[EntityStorage].del("content");

        this._content = ValidInfoVO.make(
            value,
            this[EntityContext]("content"),
            this[EntityStorage].get("schema")!,
        );
    }

    get type(): IModelsType {
        return this._type;
    }

    get content(): string {
        return (
            this[EntityStorage].get("content") ??
            (() => {
                this[EntityStorage].set(
                    "content",
                    JSON.stringify(this._content.value),
                );

                return this[EntityStorage].get("content")!;
            })()
        );
    }
}
