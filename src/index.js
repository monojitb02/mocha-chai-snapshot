const fs = require('fs');
const path = require('path');

const fileCache = {};
const readSnap = (file, name) => {
    if (fileCache[file] === undefined) {
        fileCache[file] = fs.existsSync(file) ? require(file) : false;
    }
    if (!fileCache[file] || !(name in fileCache[file])) {
        throw `Snapshot does not exists`;
    }
    return fileCache[file][name];
}
const writeSnap = (file, name, data) => {
    let snap;
    if (!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    const snapShotCountsBefore = fileCache[file] ? Object.keys(fileCache[file]).length : 0;

    if (snapShotCountsBefore === 0) {
        fileCache[file] = { [name]: data };
    } else {
        fileCache[file][name] = data;
    }
    const snapShotCountsAfter = Object.keys(fileCache[file]).length;
    if (snapShotCountsBefore === 0 || snapShotCountsBefore !== snapShotCountsAfter) {
        snap = `exports[\`${name}\`] = ${JSON.stringify(data, null, "  ")};\n`
        fs.appendFileSync(file, snap, {
            encoding: "utf8",
        });
        return true;
    }
    snap = '';
    for (let snapshot in fileCache[file]) {
        snap = `${snap}exports[\`${snapshot}\`] = ${JSON.stringify(fileCache[file][snapshot], null, "  ")};\n`
    };
    fs.writeFileSync(file, snap, {
        encoding: "utf8",
    });
    return true;
}

module.exports = function (chai, utils) {
    utils.addProperty(chai.Assertion.prototype, 'isForced', function () {
        utils.flag(this, 'updateSnapshot', true);
    });

    utils.addMethod(chai.Assertion.prototype, "matchSnapshot", function (passedContext) {
        const actual = utils.flag(this, 'object');
        const isForced = process.env.CHAI_SNAPSHOT_UPDATE || utils.flag(this, 'updateSnapshot');
        const context = passedContext.test ? passedContext.test : passedContext
        const dir = path.dirname(context.file);
        const filename = path.basename(context.file);
        const snapshotFile = path.join(dir, "__snapshots__", filename + ".snap.js");

        const prepareTitle = (chain) => {
            if (chain.parent && chain.parent.file && path.basename(chain.parent.file) === filename) {
                return `${prepareTitle(chain.parent)} : ${chain.title}`;
            }
            return chain.title;
        };

        if (!context.matchSequence) {
            context.matchSequence = 1;
        }

        const name = `${prepareTitle(context)} ${context.matchSequence++}`;
        let expected
        try {
            expected = readSnap(snapshotFile, name);
        } catch (e) {
            if (!isForced) {
                throw e
            }
        }
        if(isForced){
            writeSnap(snapshotFile, name, actual);
            expected = actual;
        }
        
        if (actual !== null && typeof actual === "object") {
            chai.assert.deepEqual(actual, expected);
        } else {
            chai.assert.equal(actual, expected);
        }
    });
};