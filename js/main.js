import { renderFiletree, renderPinnedFiles } from './filetree.js'
import { initSearch } from './search.js'
import { initShortcuts } from './shortcuts.js'
import { initNavBar } from './navbar.js'
import { createDefaultTab } from './tabs.js'
import { initSettings } from './settings.js'


initSearch()
initShortcuts()
initNavBar()
initSettings()
renderFiletree()
createDefaultTab()
renderPinnedFiles()