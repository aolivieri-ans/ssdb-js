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

// Key-value tests
describe("Key-value", () => {
  describe("set", () => {
    // false on error, other values indicate OK.

    test("set a valid value", async () => {
      const resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
    });

    test("set an empty value", async () => {
      const resp = await ssdb.a_set("emptyvalue", "");
      expect(resp).toBe("ok");
    });

    test("rewrite an existing key", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_set("marino", "sumo2");
      expect(resp).toBe("ok");
    });
  });

  describe("setx", () => {
    // false on error, other values indicate OK.

    test("setx with TTL=1", async () => {
      const resp = await ssdb.a_setx("marino", "sumo", 1);
      expect(resp).toBe("ok");
    });

    test("setx with TTL=0", async () => {
      const resp = await ssdb.a_setx("marino", "sumo", 0);
      expect(resp).toBe("ok");
      await new Promise((r) => setTimeout(r, 10)); // sleep 10ms
      await await expect(ssdb.a_get("marino")).rejects.toEqual("not_found");
    });
  });

  describe("setnx", () => {
    // Returns > 1: value is set, 0: key already exists.

    test("setnx when key does not exists", async () => {
      const resp = await ssdb.a_setnx("marino", "sumo");
      expect(resp).toBe(1);
    });

    test("setnx when key does already exists", async () => {
      let resp = await ssdb.a_set("marino", "firstvalue");
      expect(resp).toBe("ok");
      resp = await ssdb.a_get("marino");
      expect(resp).toBe("firstvalue");
      resp = await ssdb.a_setnx("marino", "secondvalue");
      expect(resp).toBe(0);
      resp = await ssdb.a_get("marino");
      expect(resp).toBe("firstvalue");
    });
  });

  describe("expire", () => {
    // If the key exists and ttl is set, return 1, otherwise return 0.

    test("expire when key exists", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_expire("marino", 0);
      expect(resp).toBe(1);
      await new Promise((r) => setTimeout(r, 10)); // sleep 10ms
      await await expect(ssdb.a_get("marino")).rejects.toEqual("not_found");
    });

    test("expire when key does not exists", async () => {
      resp = await ssdb.a_expire("doesnotexists", 0);
      expect(resp).toBe(0);
    });
  });

  describe("ttl", () => {
    // Time to live of the key, in seconds, -1 if there is no associated expire to the key.
    test("ttl of existing key with no TTL set", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_ttl("marino");
      expect(resp).toBe(-1);
    });

    test("ttl of existing key with  TTL set", async () => {
      let resp = await ssdb.a_setx("marino", "sumo", 20);
      expect(resp).toBe("ok");
      resp = await ssdb.a_ttl("marino");
      expect(resp).toBeGreaterThan(0);
    });

    test("ttl of non existing key", async () => {
      resp = await ssdb.a_ttl("notexistent");
      expect(resp).toBe(-1);
    });
  });

  describe("get", () => {
    test("get an existing key", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_get("marino");
      expect(resp).toBe("sumo");
    });

    test("get a non-existing key", async () => {
      await await expect(ssdb.a_get("stocazzo")).rejects.toEqual("not_found");
    });
  });

  describe("getset", () => {
    // If the key already exists, the value related to that key is returned.
    // Otherwise return not_found Status Code. The value is either added or updated.

    test("getset a non existing key", async () => {
      await await expect(ssdb.a_getset("marino", "sumo")).rejects.toEqual(
        "not_found"
      );
    });

    test("getset an existing key", async () => {
      let resp = await ssdb.a_set("marino", "firstvalue");
      expect(resp).toBe("ok");
      resp = await ssdb.a_getset("marino", "secondvalue");
      expect(resp).toBe("firstvalue");
      resp = await ssdb.a_get("marino");
      expect(resp).toBe("secondvalue");
    });
  });

  describe("del", () => {
    // Status reply. You can not determine whether the key exists or not by delete command.
    test("del an existing key", async () => {
      let resp = await ssdb.a_set("marino", "firstvalue");
      expect(resp).toBe("ok");
      resp = await ssdb.a_del("marino");
      expect(resp).toBe("ok");
    });

    test("del a non-existing key", async () => {
      resp = await ssdb.a_del("marino");
      expect(resp).toBe("ok");
    });
  });

  describe("incr", () => {
    // Returns The new value.
    // If the old value cannot be converted to an integer,
    // returns error Status Code.
    test("incr an existing key, with valid int value (default increment)", async () => {
      let resp = await ssdb.a_set("marino", "1");
      expect(resp).toBe("ok");
      resp = await ssdb.a_incr("marino");
      expect(resp).toBe(2);
    });

    test("incr an existing key, with valid int value, specifying increment", async () => {
      let resp = await ssdb.a_set("marino", "1");
      expect(resp).toBe("ok");
      resp = await ssdb.a_incr("marino", 10);
      expect(resp).toBe(11);
    });

    test("incr an existing key, with an invalid non-int value", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      await await expect(ssdb.a_incr("marino", 1)).rejects.toEqual("error");
    });
  });

  describe("exists", () => {
    // If the key exists, return 1, otherwise return 0.
    test("exists of an existing key", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_exists("marino");
      expect(resp).toBe(1);
    });

    test("exists of a non-existing key", async () => {
      resp = await ssdb.a_exists("marino");
      expect(resp).toBe(0);
    });
  });

  describe("getbit", () => {
    // TODO
  });

  describe("setbit", () => {
    // TODO
  });

  describe("bitcount", () => {
    // TODO
  });

  describe("countbit", () => {
    // TODO
  });

  describe("substr", () => {
    // Non-existing key, exceeding offset/length:
    // They all return empty string

    test("substr of an existing key, valid offset, valid length", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_substr("marino", 0, 2);
      expect(resp).toBe("su");
    });

    test("substr of an existing key, valid offset, exceeding length", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_substr("marino", 0, 200);
      expect(resp).toBe("sumo");
    });

    test("substr of an existing key, invalid offset", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_substr("marino", 100, 1);
      expect(resp).toBe("");
    });

    test("substr of a non-existing key", async () => {
      resp = await ssdb.a_substr("marino", 0, 1);
      expect(resp).toBe("");
    });
  });

  describe("strlen", () => {
    // Returns number of bytes of the string, if key not exists, returns 0.
    test("strlen of an existing key", async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe("ok");
      resp = await ssdb.a_strlen("marino", 0, 2);
      expect(resp).toBe(4);
    });

    test("strlen of a non-existing key", async () => {
      resp = await ssdb.a_strlen("marino", 0, 2);
      expect(resp).toBe(0);
    });
  });

  describe("keys", () => {
    async function do_keys_test(
      keys,
      range_start,
      range_end,
      limit,
      expected_out
    ) {
      keys.forEach(async (key) => {
        let resp = await ssdb.a_set(key, "sumo");
        expect(resp).toBe("ok");
      });
      let resp = await ssdb.a_keys(range_start, range_end, limit);
      expect(resp).toEqual(expected_out);
    }

    test("with some keys, valid range, valid limit", async () => {
      await do_keys_test(
        ["marino", "dora", "oreste", "sirvano"],
        "a",
        "z",
        100,
        ["dora", "marino", "oreste", "sirvano"]
      );
    });

    test("with some keys, empty range, valid limit", async () => {
      await do_keys_test(
        ["marino", "dora", "oreste", "sirvano"],
        "z",
        "x",
        100,
        []
      );
    });

    test("with some keys, valid range, limit=0", async () => {
      await do_keys_test(
        ["marino", "dora", "oreste", "sirvano"],
        "a",
        "Z",
        0,
        []
      );
    });

    test("with some keys, valid range, limit=1", async () => {
      await do_keys_test(["marino", "dora", "oreste", "sirvano"], "a", "z", 1, [
        "dora",
      ]);
    });
  });

  describe("rkeys", () => {
    // Like keys, but in reverse order.
    async function do_rkeys_test(
      keys,
      range_start,
      range_end,
      limit,
      expected_out
    ) {
      keys.forEach(async (key) => {
        let resp = await ssdb.a_set(key, "sumo");
        expect(resp).toBe("ok");
      });
      let resp = await ssdb.a_rkeys(range_start, range_end, limit);
      expect(resp).toEqual(expected_out);
    }

    test("with some keys, valid range, valid limit", async () => {
      await do_rkeys_test(
        ["marino", "dora", "oreste", "sirvano"],
        "z",
        "a",
        100,
        ["sirvano", "oreste", "marino", "dora"]
      );
    });
  });

  describe("scan", () => {
    // false on error, otherwise an associative array containing the key-value pairs.
    let testObjects = {
      Mozzo: "Zozzo",
      Cagatone: "Joe",
      Oreste: "Pantegani",
      Zio: "Panello",
      Nonno: "Palmiro",
    };

    test("scan on multiple keys, valid range, limit=100", async () => {
      for (const [key, value] of Object.entries(testObjects)) {
        let resp = await ssdb.a_set(key, value);
        expect(resp).toBe("ok");
      }
      let resp = await ssdb.a_scan("A", "z", 100);
      expect(resp).toEqual(testObjects);
    });

    test("scan on multiple keys, valid range, limit=1", async () => {
      for (const [key, value] of Object.entries(testObjects)) {
        let resp = await ssdb.a_set(key, value);
        expect(resp).toBe("ok");
      }
      let resp = await ssdb.a_scan("A", "z", 1);
      expect(resp).toEqual({ Cagatone: "Joe" });
    });

    test("scan on multiple keys, empty range", async () => {
      for (const [key, value] of Object.entries(testObjects)) {
        let resp = await ssdb.a_set(key, value);
        expect(resp).toBe("ok");
      }
      let resp = await ssdb.a_scan("A", "A");
      expect(resp).toEqual({});
    });
  });

  describe("rscan", () => {
    // Like scan, but in reverse order.
    let testObjects = {
      Mozzo: "Zozzo",
      Cagatone: "Joe",
      Oreste: "Pantegani",
      Zio: "Panello",
      Nonno: "Palmiro",
    };
    test("rscan on multiple keys, valid range, limit=100", async () => {
      for (const [key, value] of Object.entries(testObjects)) {
        let resp = await ssdb.a_set(key, value);
        expect(resp).toBe("ok");
      }
      let resp = await ssdb.a_rscan("z", "A", 100);
      expect(resp).toEqual(testObjects);
    });
  });

  describe("multi_set", () => {
    // returns false on error, other values indicate OK.
    let testObjects = {
      Mozzo: "Zozzo",
      Cagatone: "Joe",
      Oreste: "Pantegani",
      Zio: "Panello",
      Nonno: "Palmiro",
    };
    test("multi_set, non empty key/value set", async () => {
      let resp = await ssdb.a_multi_set(testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_scan("A", "z", 100);
      expect(resp).toEqual(testObjects);
    });
  });

  describe("multi_get", () => {
    let testObjects = {
      Mozzo: "Zozzo",
      Cagatone: "Joe",
      Oreste: "Pantegani",
      Zio: "Panello",
      Nonno: "Palmiro",
    };
    test("multi_get", async () => {
      let resp = await ssdb.a_multi_set(testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_multi_get(["Mozzo", "Cagatone"]);
      expect(resp).toEqual({ Mozzo: "Zozzo", Cagatone: "Joe" });
    });
  });

  describe("multi_del", () => {
    let testObjects = {
      Mozzo: "Zozzo",
      Cagatone: "Joe",
      Oreste: "Pantegani",
      Zio: "Panello",
      Nonno: "Palmiro",
    };
    test("multi_del", async () => {
      let resp = await ssdb.a_multi_set(testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_multi_del(["Mozzo", "Cagatone", "Oreste", "Zio"]);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_scan("", "", 100);
      expect(resp).toEqual({ Nonno: "Palmiro" });
    });
  });
});
