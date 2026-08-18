const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test("verifyToken rejects missing credentials", () => {
  const res = response(); verifyToken({ headers: {} }, res, () => assert.fail("next called"));
  assert.equal(res.statusCode, 401);
});

test("verifyToken accepts a valid bearer token", () => {
  process.env.JWT_SECRET = "test-secret";
  const token = jwt.sign({ id: "admin" }, process.env.JWT_SECRET, { expiresIn: "1m" });
  const req = { headers: { authorization: `Bearer ${token}` } }; const res = response(); let called = false;
  verifyToken(req, res, () => { called = true; });
  assert.equal(called, true); assert.equal(req.user.id, "admin");
});
