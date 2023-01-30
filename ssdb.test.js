const SSDB = require('./SSDB.js')

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
      // TODO
  });

  describe("setnx", () => {
    // TODO
  });

  describe("expire", () => {
    // TODO
  });

  describe("ttl", () => {
    // TODO
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
  