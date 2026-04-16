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

describe("FindManyModelsByIdsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let models: ReturnType<typeof Models.make>[];

	beforeEach(async () => {
		models = Array.from({ length: 3 }, (_, i) =>
			Models.make({
				type: TYPE,
				data: JSON.stringify({ name: `User ${i}`, age: 20 + i }),
			}),
		);

		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.modelsTypeRepositoryForModels.seed([TYPE]);
		decorator.modelsRepository.repository.seed(models);

		api = treaty<typeof server>(server);
	});

	it("should return all entries matching the provided ids", async () => {
		const ids = models.map((m) => m.id).join(",");

		const { status, data } = await api.models["by-ids"].get({
			query: { ids },
		});

		expect(status).toBe(200);
		expect(data).toBeArray();
		expect(data?.length).toBe(models.length);
	});

	it("should accept a single id in the csv", async () => {
		const { status, data } = await api.models["by-ids"].get({
			query: { ids: models[0]!.id },
		});

		expect(status).toBe(200);
		expect(data).toBeArray();
		expect(data?.length).toBe(1);
		expect(data?.[0]?.id).toBe(models[0]!.id);
	});

	it("should silently skip ids that do not exist", async () => {
		const ids = [models[0]!.id, generateUUID()].join(",");

		const { status, data } = await api.models["by-ids"].get({
			query: { ids },
		});

		expect(status).toBe(200);
		expect(data?.length).toBe(1);
		expect(data?.[0]?.id).toBe(models[0]!.id);
	});

	it("should not require authentication", async () => {
		const { status } = await api.models["by-ids"].get({
			query: { ids: models[0]!.id },
		});

		expect(status).toBe(200);
	});

	it("should reject a malformed csv query", async () => {
		const { status } = await api.models["by-ids"].get({
			query: { ids: "not,valid,uuids" },
		});

		expect(status).toBe(422);
	});

	it("should reject an empty ids query", async () => {
		const { status } = await api.models["by-ids"].get({
			query: { ids: "" },
		});

		expect(status).toBe(422);
	});
});
