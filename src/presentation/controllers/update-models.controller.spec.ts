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

describe("UpdateModelsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let env: App["decorator"]["env"];
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
		env = server.decorator.env;
	});

	async function authenticate() {
		const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
		const auth = await api.auth.login.post({ email, password });
		const cookies = auth.response.headers.getSetCookie();
		return { headers: { cookie: cookies.join("; ") } };
	}

	it("should update a models entry and return 200", async () => {
		const options = await authenticate();

		const { status } = await api
			.models({ id: model.id })
			.patch({ data: JSON.stringify({ name: "Bob", age: 30 }) }, options);

		expect(status).toBe(200);
	});

	it("should return the updated models entry payload", async () => {
		const options = await authenticate();
		const newData = JSON.stringify({ name: "Bob", age: 30 });

		const { data } = await api
			.models({ id: model.id })
			.patch({ data: newData }, options);

		expect(data?.id).toBe(model.id);
		expect(JSON.parse(data?.data ?? "null")).toMatchObject({
			name: "Bob",
			age: 30,
		});
		expect(data?.updatedAt).toBeDefined();
	});

	it("should reject unauthenticated requests", async () => {
		const { status } = await api
			.models({ id: model.id })
			.patch({ data: JSON.stringify({ name: "Bob", age: 30 }) });

		expect(status).not.toBe(200);
	});

	it("should reject an empty body", async () => {
		const options = await authenticate();

		const { status } = await api
			.models({ id: model.id })
			.patch({} as never, options);

		expect(status).toBe(422);
	});

	it("should return error for a non-existent id", async () => {
		const options = await authenticate();

		const { status } = await api
			.models({ id: generateUUID() })
			.patch({ data: JSON.stringify({ name: "Bob", age: 30 }) }, options);

		expect(status).not.toBe(200);
	});

	it("should reject a non-UUID id", async () => {
		const options = await authenticate();

		const { status } = await api
			.models({ id: "not-a-uuid" })
			.patch({ data: JSON.stringify({ name: "Bob", age: 30 }) }, options);

		expect(status).toBe(422);
	});
});
