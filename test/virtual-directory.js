const path = require("path");
const assert = require("assert");
const fs = require("fs");

const { VirtualDirectory } = require("../dist/virtual-path");

describe("VirtualDirectory", function () {
    let rootDir = new VirtualDirectory(
        path.join(__dirname, "data/dir1"),
        path.join(__dirname, "data/dir2")
    );

    it("childDirectories", function () {
        let childDirs = rootDir.getChildDirectories();

        // console.log(childDirs);
        assert.notEqual(childDirs["child-dir1"], null);
        assert.notEqual(childDirs["child-dir2"], null);
    })

    it("filePhysicalPaths", function () {
        let files = rootDir.getChildFiles();
        let names = Object.getOwnPropertyNames(files);
        // console.log(files);
        assert.equal(names.length, 3);
        assert.equal(names[0], "1.txt");
        assert.equal(files["1.txt"], path.join(__dirname, "data/dir2/1.txt"))
    })

    it("directory", function () {
        let dir1 = rootDir.getDirectory("child-dir1");
        let dir2 = rootDir.getDirectory("child-dir2");

        assert.notEqual(dir1, null);
        assert.notEqual(dir2, null);
    })

    it("filePhysicalPaths child", function () {

        let dir1 = rootDir.getDirectory("child-dir1");
        let dir2 = rootDir.getDirectory("child-dir2");

        let files1 = dir1.getChildFiles();
        let files2 = dir2.getChildFiles();

        let names1 = Object.getOwnPropertyNames(files1);
        let names2 = Object.getOwnPropertyNames(files2);

        assert.equal(names1.length, 1);
        assert.equal(names2.length, 2);
    })

    it("addPhysicalDirectory", function () {

        let childDir1 = Object.assign({}, rootDir.getChildDirectories());
        let names1 = Object.getOwnPropertyNames(childDir1);
        let files1 = rootDir.getChildFiles();
        // console.log(files1);
        rootDir.addPhysicalDirectory(path.join(__dirname, "data/dir3"));

        let childDir2 = Object.assign({}, rootDir.getChildDirectories());
        let names2 = Object.getOwnPropertyNames(childDir2);
        let files2 = rootDir.getChildFiles();
        // console.log(files2);
        // console.log(Object.getOwnPropertyNames(files2).length);
        assert.equal(names2.length, names1.length + 1);
        assert.equal(
            Object.getOwnPropertyNames(files1).length + 1,
            Object.getOwnPropertyNames(files2).length
        );
    })

    it("addVirtualFile", function () {

        let files1 = rootDir.getChildFiles();
        let names1 = Object.getOwnPropertyNames(files1);

        rootDir.addVirtualFile("12.jpg", path.join(__dirname, "aaa.jpg"));

        let files2 = rootDir.getChildFiles();
        let names2 = Object.getOwnPropertyNames(files2);

        assert.equal(names2.length, names1.length + 1);
        assert.ok(names2.indexOf("12.jpg") >= 0);
    })

    it("addPhysicalDirectory", function () {
        let rootDir = new VirtualDirectory(
            path.join(__dirname, "data/dir1"),
            path.join(__dirname, "data/dir2")
        );

        let filesDic = rootDir.getChildFiles();
        let files = Object.getOwnPropertyNames(filesDic).map(n => filesDic[n]);
        console.log(files);
        assert.notEqual(filesDic["1.txt"], null);
        let txt1 = fs.readFileSync(filesDic["1.txt"]).toString();
        assert.equal(txt1, "dir2-1.txt");

        let physicalPaths0 = [...rootDir.getPhysicalPaths()];
        console.log(physicalPaths0);

        rootDir.addPhysicalDirectory(path.join(__dirname, "data/dir3"));
        let physicalPaths1 = [...rootDir.getPhysicalPaths()];
        console.log(physicalPaths1);

        assert.equal(physicalPaths1.length, physicalPaths0.length + 1);

        filesDic = rootDir.getChildFiles();
        files = Object.getOwnPropertyNames(filesDic).map(n => filesDic[n]);

        txt1 = fs.readFileSync(filesDic["1.txt"]).toString();
        assert.equal(txt1, "dir3-1.txt");

    })
})
