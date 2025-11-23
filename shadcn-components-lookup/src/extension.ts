// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import components from "./components.json";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "shadcn-components-lookup.open",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const items: vscode.QuickPickItem[] = components.map(
        (c: { name: string; slug: string }) => ({
          label: c.name,
          detail: `npx shadcn@latest add ${c.slug}`,
        })
      );

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Search shadcn/ui components...",
        matchOnDetail: true,
      });

      if (!selected) {
        return;
      }

      const component:
        | {
            name: string;
            slug: string;
          }
        | undefined = components.find(
        (c: { name: string; slug: string }) => c.name === selected.label
      );

      if (!component) {
        return;
      }

      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
        "shadcnPreview",
        `Shadcn: ${component.name}`,
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      const installCommand: string = `npx shadcn@latest add ${component.slug}`;

      panel.webview.html = getWebviewContent(
        component.name,
        component.slug,
        installCommand
      );

      panel.webview.onDidReceiveMessage((message) => {
        if (message.command === "copy") {
          vscode.env.clipboard.writeText(installCommand);
          vscode.window.showInformationMessage(`Copied: ${installCommand}`);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(name: string, slug: string, command: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shadcn: ${name}</title>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
    iframe { width:100%; height:calc(100vh - 100px); border:none; border-radius:8px; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .copy-btn { background:#10b981; color:white; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600; }
    .copy-btn:hover { background:#059669; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <button class="copy-btn" onclick="copy()">Copy Install Command</button>
  </div>
  <iframe src="https://ui.shadcn.com/docs/components/${slug}"></iframe>
  <script>
    const vscode = acquireVsCodeApi();
    function copy() {
      vscode.postMessage({ command: 'copy' });
    }
  </script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
