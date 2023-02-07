const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("sortedset", () => {
  async function setupTestZset() {
    expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "sirvano", 3)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "maurizio", 3)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "dora", 4)).resolves.toBe(1);
    expect(ssdb.a_zset("test", "oreste", 10)).resolves.toBe(1);
  }

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
        expect(ssdb.a_zlist("set1", "")).resolves.toEqual(keys.slice(1));
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
      test("open range", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        expect(ssdb.a_zrlist("", "")).resolves.toEqual(keys.reverse());
      });

      test("open range, limit=1", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        expect(ssdb.a_zrlist("", "", 1)).resolves.toEqual(["set4"]);
      });

      test("with lower range (key_start)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        // lower range is not inclusive
        expect(ssdb.a_zrlist("set4", "")).resolves.toEqual(
          keys.reverse().slice(1)
        );
      });
      test("with both lower range (key_start) and upper (key_end)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        keys.forEach((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        });
        // lower range is not inclusive, upper is inclusive
        expect(ssdb.a_zrlist("set3", "set1")).resolves.toEqual([
          "set2",
          "set1",
        ]);
      });
    });

    describe("zkeys", () => {
      test("open range", async () => {
        await setupTestZset();
        // Keys sorted by (score ASC, key ASC)
        expect(ssdb.a_zkeys("test")).resolves.toEqual([
          "marino",
          "sumo",
          "maurizio",
          "sirvano",
          "dora",
          "oreste",
        ]);
      });

      test("open range, limit=1", async () => {
        await setupTestZset();
        // Keys sorted by (score ASC, key ASC)
        expect(ssdb.a_zkeys("test", "", "", "", 1)).resolves.toEqual([
          "marino",
        ]);
      });

      test("open range, with key_start", async () => {
        await setupTestZset();
        // sumo => 2: so range is (2, +INF]
        expect(ssdb.a_zkeys("test", "sumo")).resolves.toEqual([
          "maurizio",
          "sirvano",
          "dora",
          "oreste",
        ]);
      });

      test("open range, with key_start and range_start", async () => {
        await setupTestZset();
        // range is [3, +INF]
        expect(ssdb.a_zkeys("test", "nope", 3)).resolves.toEqual([
          "sirvano",
          "dora",
          "oreste",
        ]);
      });

      test("open range, with key_start, range_start and range_end", async () => {
        await setupTestZset();
        expect(ssdb.a_zkeys("test", "nope", 2, 3)).resolves.toEqual([
          "sumo",
          "maurizio",
          "sirvano",
        ]);
      });
    });

    describe("zscan", () => {
      // That is: return keys in (key.score == score_start && key > key_start || key.score > score_start)
      // && key.score <= score_end.
      //The score_start, score_end is of higher priority than key_start.

      test("non existing zset", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("nope")).resolves.toEqual([]);
      });

      test("all defaults", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("test")).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("with key_start", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("test", "maurizio")).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("with key_start and score_start", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("test", "oreste", 3)).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("with key_start, score_start and score_end", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("test", "oreste", 3, 4)).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
        ]);
      });

      test("with key_start, score_start, score_end and limit", async () => {
        await setupTestZset();
        expect(ssdb.a_zscan("test", "oreste", 3, 4, 1)).resolves.toEqual([
          { sirvano: 3 },
        ]);
      });
    });

    describe("zrscan", () => {
      // TODO
    });

    describe("zrank", () => {
      test("on existing keys", async () => {
        await setupTestZset();
        expect(ssdb.a_zrank("test", "marino")).resolves.toBe(0);
        expect(ssdb.a_zrank("test", "sumo")).resolves.toBe(1);
        expect(ssdb.a_zrank("test", "maurizio")).resolves.toBe(2);
        expect(ssdb.a_zrank("test", "sirvano")).resolves.toBe(3);
        expect(ssdb.a_zrank("test", "dora")).resolves.toBe(4);
        expect(ssdb.a_zrank("test", "oreste")).resolves.toBe(5);
      });

      test("on a non existing keys", async () => {
        await setupTestZset();
        expect(ssdb.a_zrank("test", "nope")).rejects.toEqual("not_found");
      });
    });

    describe("zrrank", () => {
      test("on existing keys", async () => {
        await setupTestZset();
        expect(ssdb.a_zrrank("test", "marino")).resolves.toBe(5);
        expect(ssdb.a_zrrank("test", "sumo")).resolves.toBe(4);
        expect(ssdb.a_zrrank("test", "maurizio")).resolves.toBe(3);
        expect(ssdb.a_zrrank("test", "sirvano")).resolves.toBe(2);
        expect(ssdb.a_zrrank("test", "dora")).resolves.toBe(1);
        expect(ssdb.a_zrrank("test", "oreste")).resolves.toBe(0);
      });

      test("on a non existing keys", async () => {
        await setupTestZset();
        expect(ssdb.a_zrrank("test", "nope")).rejects.toEqual("not_found");
      });
    });

    describe("zrange", () => {
      test("with default values", async () => {
        await setupTestZset();
        expect(ssdb.a_zrange("test")).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("out of bound offset", async () => {
        await setupTestZset();
        expect(ssdb.a_zrange("test", 1000)).resolves.toEqual([]);
      });

      test("exceeding limit", async () => {
        await setupTestZset();
        expect(ssdb.a_zrange("test", 0, 1000)).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
    });

    describe("zrrange", () => {
      test("with default values", async () => {
        await setupTestZset();
        expect(ssdb.a_zrrange("test")).resolves.toEqual([
          { oreste: 10 },
          { dora: 4 },
          { sirvano: 3 },
          { maurizio: 3 },
          { sumo: 2 },
          { marino: 1 },
        ]);
      });

      test("out of bound offset", async () => {
        await setupTestZset();
        expect(ssdb.a_zrrange("test", 1000)).resolves.toEqual([]);
      });

      test("exceeding limit", async () => {
        await setupTestZset();
        expect(ssdb.a_zrange("test", 0, 1000)).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
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
