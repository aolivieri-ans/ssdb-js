const { SSDBClient } = require("../index");
const cfg = require("./cfg");

let ssdb = new SSDBClient(cfg.cluster_hosts);

beforeAll(async () => {
  await ssdb.connect();
});

beforeEach(async () => {
  //await ssdb.a_flushdb();
});

afterAll(async () => {
  //await ssdb.a_compact();
  ssdb.close();
});

// CLuster commands tests
describe("Cluster test", () => {
  test("get and set", async () => {
    let testkeys = [];
    ssdb.ssdb_hosts.forEach((e, i) => {
      let base = `key_for_node_${i}`;
      let key = base;
      let suf = 0;
      do {
          key = base + "-" + suf++;
      }while(ssdb.partition4key(key) != i)

      testkeys[i] = key;


    });

    console.log("keys", testkeys);
    
    await expect(ssdb.a_set("marino", "sumo")).resolves.toBe("ok");
    await expect(ssdb.a_set("marino", "sumo")).resolves.toBe("ok");
  });
});
