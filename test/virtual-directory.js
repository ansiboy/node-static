const path = require("path");
const assert = require("assert");

const { VirtualDirectory } = require("../dist/virtual-path");

describe("VirtualDirectory", function () {
    let rootDir = new VirtualDirectory(
        path.join(__dirname, "data/dir1"),
        path.join(__dirname, "data/dir2")
    );

    it("childDirectories", function () {
        let childDirs = rootDir.childDirectories;

        // console.log(childDirs);
        assert.notEqual(childDirs["child-dir1"], null);
        assert.notEqual(childDirs["child-dir2"], null);
    })

    it("filePhysicalPaths", function () {
        let files = rootDir.filePhysicalPaths();
        let names = Object.getOwnPropertyNames(files);
        // console.log(files);
        assert.equal(names.length, 3);
        assert.equal(names[0], "1.txt");
        assert.equal(files["1.txt"], path.join(__dirname, "data/dir2/1.txt"))
    })

    it("childDirectory", function () {
        let dir1 = rootDir.childDirectory("child-dir1");
        let dir2 = rootDir.childDirectory("child-dir2");

        assert.notEqual(dir1, null);
        assert.notEqual(dir2, null);
    })

    it("filePhysicalPaths child", function () {

        let dir1 = rootDir.childDirectory("child-dir1");
        let dir2 = rootDir.childDirectory("child-dir2");

        let files1 = dir1.filePhysicalPaths();
        let files2 = dir2.filePhysicalPaths();

        let names1 = Object.getOwnPropertyNames(files1);
        let names2 = Object.getOwnPropertyNames(files2);

        assert.equal(names1.length, 1);
        assert.equal(names2.length, 2);
    })

    it("addPhysicalDirectory", function () {

        let childDir1 = Object.assign({}, rootDir.childDirectories);
        let names1 = Object.getOwnPropertyNames(childDir1);
        let files1 = rootDir.filePhysicalPaths();
        // console.log(files1);
        rootDir.addPhysicalDirectory(path.join(__dirname, "data/dir3"));

        let childDir2 = Object.assign({}, rootDir.childDirectories);
        let names2 = Object.getOwnPropertyNames(childDir2);
        let files2 = rootDir.filePhysicalPaths();
        // console.log(files2);
        // console.log(Object.getOwnPropertyNames(files2).length);
        assert.equal(names2.length, names1.length + 1);
        assert.equal(
            Object.getOwnPropertyNames(files1).length + 1,
            Object.getOwnPropertyNames(files2).length
        );
    })

    it("addvirtualFile", function () {

        let files1 = rootDir.filePhysicalPaths();
        let names1 = Object.getOwnPropertyNames(files1);

        rootDir.addvirtualFile("12.jpg", path.join(__dirname, "aaa.jpg"));

        let files2 = rootDir.filePhysicalPaths();
        let names2 = Object.getOwnPropertyNames(files2);

        assert.equal(names2.length, names1.length + 1);
        assert.ok(names2.indexOf("12.jpg") >= 0);
    })
})
