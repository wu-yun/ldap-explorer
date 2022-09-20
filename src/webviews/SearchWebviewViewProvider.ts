import { CancellationToken, ExtensionContext, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window } from "vscode";
import { createSearchResultsWebview } from "./createSearchResultsWebview";
import { getWebviewUiToolkitUri } from './utils';

export class SearchWebviewViewProvider implements WebviewViewProvider {

  private extensionContext: ExtensionContext;

  constructor(extensionContext: ExtensionContext) {
    this.extensionContext = extensionContext;
  }

  resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
    const toolkitUri = getWebviewUiToolkitUri(webviewView.webview, this.extensionContext.extensionUri);

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = `<!DOCTYPE html>
			<html lang="en">
				<head>
				<script type="module" src="${toolkitUri}"></script>
				</head>
				<body>
          <section>
            <!-- TODO prepopulate "value" with memento ? Otherwise it gets reset when goes to the background-->
            <vscode-text-field type="text" id="filter" placeholder="e.g. cn=readers">Filter</vscode-text-field><!-- TODO verify the example in the placeholder is a valid LDAP filter -->
          </section>
          <section>
            <!-- when parsing the text area make sure we account for windows-style CRLF -->
            <vscode-text-area id="attributes" placeholder="e.g. member">Attributes</vscode-text-area><!-- TODO explain, one attribute per line -->
          </section>

          <vscode-button onClick="search()">Search</vscode-button>

          <script>
				    const vscode = acquireVsCodeApi();
				    function search() {
					    vscode.postMessage({
						    command: "search",
                filter: document.getElementById("filter").value,
						    attributes: document.getElementById("attributes").value
              });
            }
			    </script>
        </body>
			</html>`;

    // Submit handler when user clicks the "search" button.
    // See https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
        case 'search':
          createSearchResultsWebview(this.extensionContext, message.filter, message.attributes);
          break;
        }
      },
      undefined,
      this.extensionContext.subscriptions
    );

  }

}
