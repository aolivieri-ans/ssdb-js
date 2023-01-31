const SSDB = require("../SSDB.js");
const cfg = require("./cfg");

let ssdb = SSDB.connect(cfg, (wtf) => wtf);

// List tests
describe("List", () => {
  describe("qpush_front", () => {
    // Returns the length of the list after the push operation, false on error.
    test("on a new empty list", async () => {
      let resp = await ssdb.a_qpush_front("test", "marino", "sumo");
      expect(resp).toBe(2);
    });
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush_front("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_qpush_front("test", "sumo");
      expect(resp).toBe(2);
    });
  });

  describe("qpush_back (qpush)", () => {
    // Returns the length of the list after the push operation, false on error.
    test("on a new empty list", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo");
      expect(resp).toBe(2);
    });
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_qpush("test", "sumo");
      expect(resp).toBe(2);
    });
  });

  describe("qpop_front", () => {
    test("on an existing list, size=1", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop_front("test");
      expect(resp).toEqual("marino");
    });
    test("on an existing list, size=2", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop_front("test", 2);
      expect(resp).toEqual(["marino", "sumo"]);
    });
    test("on a non existing list", async () => {
      expect(ssdb.a_qpop_front("test")).rejects.toEqual("not_found");
    });
    test("on an empty list", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_qpop_front("test");
      expect(resp).toEqual("marino");
      // differs from doc https://ssdb.io/docs/commands/qpop_front.html
      expect(ssdb.a_qpop_front("test")).rejects.toEqual("not_found");
    });
    test("on an existing list, size > list size", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo");
      expect(resp).toBe(2);
      resp = await ssdb.a_qpop_front("test", 20);
      expect(resp).toEqual(["marino", "sumo"]);
    });
  });

  describe("qpop_back", () => {
    test("on an existing list, size=1", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop_back("test");
      expect(resp).toEqual("sirvano");
    });
    test("on an existing list, size=2", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop_back("test", 2);
      expect(resp).toEqual(["sirvano", "sumo"]);
    });
    test("on a non existing list", async () => {
      expect(ssdb.a_qpop_back("test")).rejects.toEqual("not_found");
    });
    test("on an empty list", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_qpop_back("test");
      expect(resp).toEqual("marino");
      // differs from doc https://ssdb.io/docs/commands/qpop_back.html
      expect(ssdb.a_qpop_front("test")).rejects.toEqual("not_found");
    });
    test("on an existing list, size > list size", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo");
      expect(resp).toBe(2);
      resp = await ssdb.a_qpop_back("test", 20);
      expect(resp).toEqual(["sumo", "marino"]);
    });
  });

  describe("qpush", () => {
    // TODO
  });

  describe("qpop", () => {
    // TODO
  });

  describe("qfront", () => {
    // TODO
  });

  describe("qback", () => {
    // TODO
  });

  describe("qsize", () => {
    // TODO
  });

  describe("qclear", () => {
    // TODO
  });

  describe("qget", () => {
    // TODO
  });

  describe("qset", () => {
    // TODO
  });

  describe("qslice", () => {
    // TODO
  });

  describe("qtrim_front", () => {
    // TODO
  });

  describe("qtrim_back", () => {
    // TODO
  });

  describe("qlist", () => {
    // TODO
  });

  describe("qrlist", () => {
    // TODO
  });
});

beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(async () => {
  await ssdb.a_compact();
  ssdb.close();
});
