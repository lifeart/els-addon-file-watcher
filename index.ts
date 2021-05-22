import { Project, Server, AddonAPI } from "@lifeart/ember-language-server";
import { FileChangeType } from "vscode-languageserver/node";
import chokidar from "chokidar";
module.exports = class ElsAddonFileWatcher implements AddonAPI {
  server!: Server;
  project!: Project;
  onInit(server: Server, project: Project) {
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
        this.project.trackChange(path, FileChangeType.Created);
      })
      .on("change", (path) => {
        this.project.trackChange(path, FileChangeType.Changed);
      })
      .on("unlink", (path) => {
        this.project.trackChange(path, FileChangeType.Deleted);
      });

    return () => {
      watcher.close();
    };
  }
};
