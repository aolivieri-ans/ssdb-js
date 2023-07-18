const { SSDBClient } = require("../index");
const cfg = require("./cfg");

let ssdb = new SSDBClient(cfg.single_host);

beforeAll(async () => {
  await ssdb.connect();
});

beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(async () => {
  await ssdb.a_compact();
  ssdb.close();
});

// Server commands tests
describe("Server commands", () => {
  test("flushdb", async () => {
    await expect(ssdb.a_hset("test", "marino", "sumo")).resolves.toBe(1);
    await expect(ssdb.a_hget("test", "marino")).resolves.toEqual("sumo");
    await expect(ssdb.a_flushdb()).resolves.toBe("ok");
    await expect(ssdb.a_hget("test", "marino")).rejects.toEqual("not_found");
  });

  test("dbsize", async () => {
    await expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
    await expect(ssdb.a_dbsize()).resolves.toBeGreaterThanOrEqual(0);
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
