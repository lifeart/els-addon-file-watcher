"use strict";
var _node = require("vscode-languageserver/node");
var _chokidar = _interopRequireDefault(require("chokidar"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
module.exports = class ElsAddonFileWatcher {
    onInit(server, project) {
        this.server = server;
        this.project = project;
        if (server.flags.hasExternalFileWatcher === true) {
            server.connection.console.warn('Skipping [els-addon-file-watcher] initialization because external file watcher already enabled in Ember Language Server');
            return;
        }
        server.flags.hasExternalFileWatcher = true;
        return this.initChokidar();
    }
    initChokidar() {
        const syncExtensions = [
            "js",
            "ts",
            "hbs",
            "less",
            "scss",
            "css"
        ];
        const globs = this.project.roots.reduce((acc, root)=>{
            if (root.includes("node_modules")) {
                return acc;
            }
            return [
                ...acc,
                ...syncExtensions.map((ext)=>`${root}/**/*.${ext}`
                )
            ];
        }, []);
        const watcher = _chokidar.default.watch(globs, {
            ignored: /(^|[\/\\])\..|node_modules|tmp|dist|vendor/,
            persistent: true
        });
        watcher.on("add", (path)=>{
            this.project.trackChange(path, _node.FileChangeType.Created);
        }).on("change", (path)=>{
            this.project.trackChange(path, _node.FileChangeType.Changed);
        }).on("unlink", (path)=>{
            this.project.trackChange(path, _node.FileChangeType.Deleted);
        });
        return ()=>{
            watcher.close();
        };
    }
};

