const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("List", () => {
  describe("qpush_front", () => {
    // false on error, other values indicate OK.

    test("faitu", async () => {
      const resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
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
