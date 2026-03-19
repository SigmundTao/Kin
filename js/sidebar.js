import { displayingNotes, notes, showingBookmarks, resetDisplayingNotes, getCurrentNoteId, setCurrentNoteID, setDisplayState } from './state.js'
import { getNoteIndex, updateNoteData } from './storage.js'
import { loadNote } from './editor.js'
import { showBookmarkedNotes } from './bookmarks.js'

const displayingNotesContainerEl = document.getElementById('displaying-notes-container')

export function renderSidebarNoteCards(){
    displayingNotesContainerEl.innerHTML = ''
    displayingNotes.forEach(note => {
        const card = new NoteCard(note)
        displayingNotesContainerEl.appendChild(card.element)
    })
}

class NoteCard {
    constructor(note){
        this.note = note
        this.element = this.createElement()
    }

    createElement(){
        const card = document.createElement('div')
        card.classList.add('note-card')
        card.innerHTML = `
            <h4>${this.note.title}</h4>
            <p>${this.note.date}</p>
        `
        card.id = this.note.id;
        card.appendChild(this.createBookmark())
        card.appendChild(this.createDeleteBtn())
        card.addEventListener('click', () => loadNote(this.note.id))
        return card
    }

    createBookmark(){
        const bookmark = document.createElement('div')
        const isBookmarked = this.note.bookmarked ? 'bookmarked' : 'unbookmarked'
        bookmark.classList.add('note-card-bookmark', isBookmarked)
        const note = notes[getNoteIndex(this.note.id)];
        bookmark.addEventListener('click', (e) => {
            e.stopPropagation()
            note.bookmarked = !note.bookmarked
            /// Updates note array data directly
            updateNoteData()
            if(showingBookmarks) showBookmarkedNotes()
            else { renderSidebarNoteCards() }
        })
        return bookmark
    }

    createDeleteBtn(){
        const btn = document.createElement('button')
        btn.classList.add('delete-note-btn')
        btn.textContent = 'x'
        btn.addEventListener('click', (e) => {
            e.stopPropagation()
            notes.splice(getNoteIndex(this.note.id), 1)
            updateNoteData()
            resetDisplayingNotes()
            if(getCurrentNoteId() === this.note.id){
                setCurrentNoteID(null)
                setDisplayState('Idle')
            }
            renderSidebarNoteCards()
        })
        return btn
    }
}