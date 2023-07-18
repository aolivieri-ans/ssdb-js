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
describe("Raw request function", () => {
  async function setupTestZset() {
    await expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "sirvano", 3)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "maurizio", 3)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "dora", 4)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "oreste", 10)).resolves.toBe(1);
  }

  test("raw get", async () => {
    expect(
      ssdb.raw_request(["hset", "test", "marino", "sumo"])
    ).resolves.toEqual(["ok", "1"]);
    await expect(ssdb.raw_request(["hget", "test", "marino"])).resolves.toEqual([
      "ok",
      "sumo",
    ]);
  });

  test("raw zset ops", async () => {
    await setupTestZset();
    await expect(ssdb.raw_request(["zcount", "test", "", ""])).resolves.toEqual([
      "ok",
      "6",
    ]);
    await expect(ssdb.raw_request(["zpop_front", "test", "2"])).resolves.toEqual([
      "ok",
      "marino",
      "1",
      "sumo",
      "2",
    ]);
    await expect(ssdb.raw_request(["zcount", "test", "", ""])).resolves.toEqual([
      "ok",
      "4",
    ]);
  });

  // TODO

  // zkeys
  // zpop_front
  // hscan
  // multi_hdel
  //
});
