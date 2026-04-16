import { beforeEach, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
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

function makeBody(overrides?: Record<string, unknown>) {
	return {
		typeId: TYPE.id,
		data: JSON.stringify({ name: "Alan", age: 22 }),
		...overrides,
	};
}

describe("CreateModelsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let env: App["decorator"]["env"];

	beforeEach(async () => {
		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.modelsTypeRepositoryForModels.seed([TYPE]);

		api = treaty<typeof server>(server);
		env = server.decorator.env;
	});

	async function authenticate() {
		const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
		const auth = await api.auth.login.post({ email, password });
		const cookies = auth.response.headers.getSetCookie();
		return { headers: { cookie: cookies.join("; ") } };
	}

	it("should create a models entry and return 201", async () => {
		const options = await authenticate();

		const { status } = await api.models.post(makeBody(), options);

		expect(status).toBe(201);
	});

	it("should return the full models entry on creation", async () => {
		const options = await authenticate();
		const body = makeBody();

		const { data } = await api.models.post(body, options);

		expect(data?.id).toBeDefined();
		expect(data?.createdAt).toBeDefined();
		expect(data?.updatedAt).toBeUndefined();
		expect(data?.type).toMatchObject({ id: TYPE.id });
		expect(JSON.parse(data?.data ?? "null")).toMatchObject({
			name: "Alan",
			age: 22,
		});
	});

	it("should reject unauthenticated requests", async () => {
		const { status } = await api.models.post(makeBody());

		expect(status).not.toBe(201);
	});

	it("should reject a request with missing data", async () => {
		const options = await authenticate();

		const { status } = await api.models.post(
			{ typeId: TYPE.id } as never,
			options,
		);

		expect(status).toBe(422);
	});

	it("should reject a request with a non-UUID typeId", async () => {
		const options = await authenticate();

		const { status } = await api.models.post(
			{ typeId: "not-a-uuid", data: JSON.stringify({ name: "x", age: 1 }) },
			options,
		);

		expect(status).toBe(422);
	});

	it("should reject a request for a non-existent typeId", async () => {
		const options = await authenticate();

		const { status } = await api.models.post(
			makeBody({ typeId: crypto.randomUUID() }),
			options,
		);

		expect(status).not.toBe(201);
	});
});
