const path = require("path");
const { Server, VirtualDirectory, StatusCode } = require("../dist/index");
const assert = require("assert");

// let server = new Server(path.join)

describe("Server", function () {

    it("servePath", async function () {
        let root = new VirtualDirectory(path.join(__dirname, "data/dir1"));
        let server = new Server(root);
        let r = await server.servePath("1.txt");

        assert.notEqual(r.fileStream, null);
        assert.equal(r.statusCode, StatusCode.OK);


        let content = await new Promise((resolve, reject) => {
            let chunks = [];
            r.fileStream.on("data", function (chunk) {
                chunks.push(chunk);
            }).on("end", function () {
                let buffer = Buffer.concat(chunks);
                // console.log(buffer.toString());
                resolve(buffer.toString());
            }).on("error", function (err) {
                reject(err);
            })
        })

        assert.equal(content, "Hello World!");
    })

    describe("servePath", function () {

        //=================================================================
        // 将文件夹 data/dir2 文件夹加入后，data/dir2/1.txt 将会覆盖掉 data/dir1/1.txt
        let root = new VirtualDirectory(path.join(__dirname, "data/dir1"));
        root.addPhysicalPath(path.join(__dirname, "data/dir2"));
        root.addvirtualDirectory("data-dir3", path.join(__dirname, "data/dir3"), "merge");
        //=================================================================

        it("文件路径覆盖", async function () {
            let server = new Server(root);
            let r = await server.servePath("1.txt");
            assert.notEqual(r.fileStream, null);
            assert.equal(r.statusCode, StatusCode.OK);

            let content = await new Promise((resolve, reject) => {
                let chunks = [];
                r.fileStream.on("data", function (chunk) {
                    chunks.push(chunk);
                }).on("end", function () {
                    let buffer = Buffer.concat(chunks);
                    resolve(buffer.toString());
                }).on("error", function (err) {
                    reject(err);
                })
            })

            assert.equal(content, "dir2-1.txt");
        })

        it("新增文件读取", async function () {
            let server = new Server(root);
            let r = await server.servePath("3.txt");

            assert.notEqual(r.fileStream, null);
            assert.equal(r.statusCode, StatusCode.OK);

            let content = await new Promise((resolve, reject) => {
                let chunks = [];
                r.fileStream.on("data", function (chunk) {
                    chunks.push(chunk);
                }).on("end", function () {
                    let buffer = Buffer.concat(chunks);
                    resolve(buffer.toString());
                }).on("error", function (err) {
                    reject(err);
                })
            })

            assert.equal(content, "dir2-3.txt");
        })

        it("虚拟路径文件读取", async function () {
            let server = new Server(root);
            let r = await server.servePath("data-dir3/1.txt");
            assert.notEqual(r.fileStream, null);
            assert.equal(r.statusCode, StatusCode.OK);

            let content = await new Promise((resolve, reject) => {
                let chunks = [];
                r.fileStream.on("data", function (chunk) {
                    chunks.push(chunk);
                }).on("end", function () {
                    let buffer = Buffer.concat(chunks);
                    resolve(buffer.toString());
                }).on("error", function (err) {
                    reject(err);
                })
            })

            assert.equal(content, "dir3-1.txt");
        })

    })




})