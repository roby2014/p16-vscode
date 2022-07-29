import {
  workspace as Workspace,
  window,
  ExtensionContext,
  TextDocumentChangeEvent,
} from "vscode";

export function activate(context: ExtensionContext) {
  console.log("haaa");

  Workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
    console.log("onDidChangeTextDocument");
  });
}  
