import {
  Project,
  Server,
  AddonAPI,
  CompletionFunctionParams,
  DefinitionFunctionParams,
  ReferenceFunctionParams,
} from "@lifeart/ember-language-server";
import { Connection, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

module.exports = class ElsAddonFileWatcher implements AddonAPI {
  server!: Server;
  project!: Project;
  onInit(server: Server, project: Project) {
    this.server = server;
    this.project = project;

    return () => {
      
    };
  }
};
