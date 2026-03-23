import { renderFolderContents } from './filetree.js'
import { initTags } from './tags.js'
import { initEditor, updateEditorVisibility } from './editor.js'
import { initSearch } from './search.js'
import { initShortcuts } from './shortcuts.js'
import { initNavBar } from './navbar.js'

initEditor()
initTags()
initSearch()
initShortcuts()
initNavBar()
updateEditorVisibility()
renderFolderContents()