const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("sortedset", () => {
  describe("aa_get", () => {
    // false on error, other values indicate OK.

    test("blabla", async () => {
      expect("1").toBe("1");
    });
  });
});

beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(async () => {
  await ssdb.a_compact();
  ssdb.close();
});
