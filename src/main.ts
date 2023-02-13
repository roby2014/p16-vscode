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
  Hover,
  Position,
  CancellationToken,
  OutputChannel,
  DiagnosticSeverity,
  MarkdownString
} from "vscode";
import { platform } from 'os';
import { exec } from 'child_process';
import fs = require('fs');

import { p16InstructionsDoc } from "./p16InstructionsDoc";
import { p16RegistersDoc } from "./p16RegistersDoc";
import { isP16Section, p16SectionsDoc } from "./p16SectionsDoc"
import { parseErrorOutput } from "./parser";
import { isP16File } from "./utils";

/// create p16 diagnostics (for error/warning/hints)
const p16Diagnostics = languages.createDiagnosticCollection("p16");

/// formats markdown string documentation for instruction hover
function formatInstrMdHover(instructionDoc: string, registersDoc: string[]) {
  const registerDocumentation = registersDoc.map((it) => `### ${it}`).join("\n");
  const [instr, info, affectedFlags] = instructionDoc.split("\n");
  return `## ${instr} \n ### \`${info}\` \n ### ${affectedFlags} \n ${registerDocumentation}`
}

/// register hover provider (for showing instruction documentation)
languages.registerHoverProvider('p16', {
  provideHover(document: TextDocument, position: Position, token: CancellationToken) {
    const rendered = new Array<MarkdownString>();
    const range = document.getWordRangeAtPosition(position);
    const instr = document.getText(range);
    
    // is section
    if (isP16Section(instr)) {
      const sectionRange = new Range(range.start.line, range.start.character - 1, range.end.line, range.end.character);
      const section = document.getText(sectionRange);
      if (p16SectionsDoc[section]) {
        const [usage, info] = p16SectionsDoc[section].split("\n")
        rendered.push(new MarkdownString(`### ${usage} \n ${info}`));
        return new Hover(rendered);
      }
    }

    // is instruction
    if (p16InstructionsDoc[instr]) {
      const hoverStr = formatInstrMdHover(p16InstructionsDoc[instr], p16RegistersDoc[instr])
      rendered.push(new MarkdownString(hoverStr));
      return new Hover(rendered);
    }
  }
});

/// main()
export function activate(context: ExtensionContext) {

  // register compile command
  const compileP16 = commands.registerCommand("p16-vscode.compileP16", () => {
    const document = window.activeTextEditor.document;

    // dont compile if not a .s/.S P16 file
    const file_path = document.uri.fsPath;
    if (!isP16File(file_path)) {
      return;
    }

    // call compiler and terminal window showing output
    let output: OutputChannel;
    if (!output) {
      output = window.createOutputChannel("P16 Compiler");
    }

    output.clear();
    output.show();

    // check if the last line is a blank line (required for P16 compilation)
    const lastLine = document.lineAt(document.lineCount - 1).text;
    if (lastLine.trim() !== '') {
      window.showErrorMessage("The file should end with a blank line for proper P16 compilation.");
      output.appendLine("The file should end with a blank line for proper P16 compilation.");
      return;
    }

    // execute command
    const executable = platform() === 'win32' ? "pas.exe" : "pas";
    const command = `${executable} "${file_path}"`;
    output.appendLine(`${command}\n`);

    exec(command, (error, stdout, stderr) => {
      output.append(stdout.toString().trim());
      if (error) {
        output.append(stderr.toString().trim());
        window.showErrorMessage("Compilation error! Check output window for more information.");
        if (stderr.indexOf("command not found") != -1) {
          output.append("\nMake sure to add P16 assembler executable folder to your $PATH.");
        }
      } else {
        output.append("Code compiled successfully!");
      }
    });
  });
  context.subscriptions.push(compileP16);

  // when file changes, parse code and check for errors
  Workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
    if (!isP16File(e.document.uri.fsPath)) {
      return;
    }

    refreshDiagnostics(e.document);
  });
}

/// refresh error diagnostics
function refreshDiagnostics(document: TextDocument) {
  p16Diagnostics.delete(document.uri);
  let errorDiagnostics: Diagnostic[] = [];

  // check if the last line is a blank line (required for P16 compilation)
  const lastLine = document.lineAt(document.lineCount - 1).text;
  if (lastLine.trim() !== '') {
    const range = new Range(document.lineCount - 1, 0, document.lineCount - 1, lastLine.length);
    const diag = new Diagnostic(range, "The file should end with a blank line for proper P16 compilation.", DiagnosticSeverity.Error);
    errorDiagnostics.push(diag);
    p16Diagnostics.set(document.uri, errorDiagnostics);
    return;
  }

  // compile the code and parse the error output
  const executable = platform() === 'win32' ? "pas.exe" : "pas";
  const command = `${executable} "${document.uri.fsPath}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      const result = parseErrorOutput(`${stderr}`);
      console.log(stderr);
      console.log(result);
      result.forEach((it) => {
        // TODO: fix range depending on ^ error tracker
        //const range = new Range(it.line, it.column+1, it.line, it.columnEnd+1);
        let sev = it.isError ? DiagnosticSeverity.Error : null
        sev = it.isWarning ? DiagnosticSeverity.Warning : sev
        const range = new Range(it.line, it.column, it.line, it.columnEnd);
        const diag = new Diagnostic(range, it.message, sev);
        errorDiagnostics.push(diag);
        p16Diagnostics.set(document.uri, errorDiagnostics);
      });
    }
  });
}
