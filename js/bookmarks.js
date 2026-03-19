import { notes, setShowingBookmarks, setDisplayingNotes, resetDisplayingNotes } from './state.js'
import { renderSidebarNoteCards } from './sidebar.js'

export function showBookmarkedNotes(){
    setShowingBookmarks(true)
    setDisplayingNotes(notes.filter(note => note.bookmarked))
    renderSidebarNoteCards()
}

export function showAllNotes(){
    resetDisplayingNotes()
    setShowingBookmarks(false)
    renderSidebarNoteCards()
}