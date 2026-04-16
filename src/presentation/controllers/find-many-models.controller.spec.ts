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

const OTHER_TYPE = makeModelsType(
	"other-type",
	"another models type",
	Schema.make(payloadDTO).toString(),
);

function seedItems(count: number, type = TYPE) {
	return Array.from({ length: count }, (_, i) =>
		Models.make({
			type,
			data: JSON.stringify({ name: `User ${i}`, age: 20 + i }),
		}),
	);
}

describe("FindManyModelsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;

	beforeEach(async () => {
		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.modelsTypeRepositoryForModels.seed([TYPE, OTHER_TYPE]);
		decorator.modelsRepository.repository.seed([
			...seedItems(15, TYPE),
			...seedItems(3, OTHER_TYPE),
		]);

		api = treaty<typeof server>(server);
	});

	it("should return a list of models entries with status 200", async () => {
		const { status, data } = await api.models.get({
			query: { page: 1, typeId: TYPE.id },
		});

		expect(status).toBe(200);
		expect(data).toBeArray();
		expect(data?.length).toBeGreaterThan(0);
	});

	it("should only return entries scoped to the requested type", async () => {
		const { data } = await api.models.get({
			query: { page: 1, typeId: OTHER_TYPE.id },
		});

		expect(data).toBeArray();
		expect(data?.length).toBe(3);
		for (const entry of data ?? []) {
			expect(entry.type.id).toBe(OTHER_TYPE.id);
		}
	});

	it("should return pagination headers", async () => {
		const { response } = await api.models.get({
			query: { page: 1, typeId: TYPE.id },
		});

		expect(response.headers.get("X-Total-Count")).toBe("15");
		expect(response.headers.get("X-Total-Pages")).toBeDefined();
	});

	it("should return an empty list for a page with no data", async () => {
		const { status, data } = await api.models.get({
			query: { page: 999, typeId: TYPE.id },
		});

		expect(status).toBe(200);
		expect(data).toBeArray();
		expect(data?.length).toBe(0);
	});

	it("should reject a request without typeId", async () => {
		const { status } = await api.models.get({
			query: { page: 1 } as never,
		});

		expect(status).toBe(422);
	});

	it("should reject a request with a non-UUID typeId", async () => {
		const { status } = await api.models.get({
			query: { page: 1, typeId: "not-a-uuid" },
		});

		expect(status).toBe(422);
	});

	it("should return an error for an unknown typeId", async () => {
		const { status } = await api.models.get({
			query: { page: 1, typeId: generateUUID() },
		});

		expect(status).not.toBe(200);
	});
});
