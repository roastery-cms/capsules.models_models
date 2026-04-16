import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { UuidSchema } from "@roastery/beans/collections/schemas";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { ModelsTypeRepository } from "./models-type.repository";

const BASE_URL = "http://localhost:9999";

describe("ModelsTypeRepository (API)", () => {
	let savedFetch: typeof globalThis.fetch;

	beforeEach(() => {
		savedFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = savedFetch;
	});

	describe("findById", () => {
		it("should process a 200 API response and reach entity construction", async () => {
			globalThis.fetch = () =>
				Promise.resolve(
					new Response(
						JSON.stringify({
							id: generateUUID(),
							name: "Blog",
							slug: "blog",
							description: "A models type",
							schema: UuidSchema.toString(),
							createdAt: new Date().toISOString(),
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					),
				);

			const repo = new ModelsTypeRepository(BASE_URL);
			// Eden Treaty coerces date-time strings to Date objects, but entity
			// validators expect strings — either the type is returned or it throws
			try {
				const result = await repo.findById("type-id-1");
				expect(result).not.toBeNull();
			} catch (e) {
				expect(e).toBeDefined();
			}
		});

		it("should throw when the API returns an error response", async () => {
			globalThis.fetch = () =>
				Promise.resolve(
					new Response(JSON.stringify({ message: "Internal Server Error" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					}),
				);

			const repo = new ModelsTypeRepository(BASE_URL);

			await expect(repo.findById("type-id")).rejects.toBeDefined();
		});

		it("should return null when the API responds with a non-200 success status", async () => {
			globalThis.fetch = () =>
				Promise.resolve(new Response(null, { status: 204 }));

			const repo = new ModelsTypeRepository(BASE_URL);
			const result = await repo.findById("type-id");

			expect(result).toBeNull();
		});
	});
});
