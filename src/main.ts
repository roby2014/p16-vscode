import {
  workspace as Workspace,
  ExtensionContext,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  Diagnostic,
  languages,
  commands,
  window,
  OutputChannel
} from "vscode";
import { extname } from "path";
import { parse_line } from "./parser/parser";
import { is_label, print_error } from "./parser/utils";
import { isP16File, isSectionOrOther } from "./utils";

const p16Diagnostics = languages.createDiagnosticCollection("p16");

/// main()
export function activate(context: ExtensionContext) {

  // TODO: built in compiler button on top right side
  // register compile command
  const compileP16 = commands.registerCommand("p16-vscode.compileP16", () => {
    // dont compile if not a .s file
    const file_path = window.activeTextEditor.document.uri.fsPath;
    if (extname(file_path).toLowerCase() !== ".s") {
      return;
    }

    // call compiler and terminal window showing output
    let output: OutputChannel;
    if (!output) {
      output = window.createOutputChannel("P16 Compiler");
    }

    output.clear();
    output.show();

    const command = `pas.exe ${file_path}`;
    output.appendLine(`${command}\n`);

    const cp = require('child_process');
    cp.exec(command, (err, stdout, stderr) => {
      output.append(stdout.toString().trim());
      if (err) {
        output.append(stderr.toString().trim());
        window.showErrorMessage(stderr);
      } else {
        output.append("Code compiled successfully!");
      }
    });

  });
  context.subscriptions.push(compileP16);

  // when file changes, parse code and check for errors
  Workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
    if (!isP16File(e.document.uri.fsPath) || e.contentChanges.length === 0) {
      return;
    }
    const activeEditor = window.activeTextEditor;
    const curr_line = activeEditor ? activeEditor.selection.active.line : -1;
    refreshDiagnostics(e.document, curr_line);
  });
}

/// refresh error diagnostics
function refreshDiagnostics(document: TextDocument, curr_line: number) {
  p16Diagnostics.delete(document.uri);

  let errorDiagnostics: Diagnostic[] = [];

  // parse input
  document.getText().split("\n").forEach((element, idx) => {

    // check if its a section, constant, symbol name, etc...
    // if not, then we can try to parse the instruction
    if (!isSectionOrOther(element) && !is_label(element.trimEnd())) {
      // parse instruction with operands
      const line = element.toLowerCase().trim();
      if (line.length && line[0] != ';' && idx != curr_line) {
        let [success, err_msg] = parse_line(line, idx + 1);
        if (!success) {
          print_error(err_msg, line, idx);
          const range = new Range(idx, 0, idx, 0); // TODO: fix range with the actual column error index...
          const diag = new Diagnostic(range, err_msg);
          errorDiagnostics.push(diag);
        }
      }
    }

  });

  if (errorDiagnostics.length)
    p16Diagnostics.set(document.uri, errorDiagnostics);
}
