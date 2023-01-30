const SSDB = require('../SSDB.js')

let host = "127.0.0.1"
let port = "8888"
let ssdb = SSDB.connect({host, port}, (wtf) => wtf);

// Key-value tests
describe("Key-value", () => {

  describe("set", () => {

    test('set a valid value', async () => {
      const resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe('ok');
    });
    test('set an empty value', async () => {
      const resp = await ssdb.a_set("emptyvalue", "");
      expect(resp).toBe('ok');
    });
  
    test('rewrite an existing key', async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe('ok');
      resp = await ssdb.a_set("marino", "sumo2");
      expect(resp).toBe('ok');
    });
  
  });

  describe("setx", () => {

    test('setx a valid value', async () => {
      const resp = await ssdb.a_setx("marino", "sumo", 1);
      expect(resp).toBe('ok');
    });
    
    test('setx a valid value, 0 ttl', async () => {
      const resp = await ssdb.a_setx("marino", "sumo", 0);
      expect(resp).toBe('ok');
      await new Promise(r => setTimeout(r, 10)); // sleep 10ms
      await expect(ssdb.a_get("marino"))
            .rejects
            .toEqual('not_found');

    });

  });

  describe("setnx", () => {

    // Returns > 1: value is set, 0: key already exists.

    test('setnx when key does not exists', async () => {
      const resp = await ssdb.a_setnx("marino", "sumo");
      expect(resp).toBe(1);
    });

    test('setnx when key does already exists', async () => {
     
      let resp = await ssdb.a_set("marino", "firstvalue");
      expect(resp).toBe('ok');
      resp = await ssdb.a_get("marino");
      expect(resp).toBe('firstvalue');
      resp = await ssdb.a_setnx("marino", "secondvalue");
      expect(resp).toBe(0);
      resp = await ssdb.a_get("marino");
      expect(resp).toBe('firstvalue');
    });

  });

  describe("expire", () => {

    // If the key exists and ttl is set, return 1, otherwise return 0.

    test('expire when key exists', async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe('ok');
      resp = await ssdb.a_expire("marino", 0);
      expect(resp).toBe(1);
      await new Promise(r => setTimeout(r, 10)); // sleep 10ms
      await expect(ssdb.a_get("marino"))
      .rejects
      .toEqual('not_found');
    });

    test('expire when key does not exists', async () => {
      resp = await ssdb.a_expire("doesnotexists", 0);
      expect(resp).toBe(0);
    });


  });

  describe("ttl", () => {
    // Time to live of the key, in seconds, -1 if there is no associated expire to the key.
    test('ttl of existing key with no TTL set', async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe('ok');
      resp = await ssdb.a_ttl("marino");
      expect(resp).toBe(-1);
    });

    test('ttl of existing key with  TTL set', async () => {
      let resp = await ssdb.a_setx("marino", "sumo", 20);
      expect(resp).toBe('ok');
      resp = await ssdb.a_ttl("marino");
      expect(resp).toBeGreaterThan(0)
    });

    test('ttl of non existing key', async () => {
      resp = await ssdb.a_ttl("notexistent");
      expect(resp).toBe(-1);
    });


  });

  describe("get", () => {

    test('get an existing key', async () => {
      let resp = await ssdb.a_set("marino", "sumo");
      expect(resp).toBe('ok');
      resp = await ssdb.a_get("marino");
      expect(resp).toBe('sumo');
    });

    test('get a non-existing key', async () => {
      await expect(ssdb.a_get("stocazzo"))
            .rejects
            .toEqual('not_found');
    });

  });

  describe("getset", () => {
    // TODO
  });

  describe("del", () => {
    // TODO
  });

  describe("incr", () => {
    // TODO
  });

  describe("exists", () => {
    // TODO
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
    // TODO
  });

  describe("strlen", () => {
    // TODO
  });

  describe("keys", () => {
    // TODO
  });

  describe("rkeys", () => {
    // TODO
  });

  describe("scan", () => {
    // TODO
  });

  describe("rscan", () => {
    // TODO
  });

  describe("multi_set", () => {
    // TODO
  });

  describe("multi_get", () => {
    // TODO
  });

  describe("multi_del", () => {
    // TODO
  });


});




beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(() => {
  ssdb.close();
});
  