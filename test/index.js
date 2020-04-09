const path = require("path");
const { Server, VirtualDirectory } = require("../dist/index");

// let root = new VirtualDirectory(path.join(__dirname, "data/dir1"));
// let server = new Server(root);
// (async function () {
//     let r = await server.servePath("1.txt");
//     let content = await new Promise((resolve, reject) => {
//         let chunks = [];
//         r.fileStream.on("data", function (chunk) {
//             chunks.push(chunk);
//         }).on("end", function () {
//             let buffer = Buffer.concat(chunks);
//             resolve(buffer.toString());
//         }).on("error", function (err) {
//             reject(err);
//         })
//     })
// })();