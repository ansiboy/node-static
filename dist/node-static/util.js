"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function mstat(dir, files, callback) {
    (function mstat(files, stats) {
        var file = files.shift();
        if (file) {
            fs.stat(path.join(dir, file), function (e, stat) {
                if (e) {
                    callback(e);
                }
                else {
                    mstat(files, stats.concat([stat]));
                }
            });
        }
        else {
            callback(null, {
                size: stats.reduce(function (total, stat) {
                    return total + stat.size;
                }, 0),
                mtime: stats.reduce(function (latest, stat) {
                    return latest > stat.mtime ? latest : stat.mtime;
                }, 0),
                ino: stats.reduce(function (total, stat) {
                    return total + stat.ino;
                }, 0)
            });
        }
    })(files.slice(0), []);
}
exports.mstat = mstat;
;
//# sourceMappingURL=util.js.map