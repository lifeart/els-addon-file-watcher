import { Project, Server, AddonAPI } from "@lifeart/ember-language-server";
import { FileChangeType } from "vscode-languageserver/node";
import { URI } from "vscode-uri";

import chokidar from "chokidar";
module.exports = class ElsAddonFileWatcher implements AddonAPI {
  server!: Server;
  project!: Project;
  onInit(server: Server, project: Project) {
    this.server = server;
    this.project = project;

    return this.initChokidar();
  }
  initChokidar() {
    const syncExtensions = ["js", "ts", "hbs", "less", "scss", "css"];

    const globs = this.project.roots.reduce((acc, root) => {
      if (root.includes("node_modules")) {
        return acc;
      }
      return [...acc, ...syncExtensions.map((ext) => `${root}/**/*.${ext}`)];
    }, []);
    const watcher = chokidar.watch(globs, {
      ignored: /(^|[\/\\])\..|node_modules|tmp|dist|vendor/, // ignore dotfiles
      persistent: true,
    });

    watcher
      .on("add", (path) => {
        this.project.trackChange(URI.file(path), FileChangeType.Created);
      })
      .on("change", (path) => {
        this.project.trackChange(URI.file(path), FileChangeType.Changed);
      })
      .on("unlink", (path) => {
        this.project.trackChange(URI.file(path), FileChangeType.Deleted);
      });

    return () => {
      watcher.close();
    };
  }
};
