const SSDB = require("../SSDB.js");

let host = "127.0.0.1";
let port = "8888";
let ssdb = SSDB.connect({ host, port }, (wtf) => wtf);

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

afterAll(() => {
  ssdb.close();
});
