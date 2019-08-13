const {src, dest, parallel, series, watch, task: gTask} = require('gulp');
const ts = require('gulp-typescript');
const source = require("vinyl-source-stream");
const browserify = require('browserify');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

const browser = "browser";
const recorder = "recorder";
const chrome = "chrome";
const common = "common";
const node = "node";

const config = {
    ts: {
        sourceDistDirectories: {
            "markdown": common,
            "record-window": browser,
            "recorder": recorder,
            "tests": node,
            "types": common,
            "chrome": chrome,
            "chrome-header": common
        },
        srcDir: "./ts",
        dstDir: "./dist/js",
    },
};

function task(name, fn) {
    if (typeof name === 'function') {
        fn = name;
        name = fn.displayName || fn.name;
    }

    if (!fn) {
        return gTask(name);
    }

    let invoked = false;

    Object.defineProperty(fn, "name", { value: name + "Main"});

    let dones = [];

    const doneCaller = (done) => {
        for (let done1 of dones) {
            process.nextTick(done1);
        }
        dones = void 0;
        done();
    };

    Object.defineProperty(doneCaller, "name", { value: name + "DoneCaller"});

    const once = (done) => {
        if (invoked) {
            if (dones) dones.push(done);
            else done();
        } else {
            invoked = true;
            return series(fn, doneCaller)(done);
        }
    };

    return gTask(name, once)
}


/**
 *
 * @param kind {string}
 */
const compileTs = kind => {
    const funName = kind.charAt(0).toUpperCase() + kind.substr(1);
    const kindDirs = tsKindDirs(kind);
    return Object.defineProperty(function () {
            return src(`${config.ts.srcDir}/${kindDirs}/**/*.{ts,tsx}`)
                .pipe(sourcemaps.init())
                .pipe(ts({
                    "jsx": "react",
                    noImplicitAny: true,
                    sourceMap: true,
                    target: 'ES2017',
                    module: "commonjs",
                }))
                .pipe(sourcemaps.write())
                .pipe(dest(`${config.ts.dstDir}`));
        }
        , "name", {value: `compile${funName}Ts`});
};

/**
 *
 * @param useKinds {string}
 * @return {string}
 */
const tsKindDirs = (...useKinds) => {
    const dirs = [];
    for (let [name, kind] of Object.entries(config.ts.sourceDistDirectories)) {
        if (useKinds.indexOf(kind) !== -1)
            dirs.push(name)
    }
    return `{${dirs.join(",")},-------do-not-use--------}`
};

task(common, parallel(
    function moveResources() {
        return src(`resources/**/*`)
            .pipe(dest(`dist/resources/`));
    },
    compileTs(common)));

task(browser, series(
    parallel(
        common,
        compileTs(browser)
    ),
    function doBrowserify() {
        return browserify({
            entries: `${config.ts.dstDir}/record-window/main.js`,
            debug: true,
        })
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(dest(`dist/${browser}`));
    }
));

task(recorder, series(
    parallel(
        common,
        compileTs(recorder)
    ),
    function doRecorderBrowserify() {
        return browserify({
            entries: `${config.ts.dstDir}/recorder/main.js`,
            debug: true,
        })
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(dest(`dist/${recorder}`));
    }
));

task(node, series(
    parallel(
        common,
        compileTs(node)
    ),
    function moveCommonJs() {
        return src(`${config.ts.dstDir}/${tsKindDirs(node, common)}/**/*.js`)
            .pipe(dest(`dist/${node}/`));
    }
));

task("test", series(
    parallel(
        node
    ),
    function runTests() {
        return src(`dist/${node}/tests/**/*.js`)
            .pipe(mocha())
            .pipe(istanbul.writeReports())
            .pipe(istanbul.enforceThresholds({thresholds: {global: 90}}));
    }
));

task(chrome, series(
    parallel(
        common,
        compileTs(chrome)
    ),
    parallel(
        function doChromeContentScriptBrowserify() {
            return browserify({
                entries: `${config.ts.dstDir}/chrome/content_script.js`,
                debug: true,
            })
                .bundle()
                .pipe(source("content_script.js"))
                .pipe(dest(`dist/${chrome}`));
        },
        function doChromeBackgroundScriptBrowserify() {
            return browserify({
                entries: `${config.ts.dstDir}/chrome/background.js`,
                debug: true,
            })
                .bundle()
                .pipe(source("background.js"))
                .pipe(dest(`dist/${chrome}`));
        },
        function doChromeWebScriptBrowserify() {
            return browserify({
                entries: `${config.ts.dstDir}/chrome/web_script.js`,
                debug: true,
            })
                .bundle()
                .pipe(source("web_script.js"))
                .pipe(dest(`dist/${chrome}`));
        },
        function copyChromeContents() {
            return src([`${config.ts.srcDir}/${tsKindDirs(chrome)}/**/*`, `!${config.ts.srcDir}/${tsKindDirs(chrome)}/**/*.ts`],
                { base: `${config.ts.srcDir}/${tsKindDirs(chrome)}` })
                .pipe(dest(`dist/${chrome}/`));
        },
    )
));

task("build",
    series(
        parallel(
            browser,
            recorder,
            common,
            node,
            chrome
        ),

        "test"
    ));
