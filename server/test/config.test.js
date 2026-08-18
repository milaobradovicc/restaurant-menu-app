const test = require("node:test");
const assert = require("node:assert/strict");
const { getConfig } = require("../config");

test("getConfig requires secrets and database configuration", () => {
  assert.throws(() => getConfig({}), /MONGO_URI, JWT_SECRET/);
});

test("getConfig parses origins and port", () => {
  const config = getConfig({ MONGO_URI: "mongodb://example", JWT_SECRET: "secret", CLIENT_ORIGINS: "https://one.test, https://two.test", PORT: "7000" });
  assert.deepEqual(config.allowedOrigins, ["https://one.test", "https://two.test"]);
  assert.equal(config.port, 7000);
});
