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

// List tests
describe("sortedset", () => {
  async function setupTestZset() {
    await expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "sirvano", 3)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "maurizio", 3)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "dora", 4)).resolves.toBe(1);
    await expect(ssdb.a_zset("test", "oreste", 10)).resolves.toBe(1);
  }

  describe("sorteset_set", () => {
    // false on error, other values indicate OK.

    describe("zset", () => {
      test("a non existing value", async () => {
        await expect(ssdb.a_zset("test", "marino", 2)).resolves.toBe(1);
        await expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
      });
      test("an existing value", async () => {
        await expect(ssdb.a_zset("test", "marino", 2)).resolves.toBe(1);
        await expect(ssdb.a_zset("test", "marino", 3)).resolves.toBe(0);
      });
    });

    describe("zget", () => {
      test("an existing key", async () => {
        await expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        await expect(ssdb.a_zget("test", "marino")).resolves.toBe(42);
      });
      test("a non existing key of an existing set", async () => {
        await expect(ssdb.a_zget("test", "marino")).rejects.toEqual("not_found");
      });
      test("on a non existing set", async () => {
        await expect(ssdb.a_zget("nope", "marino")).rejects.toEqual("not_found");
      });
    });

    describe("zdel", () => {
      test("an existing key", async () => {
        // returns 1 if key existed
        await expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        await expect(ssdb.a_zdel("test", "marino")).resolves.toBe(1);
      });
      test("a non existing key of an existing set", async () => {
        // returns 0 if key didn't exist
        await expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        await expect(ssdb.a_zdel("test", "sumo")).resolves.toBe(0);
      });
      test("a non existing set", async () => {
        await expect(ssdb.a_zdel("nope", "marino")).resolves.toBe(0);
      });
    });

    describe("zincr", () => {
      test("an existing key", async () => {
        // returns 1 if key exists
        await expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        await expect(ssdb.a_zincr("test", "marino", 1)).resolves.toBe(0);
        await expect(ssdb.a_zget("test", "marino")).resolves.toBe(43);
        await expect(ssdb.a_zincr("test", "marino", 10)).resolves.toBe(0);
        await expect(ssdb.a_zget("test", "marino")).resolves.toBe(53);
      });
      test("an non-existing key", async () => {
        // If key not exists, returns 0 and auto-create the key
        await expect(ssdb.a_zincr("test", "marino", 10)).resolves.toBe(0);
        await expect(ssdb.a_zget("test", "marino")).resolves.toBe(10);
      });
    });

    describe("zexists", () => {
      test("an existing key", async () => {
        // returns 1 if key exists
        await expect(ssdb.a_zset("test", "marino", 42)).resolves.toBe(1);
        await expect(ssdb.a_zexists("test", "marino")).resolves.toBe(1);
      });
      test("a non-existing key", async () => {
        // returns 0 if key does not exists
        await expect(ssdb.a_zexists("test", "nope")).resolves.toBe(0);
      });
      test("a non-existing set", async () => {
        // returns 0 if key does not exists
        await expect(ssdb.a_zexists("nope", "nope")).resolves.toBe(0);
      });
    });

    describe("zsize", () => {
      test("an existing set", async () => {
        await expect(ssdb.a_zset("test", "marino", 1)).resolves.toBe(1);
        await expect(ssdb.a_zset("test", "sumo", 2)).resolves.toBe(1);
        await expect(ssdb.a_zset("test", "sirvano", 3)).resolves.toBe(1);
        await expect(ssdb.a_zset("test", "dora", 3)).resolves.toBe(1);
        await expect(ssdb.a_zsize("test")).resolves.toBe(4);
      });
      test("a non-existing set", async () => {
        await expect(ssdb.a_zsize("nooope")).resolves.toBe(0);
      });
    });

    describe("zlist", () => {
      test("open range", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        await expect(ssdb.a_zlist("", "")).resolves.toEqual(keys);
      });
      test("open range, limit=1", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        await expect(ssdb.a_zlist("", "", 1)).resolves.toEqual(["set1"]);
      });
      test("with lower range (key_start)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        // lower range is not inclusive
        await expect(ssdb.a_zlist("set1", "")).resolves.toEqual(keys.slice(1));
      });
      test("with both lower range (key_start) and upper (key_end)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        // lower range is not inclusive, upper is inclusive
        await expect(ssdb.a_zlist("set1", "set3")).resolves.toEqual(["set2", "set3"]);
      });
    });

    describe("zrlist", () => {
      test("open range", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        await expect(ssdb.a_zrlist("", "")).resolves.toEqual(keys.reverse());
      });

      test("open range, limit=1", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        await expect(ssdb.a_zrlist("", "", 1)).resolves.toEqual(["set4"]);
      });

      test("with lower range (key_start)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        // lower range is not inclusive
        await expect(ssdb.a_zrlist("set4", "")).resolves.toEqual(
          keys.reverse().slice(1)
        );
      });
      test("with both lower range (key_start) and upper (key_end)", async () => {
        let keys = ["set1", "set2", "set3", "set4"];
        await Promise.all(keys.map((k) => {
          expect(ssdb.a_zset(k, "marino", 1)).resolves.toBe(1);
        }));
        // lower range is not inclusive, upper is inclusive
        await expect(ssdb.a_zrlist("set3", "set1")).resolves.toEqual([
          "set2",
          "set1",
        ]);
      });
    });

    describe("zkeys", () => {
      test("open range", async () => {
        await setupTestZset();
        // Keys sorted by (score ASC, key ASC)
        await expect(ssdb.a_zkeys("test")).resolves.toEqual([
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
        await expect(ssdb.a_zkeys("test", "", "", "", 1)).resolves.toEqual([
          "marino",
        ]);
      });

      test("open range, with key_start", async () => {
        await setupTestZset();
        // sumo => 2: so range is (2, +INF]
        await expect(ssdb.a_zkeys("test", "sumo")).resolves.toEqual([
          "maurizio",
          "sirvano",
          "dora",
          "oreste",
        ]);
      });

      test("open range, with key_start and range_start", async () => {
        await setupTestZset();
        // range is [3, +INF]
        await expect(ssdb.a_zkeys("test", "nope", 3)).resolves.toEqual([
          "sirvano",
          "dora",
          "oreste",
        ]);
      });

      test("open range, with key_start, range_start and range_end", async () => {
        await setupTestZset();
        await expect(ssdb.a_zkeys("test", "nope", 2, 3)).resolves.toEqual([
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
        await expect(ssdb.a_zscan("nope")).resolves.toEqual([]);
      });

      test("all defaults", async () => {
        await setupTestZset();
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
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
        await expect(ssdb.a_zscan("test", "maurizio")).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("with key_start and score_start", async () => {
        await setupTestZset();
        await expect(ssdb.a_zscan("test", "oreste", 3)).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });

      test("with key_start, score_start and score_end", async () => {
        await setupTestZset();
        await expect(ssdb.a_zscan("test", "oreste", 3, 4)).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
        ]);
      });

      test("with key_start, score_start, score_end and limit", async () => {
        await setupTestZset();
        await expect(ssdb.a_zscan("test", "oreste", 3, 4, 1)).resolves.toEqual([
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
        await expect(ssdb.a_zrank("test", "marino")).resolves.toBe(0);
        await expect(ssdb.a_zrank("test", "sumo")).resolves.toBe(1);
        await expect(ssdb.a_zrank("test", "maurizio")).resolves.toBe(2);
        await expect(ssdb.a_zrank("test", "sirvano")).resolves.toBe(3);
        await expect(ssdb.a_zrank("test", "dora")).resolves.toBe(4);
        await expect(ssdb.a_zrank("test", "oreste")).resolves.toBe(5);
      });

      test("on a non existing keys", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrank("test", "nope")).rejects.toEqual("not_found");
      });
    });

    describe("zrrank", () => {
      test("on existing keys", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrrank("test", "marino")).resolves.toBe(5);
        await expect(ssdb.a_zrrank("test", "sumo")).resolves.toBe(4);
        await expect(ssdb.a_zrrank("test", "maurizio")).resolves.toBe(3);
        await expect(ssdb.a_zrrank("test", "sirvano")).resolves.toBe(2);
        await expect(ssdb.a_zrrank("test", "dora")).resolves.toBe(1);
        await expect(ssdb.a_zrrank("test", "oreste")).resolves.toBe(0);
      });

      test("on a non existing keys", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrrank("test", "nope")).rejects.toEqual("not_found");
      });
    });

    describe("zrange", () => {
      test("with default values", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrange("test")).resolves.toEqual([
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
        await expect(ssdb.a_zrange("test", 1000)).resolves.toEqual([]);
      });

      test("exceeding limit", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrange("test", 0, 1000)).resolves.toEqual([
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
        await expect(ssdb.a_zrrange("test")).resolves.toEqual([
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
        await expect(ssdb.a_zrrange("test", 1000)).resolves.toEqual([]);
      });

      test("exceeding limit", async () => {
        await setupTestZset();
        await expect(ssdb.a_zrange("test", 0, 1000)).resolves.toEqual([
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
      // Returns number of deleted keys (0 if zset does not exists)
      test("non-empty zset", async () => {
        await setupTestZset();
        await expect(ssdb.a_zclear("test")).resolves.toBe(6);
      });

      test("empty zset", async () => {
        await setupTestZset();
        await expect(ssdb.a_zclear("nope")).resolves.toBe(0);
      });
    });

    describe("zcount", () => {
      test("default values", async () => {
        await setupTestZset();
        await expect(ssdb.a_zcount("test")).resolves.toBe(6);
      });
      test("with score_start", async () => {
        await setupTestZset();
        await expect(ssdb.a_zcount("test", 3)).resolves.toBe(4);
      });
      test("with score_start and score_end", async () => {
        await setupTestZset();
        await expect(ssdb.a_zcount("test", 3, 4)).resolves.toBe(3);
      });
      test("with score_start and score_end (no values in range)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zcount("test", 11, 20)).resolves.toBe(0);
      });
    });

    describe("zsum", () => {
      test("default values", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test")).resolves.toBe(23);
      });
      test("with score_start", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test", 3)).resolves.toBe(20);
      });
      test("with score_start and score_end", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test", 3, 4)).resolves.toBe(10);
      });
      test("with score_start and score_end (no values in range)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test", 11, 20)).resolves.toBe(0);
      });
    });

    describe("zavg", () => {
      test("default values", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test")).resolves.toBe(23);
        await expect(ssdb.a_zcount("test")).resolves.toBe(6);
        await expect(ssdb.a_zavg("test")).resolves.toBe(3.833333); // 23/6
      });
      test("with score_start", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test", 3)).resolves.toBe(20);
        await expect(ssdb.a_zavg("test", 3)).resolves.toBe(5.0); // 20/4
      });
      test("with score_start and score_end (no values in range)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zsum("test", 11, 20)).resolves.toBe(0);
      });
    });

    describe("zremrangebyrank", () => {
      test("on non-empty rank range", async () => {
        await setupTestZset();
        await expect(ssdb.a_zremrangebyrank("test", 0, 2)).resolves.toBe(3);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
      test("on empty rank range", async () => {
        await setupTestZset();
        await expect(ssdb.a_zremrangebyrank("test", 10, 20)).resolves.toBe(0);
      });
    });

    describe("zremrangebyscore", () => {
      test("on non-empty score range", async () => {
        await setupTestZset();
        await expect(ssdb.a_zremrangebyscore("test", 1, 3)).resolves.toBe(4);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
      test("on empty score range", async () => {
        await setupTestZset();
        await expect(ssdb.a_zremrangebyscore("test", 20, 30)).resolves.toBe(0);
      });
    });

    describe("zpop_front", () => {
      test("pop single element (default limit)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zpop_front("test")).resolves.toEqual([{ marino: 1 }]);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
      test("pop multiple element (limit=2)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zpop_front("test", 2)).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
        ]);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
          { oreste: 10 },
        ]);
      });
    });

    describe("zpop_back", () => {
      test("pop single element (default limit)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zpop_back("test")).resolves.toEqual([{ oreste: 10 }]);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
          { dora: 4 },
        ]);
      });
      test("pop multiple element (limit=2)", async () => {
        await setupTestZset();
        await expect(ssdb.a_zpop_back("test", 2)).resolves.toEqual([
          { oreste: 10 },
          { dora: 4 },
        ]);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
          { maurizio: 3 },
          { sirvano: 3 },
        ]);
      });
    });

    describe("multi_zset", () => {
      test("multiple key-value elements", async () => {
        expect(
          ssdb.a_multi_zset("test", { nonno_palmiro: 100, cagatone_joe: 1000 })
        ).resolves.toEqual(2);
        await expect(ssdb.a_zscan("test")).resolves.toEqual([
          { nonno_palmiro: 100 },
          { cagatone_joe: 1000 },
        ]);
      });
    });

    describe("multi_zget", () => {
      test("multiple keys", async () => {
        await setupTestZset();
        await expect(ssdb.a_multi_zget("test", ["marino", "sumo"])).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
        ]);
      });
    });

    describe("multi_zdel", () => {
      test("multiple keys", async () => {
        await setupTestZset();
        await expect(ssdb.a_multi_zget("test", ["marino", "sumo"])).resolves.toEqual([
          { marino: 1 },
          { sumo: 2 },
        ]);
      });
    });
  });
});
