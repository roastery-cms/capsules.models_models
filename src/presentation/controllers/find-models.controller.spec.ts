import { beforeEach, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Models } from "@/domain";
import { makeModelsType } from "@roastery-capsules/models.models-type/infra/factories/domain";
import { t } from "@roastery/terroir";
import { Schema } from "@roastery/terroir/schema";
import { bootstrap } from "../server";

type App = Awaited<ReturnType<typeof bootstrap>>;

const payloadDTO = t.Object({
	name: t.String({ minLength: 1 }),
	age: t.Number({ minimum: 0 }),
});

const TYPE = makeModelsType(
	"models-type",
	"example models type for tests",
	Schema.make(payloadDTO).toString(),
);

describe("FindModelsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let model: ReturnType<typeof Models.make>;

	beforeEach(async () => {
		model = Models.make({
			type: TYPE,
			data: JSON.stringify({ name: "Alan", age: 22 }),
		});

		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.modelsTypeRepositoryForModels.seed([TYPE]);
		decorator.modelsRepository.repository.seed([model]);

		api = treaty<typeof server>(server);
	});

	it("should find a models entry by id and return 200", async () => {
		const { status, data } = await api.models({ id: model.id }).get();

		expect(status).toBe(200);
		expect(data?.id).toBe(model.id);
	});

	it("should return the full models entry payload", async () => {
		const { data } = await api.models({ id: model.id }).get();

		expect(data).toMatchObject({
			id: model.id,
			type: { id: TYPE.id },
		});
		expect(data?.createdAt).toBeDefined();
		expect(JSON.parse(data?.data ?? "null")).toMatchObject({
			name: "Alan",
			age: 22,
		});
	});

	it("should not require authentication", async () => {
		const { status } = await api.models({ id: model.id }).get();

		expect(status).toBe(200);
	});

	it("should return error for a non-existent id", async () => {
		const { status } = await api.models({ id: generateUUID() }).get();

		expect(status).not.toBe(200);
	});

	it("should reject a non-UUID id", async () => {
		const { status } = await api.models({ id: "not-a-uuid" }).get();

		expect(status).toBe(422);
	});
});
