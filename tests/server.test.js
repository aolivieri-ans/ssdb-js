const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// Server commands tests
describe("Server commands", () => {
  test("flushdb", async () => {
    expect(ssdb.a_hset("test", "marino", "sumo")).resolves.toBe(1);
    expect(ssdb.a_hget("test", "marino")).resolves.toEqual("sumo");
    expect(ssdb.a_flushdb()).resolves.toBe("ok");
    expect(ssdb.a_hget("test", "marino")).rejects.toEqual("not_found");
  });

  test("dbsize", async () => {
    expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
    expect(ssdb.a_dbsize()).resolves.toBeGreaterThanOrEqual(0);
  });
  describe("info", () => {
    test("default args", async () => {
      let info = await ssdb.a_info();
      expect(Object.keys(info).length).toBeGreaterThan(0);
    });
    test("cmd arg", async () => {
      let info = await ssdb.a_info("cmd");
      expect(Object.keys(info).length).toBeGreaterThan(0);
    });

    test("leveldb arg", async () => {
      let info = await ssdb.a_info("leveldb");
      expect(Object.keys(info).length).toBeGreaterThan(0);
    });
  });

  describe("IP filter", () => {
    test("TODO", async () => {
      // TODO
      expect(1).toBeGreaterThan(0);
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
