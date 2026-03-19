import { renderSidebarNoteCards } from './sidebar.js'
import { updateTagSelect, initTags } from './tags.js'
import { initEditor } from './editor.js'
import { initSearch } from './search.js'
import { initShortcuts } from './shortcuts.js'
import { showBookmarkedNotes, showAllNotes } from './bookmarks.js'
import { updateEditorVisibility } from './state.js'

const createNewNoteBtn = document.getElementById('create-new-note-btn')
const bookmarkNavBtn = document.getElementById('bookmark-nav-item')
const displayAllNotesBtn = document.getElementById('all-notes-btn')
const noteTitleEl = document.getElementById('note-title')
const noteBodyEl = document.getElementById('note-body')
const tagInputEl = document.getElementById('tags-input')

import { createBlankNote } from './editor.js'

createNewNoteBtn.addEventListener('click', createBlankNote)
bookmarkNavBtn.addEventListener('click', showBookmarkedNotes)
displayAllNotesBtn.addEventListener('click', showAllNotes)

noteTitleEl.value = ''
noteBodyEl.value = `Press 'alt + n' to create a new note`
tagInputEl.value = ''

initEditor()
updateEditorVisibility()
initTags()
initSearch()
initShortcuts()
renderSidebarNoteCards()
updateTagSelect()