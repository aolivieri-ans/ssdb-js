const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

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
      expect(ssdb.a_hget("test", "sirvano")).rejects.toEqual("not_found");
    });
    test("missing key of an missing hashmap", async () => {
      expect(ssdb.a_hget("test", "sirvano")).rejects.toEqual("not_found");
    });
  });

  describe("hdel", () => {
    //  TODO
  });

  describe("hincr", () => {
    //  TODO
  });

  describe("hexists", () => {
    //  TODO
  });

  describe("hsize", () => {
    //  TODO
  });

  describe("hlist", () => {
    //  TODO
  });

  describe("hrlist", () => {
    //  TODO
  });

  describe("hkeys", () => {
    //  TODO
  });

  describe("hgetall", () => {
    //  TODO
  });

  describe("hscan", () => {
    //  TODO
  });

  describe("hrscan", () => {
    //  TODO
  });

  describe("hclear", () => {
    //  TODO
  });

  describe("multi_hset", () => {
    //  TODO
  });

  describe("multi_hget", () => {
    //  TODO
  });

  describe("multi_hdel", () => {
    //  TODO
  });
});

beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(async () => {
  await ssdb.a_compact();
  ssdb.close();
});
