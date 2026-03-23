import { renderFolderContents } from './filetree.js'
import { initEditor } from './editor.js'
import { initSearch } from './search.js'
import { initShortcuts } from './shortcuts.js'
import { initNavBar } from './navbar.js'

initEditor()
initSearch()
initShortcuts()
initNavBar()
renderFolderContents()