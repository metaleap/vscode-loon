import * as vsc from 'vscode'

import * as lsp from './lsp'
import * as tree_multi from './tree_multi'


export let loonPath = process.env["LOON_PATH"] ?? "/home/_/c/at"
let regDisp: (...items: { dispose(): any }[]) => number


export function activate(ctx: vsc.ExtensionContext) {
	if (!loonPath.endsWith("/"))
		loonPath += "/"

	regDisp = ctx.subscriptions.push.bind(ctx.subscriptions)

	lsp.init(ctx)
	if (lsp.client) {
		regDisp(
			// with vsc's LSP-clienting lib, *folder* renames and deletes dont trigger `workspace/didChangeWatchedFiles`
			// notifications even on successfully capability-registered `**/*` watch pattern, so poke it manually......
			vsc.workspace.onDidRenameFiles(lsp.maybeSendFsRefreshPoke),
			vsc.workspace.onDidDeleteFiles(lsp.maybeSendFsRefreshPoke),
		)

		regDisp(...tree_multi.init(ctx))
	}
}


export function deactivate() {
	if (lsp.client)
		return lsp.client.stop()
	return (void 0)
}
