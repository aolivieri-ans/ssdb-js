const SSDB = require('./SSDB.js')

let host = "127.0.0.1"
let port = "8888"
let ssdb = SSDB.connect({host, port}, (wtf) => wtf);

// Key-value tests
describe("Key-value: set", () => {

  test('set a valid value', async () => {
    const data = await ssdb.a_set("marino", "sumo");
    expect(data).toBe('ok');
  });
  test('set an empty value', async () => {
    const data = await ssdb.a_set("emptyvalue", "");
    expect(data).toBe('ok');
  });
});



beforeEach(async () => {
  await ssdb.a_flushdb();
});

afterAll(() => {
  ssdb.close();
});
  