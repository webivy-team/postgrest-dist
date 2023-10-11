import assert from "node:assert";
import test from "node:test";
import postgrest from "postgrest-dist";

test("postgrest should respond to requests after running", async () => {
  const server = await postgrest({
    PGRST_DB_ANON_ROLE: "postgres",
  });
  const response = await fetch("http://127.0.0.1:3000").then((res) =>
    res.json()
  );
  assert.equal(response.info.title, "standard public schema");
  await server.stop();
});

test("postgrest should use passed in environment variables", async () => {
  const server = await postgrest({
    PGRST_DB_ANON_ROLE: "postgres",
    PGRST_OPENAPI_MODE: "disabled",
    PGRST_SERVER_PORT: 3001,
  });
  const response = await fetch("http://127.0.0.1:3001").then((res) =>
    res.json()
  );
  assert.equal(response.info, undefined);
  await server.stop();
});
