const path = require("path");
const { Server, VirtualDirectory } = require("../dist/index");
// let server = new Server(path.join)
debugger
let root = new VirtualDirectory(path.join(__dirname, "data/dir1"));
let server = new Server(root);
// let r = await server.servePath("1.txt");
// console.log(r)