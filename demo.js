var host = "127.0.0.1"
var port = "8888"
var SSDB = require('./SSDB.js');

var listener = function(boh)
{
	console.log("listener > ", boh)
}

var ssdb = SSDB.connect({host, port}, listener);

async function pd_async()
{
	let x = await ssdb.a_get("marino")
	console.log("x >", x)
	try {
		let y = await ssdb.a_get("sumo")
	} catch (error) {
		console.log("get y error >", error)
	}
}


pd_async().then((res) => process.exit(0))

