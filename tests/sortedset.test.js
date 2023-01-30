const SSDB = require("../SSDB.js");

let host = "127.0.0.1";
let port = "8888";
let ssdb = SSDB.connect({ host, port }, (wtf) => wtf);

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

afterAll(() => {
  ssdb.close();
});
