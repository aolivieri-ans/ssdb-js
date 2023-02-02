const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("sortedset", () => {
  describe("sorteset_set", () => {
    // false on error, other values indicate OK.
    describe("zset/get", () => {
      /*
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
      */
    });

    describe("zset", () => {
      test("a non existing value", async () => {
        expect(ssdb.a_zset("test", "marino", 2)).resolves.toBe(1);
        expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
      });
      test("an existing value", async () => {
        expect(ssdb.a_zset("test", "marino", 2)).resolves.toBe(1);
        expect(ssdb.a_zset("test", "marino", 3)).resolves.toBe(0);
      });
    });

    describe("zget", () => {
      test("an existing key", async () => {
        expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        expect(ssdb.a_zget("test", "marino")).resolves.toBe(42);
      });
      test("a non existing key of an existing set", async () => {
        expect(ssdb.a_zget("test", "marino")).rejects.toEqual("not_found");
      });
      test("on a non existing set", async () => {
        expect(ssdb.a_zget("nope", "marino")).rejects.toEqual("not_found");
      });
    });

    describe("zdel", () => {
      test("an existing key", async () => {
        // returns 1 if key existed
        expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        expect(ssdb.a_zdel("test", "marino")).resolves.toBe(1);
      });
      test("a non existing key of an existing set", async () => {
        // returns 0 if key didn't exist
        expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        expect(ssdb.a_zdel("test", "sumo")).resolves.toBe(0);
      });
      test("a non existing set", async () => {
        expect(ssdb.a_zdel("nope", "marino")).resolves.toBe(0);
      });
    });

    describe("zincr", () => {
      test("an existing key", async () => {
        // returns 1 if key exists
        expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        expect(ssdb.a_zincr("test", "marino", 1)).resolves.toBe(0);
        expect(ssdb.a_zget("test", "marino")).resolves.toBe(43);
        expect(ssdb.a_zincr("test", "marino", 10)).resolves.toBe(0);
        expect(ssdb.a_zget("test", "marino")).resolves.toBe(53);
      });
      test("an non-existing key", async () => {
        // If key not exists, returns 0 and auto-create the key
        expect(ssdb.a_zincr("test", "marino", 10)).resolves.toBe(0);
        expect(ssdb.a_zget("test", "marino")).resolves.toBe(10);
      });
    });

    describe("zexists", () => {
      test("an existing key", async () => {
        // returns 1 if key exists
        expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        expect(ssdb.a_zexists("test", "marino")).resolves.toBe(1);
      });
      test("a non-existing key", async () => {
        // returns 0 if key does not exists
        expect(ssdb.a_zexists("test", "nope")).resolves.toBe(0);
      });
      test("a non-existing set", async () => {
        // returns 0 if key does not exists
        expect(ssdb.a_zexists("nope", "nope")).resolves.toBe(0);
      });
    });

    describe("zsize", () => {
      test("an existing set", async () => {
        expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
        expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
        expect(ssdb.a_zset("test", "sirvano", 3)).resolves.toBe(1);
        expect(ssdb.a_zset("test", "dora", 3)).resolves.toBe(1);
        expect(ssdb.a_zsize("test")).resolves.toBe(4);
      });
      test("a non-existing set", async () => {
        expect(ssdb.a_zsize("nooope")).resolves.toBe(0);
      });
    });

    describe("zlist", () => {
      test("open range", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        expect(ssdb.a_zlist("", "")).resolves.toEqual(keys);
      });
      test("open range, limit=1", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        expect(ssdb.a_zlist("", "", 1)).resolves.toEqual(["set1"]);
      });
      test("with lower range (key_start)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        // lower range is not inclusive
        expect(ssdb.a_zlist("set1", "z")).resolves.toEqual(keys.slice(1));
      });
      test("with both lower range (key_start) and upper (key_end)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        // lower range is not inclusive, upper is inclusive
        expect(ssdb.a_zlist("set1", "set3")).resolves.toEqual(["set2", "set3"]);
      });
    });

    describe("zrlist", () => {
      // TODO
    });

    describe("zkeys", () => {
      // TODO
    });

    describe("zscan", () => {
      // TODO
    });

    describe("zrscan", () => {
      // TODO
    });

    describe("zrank", () => {
      // TODO
    });

    describe("zrank", () => {
      // TODO
    });

    describe("zrrank", () => {
      // TODO
    });

    describe("zrange", () => {
      // TODO
    });

    describe("zrrange", () => {
      // TODO
    });

    describe("zclear", () => {
      // TODO
    });

    describe("zcount", () => {
      // TODO
    });

    describe("zsum", () => {
      // TODO
    });

    describe("zavg", () => {
      // TODO
    });

    describe("zremrangebyrank", () => {
      // TODO
    });

    describe("zremrangebyscore", () => {
      // TODO
    });

    describe("zpop_front", () => {
      // TODO
    });

    describe("zpop_back", () => {
      // TODO
    });

    describe("multi_zset", () => {
      // TODO
    });

    describe("multi_zget", () => {
      // TODO
    });

    describe("multi_zdel", () => {
      // TODO
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
