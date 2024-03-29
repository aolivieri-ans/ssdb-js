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

const testKey = "test";
const testObj = { marino: "sumo" };

describe("Hashmap", () => {
  describe("hset", () => {
    // Returns 1 if key is a new key in the hashmap and value is set, else returns 0.
    test("new hashmap key, new value", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hget("test", "marino");
      expect(resp).toBe("sumo");
    });
    test("existing key, update value", async () => {
      let resp = await ssdb.a_hset("test", "marino", "firstval");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "marino", "secondval");
      expect(resp).toBe(0);
      resp = await ssdb.a_hget("test", "marino");
      expect(resp).toBe("secondval");
    });
  });

  describe("hget", () => {
    // Return the value to the key, if the key does not exists, return not_found Status Code.
    test("existing key of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hget("test", "marino");
      expect(resp).toBe("sumo");
    });
    test("missing key of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      await expect(ssdb.a_hget("test", "sirvano")).rejects.toEqual("not_found");
    });
    test("missing key of a missing hashmap", async () => {
      await expect(ssdb.a_hget("test", "sirvano")).rejects.toEqual("not_found");
    });
  });

  describe("hdel", () => {
    // If the key exists, return 1, otherwise return 0
    test("existing key of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hdel("test", "marino");
      expect(resp).toBe(1);
      await expect(ssdb.a_hget("test", "marino")).rejects.toEqual("not_found");
    });
    test("non existing key of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hdel("test", "sirvano");
      expect(resp).toBe(0);
    });
    test("non existing hashmap name", async () => {
      resp = await ssdb.a_hdel("nonexistent", "sirvano");
      expect(resp).toBe(0);
    });
  });

  describe("hincr", () => {
    // returns new value. If the old value cannot be converted to an integer, returns error Status Code.
    test("existing name, existing key with numerical value, incr=1", async () => {
      let resp = await ssdb.a_hset("test", "marino", "1");
      expect(resp).toBe(1);
      resp = await ssdb.a_hincr("test", "marino");
      expect(resp).toBe(2);
    });
    test("existing name, existing key with numerical value, incr>1", async () => {
      let resp = await ssdb.a_hset("test", "marino", "1");
      expect(resp).toBe(1);
      resp = await ssdb.a_hincr("test", "marino", 10);
      expect(resp).toBe(11);
      resp = await ssdb.a_hget("test", "marino");
      expect(resp).toBe("11");
    });
    test("existing name, existing key with non-numerical value", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      await expect(ssdb.a_hincr("test", "marino")).rejects.toEqual("error");
    });
    test("existing name, non-existing key", async () => {
      // if the key does not exist it is created
      resp = await ssdb.a_hincr("test", "sirvano", 2);
      expect(resp).toBe(2);
      resp = await ssdb.a_hget("test", "sirvano");
      expect(resp).toBe("2");
    });
  });

  describe("hexists", () => {
    // If the key exists, return 1, otherwise return 0
    test("existing name, existing key", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hexists("test", "marino");
      expect(resp).toBe(1);
    });
    test("existing name, non-existing key", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hexists("test", "sirvano");
      expect(resp).toBe(0);
    });
    test("non-existing name", async () => {
      resp = await ssdb.a_hexists("test", "marino");
      expect(resp).toBe(0);
    });
  });

  describe("hsize", () => {
    // Return the number of key-value pairs in the hashmap.
    test("existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hsize("test");
      expect(resp).toBe(2);
    });

    test("non existing hashmap", async () => {
      // if hashmap doesn't exists returns 0 anyway
      resp = await ssdb.a_hsize("nonexistent");
      expect(resp).toBe(0);
    });
  });

  describe("hlist", () => {
    // List hashmap names in range (name_start, name_end].
    test("with default arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test2", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hlist();
      expect(resp).toEqual(["test", "test2"]);
    });

    test("with range argument", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test2", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hlist("A", "B");
      expect(resp).toEqual([]);
    });

    test("with range and limit argument", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test2", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hlist("", "", 1);
      expect(resp).toEqual(["test"]);
    });
  });

  describe("hrlist", () => {
    // Like hlist, but in reverse order.
    test("with default arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test2", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hrlist();
      expect(resp).toEqual(["test2", "test"]);
    });
  });

  describe("hkeys", () => {
    // List keys of a hashmap in range (key_start, key_end]
    test("with default arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hkeys("test");
      expect(resp).toEqual(["Mozzo", "marino"]);
    });
    test("with range argument", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hkeys("test", "e", "z");
      expect(resp).toEqual(["marino"]);
    });

    test("with range and limit argument", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hkeys("test", "", "", 1);
      expect(resp).toEqual(["Mozzo"]);
    });
  });

  describe("hgetall", () => {
    // Returns the whole hash, as an array of strings indexed by strings.
    test("of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hgetall("test");
      expect(resp).toEqual({ Mozzo: "Zozzo", marino: "sumo" });
    });
    test("of a non existing hashmap", async () => {
      resp = await ssdb.a_hgetall("nope");
      expect(resp).toEqual({});
    });
  });

  describe("hscan", () => {
    // List key-value pairs of a hashmap with keys in range (key_start, key_end].
    test("of an existing hashmap, default arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hscan("test");
      expect(resp).toEqual({ Mozzo: "Zozzo", marino: "sumo" });
    });
    test("of an existing hashmap, with range arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hscan("test", "A", "e");
      expect(resp).toEqual({ Mozzo: "Zozzo" });
    });
    test("of an existing hashmap, with range arguments and limit", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hscan("test", "A", "z", 1);
      expect(resp).toEqual({ Mozzo: "Zozzo" });
    });

    test("of a non existing hashmap", async () => {
      resp = await ssdb.a_hgetall("nope");
      expect(resp).toEqual({});
    });
  });

  describe("hrscan", () => {
    // Like hscan, but in reverse order.
    test("of an existing hashmap, default arguments", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hrscan("test");
      expect(resp).toEqual({ Mozzo: "Zozzo", marino: "sumo" });
    });
  });

  describe("hclear", () => {
    // Returns the number of key deleted in that hashmap.
    test("of an existing hashmap", async () => {
      let resp = await ssdb.a_hset("test", "marino", "sumo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hset("test", "Mozzo", "Zozzo");
      expect(resp).toBe(1);
      resp = await ssdb.a_hclear("test");
      expect(resp).toEqual(2);
    });

    test("of a non existing hashmap", async () => {
      resp = await ssdb.a_hclear("nope");
      expect(resp).toEqual(0);
    });
  });

  describe("multi_hset", () => {
    // returns false on error, other values indicate OK.
    let testObjects = {
      Nonno: "Palmiro",
      Mozzo: "Zozzo",
      Oreste: "Pantegani",
      Cagatone: "Joe",
      Marino: "Sumo",
    };
    test("on a new (non-existing) hashmap, non empty key/value set", async () => {
      let resp = await ssdb.a_multi_hset("test", testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_hgetall("test");
      expect(resp).toEqual(testObjects);
    });
  });

  describe("multi_hget", () => {
    let testObjects = {
      Nonno: "Palmiro",
      Mozzo: "Zozzo",
      Oreste: "Pantegani",
      Cagatone: "Joe",
      Marino: "Sumo",
    };
    test("of an existing hashmap, non-empty key set", async () => {
      let resp = await ssdb.a_multi_hset("test", testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_multi_hget("test", ["Nonno", "Mozzo"]);
      expect(resp).toEqual({
        Nonno: "Palmiro",
        Mozzo: "Zozzo",
      });
    });
    test("of an existing hashmap, empty key set", async () => {
      let resp = await ssdb.a_multi_hset("test", testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_multi_hget("test", []);
      expect(resp).toEqual({});
    });
    test("of a non existing hashmap", async () => {
      resp = await ssdb.a_multi_hget("test", ["marino"]);
      expect(resp).toEqual({});
    });
  });

  describe("multi_hdel", () => {
    let testObjects = {
      Nonno: "Palmiro",
      Mozzo: "Zozzo",
      Oreste: "Pantegani",
      Cagatone: "Joe",
      Marino: "Sumo",
    };
    test("of an existing hashmap, non-empty key set", async () => {
      let resp = await ssdb.a_multi_hset("test", testObjects);
      expect(resp).toEqual("ok");
      resp = await ssdb.a_multi_hdel("test", ["Nonno", "Mozzo"]);
      expect(resp).toBeGreaterThan(0);

      resp = await ssdb.a_hgetall("test");
      expect(resp).toEqual({
        Oreste: "Pantegani",
        Cagatone: "Joe",
        Marino: "Sumo",
      });
    });
  });
});
