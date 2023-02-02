const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("sortedset", () => {
  describe("sorteset_set", () => {
    // false on error, other values indicate OK.
    test("zset/get", async () => {
      let resp = await ssdb.a_zset("test", "marino", 2);
      expect(resp).toBe(1);
      // resp = await ssdb.a_zset("test1", "marino",2);
      expect(resp).toBe(1);
      resp = await ssdb.a_zget("test", "marino");
      expect(resp).toBe(2);
      resp = await ssdb.a_zsize("test");
      expect(resp).toBe(1);
      resp = await ssdb.a_zsize("test1");
      expect(resp).toBe(0);
      resp = await ssdb.a_zdel("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_zdel("test1", "marino");
      expect(resp).toBe(0);

      for (let i = 0; i < 50; i++) {
        let resp = await ssdb.a_zset("test", `marino_${i}`, i);
        resp = await ssdb.a_zset(`test_${i}`, `marino_${i}`, i);
        expect(resp).toBe(1);
      }
      //console.log(await ssdb.a_zget("test", "marino_10"))
      resp = await ssdb.a_zsize("test");
      //console.log(resp)
      resp = await ssdb.a_zscan("test", "marino", 0, 100, 2);
      expect(resp).toEqual([0, ["marino_0", 0, "marino_1", 1]]);
      resp = await ssdb.a_zlist("", "", "10");
      expect(resp).toEqual([
        0,
        [
          "test",
          "test_0",
          "test_1",
          "test_10",
          "test_11",
          "test_12",
          "test_13",
          "test_14",
          "test_15",
          "test_16",
        ],
      ]);

      resp = await ssdb.a_zsum("test", "", "");
      expect(resp).toContain(1225);
      resp = await ssdb.a_zavg("test", "", "");
      expect(resp).toContain(24);
      resp = await ssdb.a_zexists("test", "marino_1");
      expect(resp).toBe(1);
      resp = await ssdb.a_zexists("test", "marino_");
      expect(resp).toBe(0);
      resp = await ssdb.a_zincr("test", "marino_", 10);
      expect(resp).toBe(0);
      resp = await ssdb.a_zkeys("test", "", "", "", "");
      //console.log(`zkeys = ${resp}`);
      resp = await ssdb.a_zrscan("test", "", "", "", 10);
      //console.log(`zkeys = ${resp}`);
      resp = await ssdb.a_zrank("test", "marino_0");
      expect(resp).toBe(0);
      expect(ssdb.a_zrank("test", "marino_100")).rejects.toEqual("not_found");
      // resp = await ssdb.a_zcount("test", "");
      // expect(resp).toBe(1);
      expect(ssdb.a_zcount("test", "3", "4")).resolves.toBe(2);
      expect(ssdb.a_zpop_front("test", "1")).resolves.toEqual([
        0,
        ["marino_0", 0],
      ]);
      expect(ssdb.a_zremrangebyrank("test", "2", "2")).resolves.toEqual([0, 1]);
      expect(ssdb.a_zremrangebyscore("test", "2", "2")).resolves.toEqual([
        0, 1,
      ]);
      expect(
        ssdb.a_multi_zset("test", { gino: 12, sirvano: 13, locullo: 11 })
      ).resolves.toBe(3);
      expect(
        ssdb.a_multi_zget("test", ["gino", "sirvano", "locullo"])
      ).resolves.toEqual([0, ["gino", 12, "sirvano", 13, "locullo", 11]]);
      expect(
        ssdb.a_multi_zdel("test", ["gino", "sirvano", "locullo"])
      ).resolves.toBe(3);
      expect(ssdb.a_zrange("test", "", 10)).resolves.toBe(3);
      expect(ssdb.a_zrrange("test", "", 10)).resolves.toBe(3);

      resp = await ssdb.a_zclear("clear");
      expect(resp).toBe(0);
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
