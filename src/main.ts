import {
  workspace as Workspace,
  ExtensionContext,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  Diagnostic,
  languages,
  window,
} from "vscode";
import { parse_line } from "./parser/parser";
import { print_error } from "./parser/utils";

const p16Diagnostics = languages.createDiagnosticCollection("p16");

/// main()
export function activate(context: ExtensionContext) {
  Workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
    if (e.contentChanges.length === 0) {
      return;
    }

    const activeEditor = window.activeTextEditor;
    const curr_line = activeEditor ? activeEditor.selection.active.line : -1;
    refreshDiagnostics(e.document, curr_line);
  });
}

/// Refresh error diagnostics
async function refreshDiagnostics(document: TextDocument, curr_line: number) {
  p16Diagnostics.delete(document.uri);

  let errorDiagnostics: Diagnostic[] = new Array(0);

  // parse input
  document.getText().split("\n").forEach((element, idx) => {
    const line = element.toLowerCase().trim();
    if (line.length > 0 && line[0] != ';' && idx != curr_line) {
      let [success, err_msg] = parse_line(line, idx + 1);
      if (!success) {
        print_error(err_msg, line, idx);
        // TODO: fix range with the actual column error index...
        const range = new Range(idx, 0, idx, 0);
        const diag = new Diagnostic(range, err_msg);
        errorDiagnostics.push(diag);
      }
    }
  });

  if (errorDiagnostics.length > 0)
    p16Diagnostics.set(document.uri, errorDiagnostics);
}
