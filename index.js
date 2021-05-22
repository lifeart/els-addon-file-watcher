"use strict";
var _node = require("vscode-languageserver/node");
var _vscodeUri = require("vscode-uri");
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
            this.project.trackChange(_vscodeUri.URI.file(path), _node.FileChangeType.Created);
        }).on("change", (path)=>{
            this.project.trackChange(_vscodeUri.URI.file(path), _node.FileChangeType.Changed);
        }).on("unlink", (path)=>{
            this.project.trackChange(_vscodeUri.URI.file(path), _node.FileChangeType.Deleted);
        });
        return ()=>{
            watcher.close();
        };
    }
};

