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

  describe("qpop_back (qpop)", () => {
    test("on an existing list, size=1", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop("test");
      expect(resp).toEqual("sirvano");
    });
    test("on an existing list, size=2", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qpop("test", 2);
      expect(resp).toEqual(["sirvano", "sumo"]);
    });
    test("on a non existing list", async () => {
      expect(ssdb.a_qpop("test")).rejects.toEqual("not_found");
    });
    test("on an empty list", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino");
      expect(resp).toBe(1);
      resp = await ssdb.a_qpop("test");
      expect(resp).toEqual("marino");
      // differs from doc https://ssdb.io/docs/commands/qpop_back.html
      expect(ssdb.a_qpop("test")).rejects.toEqual("not_found");
    });
    test("on an existing list, size > list size", async () => {
      let resp = await ssdb.a_qpush_back("test", "marino", "sumo");
      expect(resp).toBe(2);
      resp = await ssdb.a_qpop_back("test", 20);
      expect(resp).toEqual(["sumo", "marino"]);
    });
  });

  describe("qfront", () => {
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qfront("test");
      expect(resp).toEqual("marino");
    });
    test("on a non-existing list", async () => {
      // Differs from https://ssdb.io/docs/commands/qfront.html
      expect(ssdb.a_qpop("test")).rejects.toEqual("not_found");
    });
  });

  describe("qback", () => {
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qback("test");
      expect(resp).toEqual("sirvano");
    });
    test("on a non-existing list", async () => {
      // Differs from https://ssdb.io/docs/commands/qfront.html
      expect(ssdb.a_qback("test")).rejects.toEqual("not_found");
    });
  });

  describe("qsize", () => {
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qsize("test");
      expect(resp).toEqual(3);
    });
    test("on a non-existing list", async () => {
      resp = await ssdb.a_qsize("nope");
      expect(resp).toEqual(0);
    });
  });

  describe("qclear", () => {
    test("on an existing list", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qclear("test");
      expect(resp).toEqual("ok");
    });
    test("on a non-existing list", async () => {
      resp = await ssdb.a_qclear("nope");
      // Differs from doc https://ssdb.io/docs/commands/qclear.html
      expect(resp).toEqual("ok");
    });
  });

  describe("qget", () => {
    test("on an existing list, valid index", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qget("test", 0);
      expect(resp).toEqual("marino");
      resp = await ssdb.a_qget("test", 1);
      expect(resp).toEqual("sumo");
      resp = await ssdb.a_qget("test", 2);
      expect(resp).toEqual("sirvano");
    });
    test("on an existing list, out of range index", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      expect(ssdb.a_qget("test", 3)).rejects.toEqual("not_found");
    });
    test("on a non existing list", async () => {
      expect(ssdb.a_qget("nope", 0)).rejects.toEqual("not_found");
    });
  });

  describe("qset", () => {
    test("on an existing list, valid index", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qset("test", 0, "replaced");
      expect(resp).toEqual("ok");
      resp = await ssdb.a_qget("test", 0);
      expect(resp).toEqual("replaced");
    });
    test("on an existing list, out of range index", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      expect(ssdb.a_qset("test", 10, "replaced")).rejects.toEqual("error");
    });

    test("on a non existing list", async () => {
      expect(ssdb.a_qset("nope", 0, "dora")).rejects.toEqual("error");
    });
  });

  describe("qrange", () => {
    test("on an existing list valid offset/limit", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qrange("test", 0, 2);
      expect(resp).toEqual(["marino", "sumo"]);
      resp = await ssdb.a_qrange("test", 0, 200);
      expect(resp).toEqual(["marino", "sumo", "sirvano"]);
    });
    test("on an existing list, exceeding offset", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qrange("test", 0, 2);
      expect(resp).toEqual(["marino", "sumo"]);
      resp = await ssdb.a_qrange("test", 100, 10);
      expect(resp).toEqual([]);
    });
  });

  describe("qslice", () => {
    test("on an existing list valid start/end", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qslice("test", 0, 1);
      expect(resp).toEqual(["marino", "sumo"]);
    });
    test("on an existing list valid start, exceeding end", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qslice("test", 0, 200);
      // exceeding end is not considered
      expect(resp).toEqual(["marino", "sumo", "sirvano"]);
    });
    test("on an existing list, exceeding start", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qslice("test", 200, 201);
      expect(resp).toEqual([]);
    });
  });

  describe("qtrim_front", () => {
    test("on an existing, size < list.length", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qtrim_front("test", 2);
      expect(resp).toEqual(2);
      resp = await ssdb.a_qrange("test", 0, 100);
      expect(resp).toEqual(["sirvano"]);
    });
    test("on an existing, size > list.length", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qtrim_front("test", 200);
      expect(resp).toEqual(3);
    });
  });

  describe("qtrim_back", () => {
    test("on an existing, size < list.length", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qtrim_back("test", 2);
      expect(resp).toEqual(2);
      resp = await ssdb.a_qrange("test", 0, 100);
      expect(resp).toEqual(["marino"]);
    });
    test("on an existing, size > list.length", async () => {
      let resp = await ssdb.a_qpush("test", "marino", "sumo", "sirvano");
      expect(resp).toBe(3);
      resp = await ssdb.a_qtrim_back("test", 200);
      expect(resp).toEqual(3);
    });
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
