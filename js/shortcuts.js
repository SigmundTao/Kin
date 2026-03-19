import { currentNoteID, currentNoteDisplayState, notes } from './state.js'
import { getNoteIndex } from './storage.js'
import { saveNote, saveNoteChanges, createBlankNote, loadNote } from './editor.js'
import { openSearchMenu } from './search.js'

export function initShortcuts(){
    window.addEventListener('keydown', handleKeydown)
}

function handleKeydown(e){
    if(e.altKey && e.key === 's'){
        e.preventDefault()
        if(currentNoteDisplayState === 'Creating') saveNote()
        else if(currentNoteDisplayState === 'Editing') saveNoteChanges()

    } else if(e.altKey && e.key === 'n'){
        e.preventDefault()
        createBlankNote()

    } else if(e.altKey && e.key === 'ArrowDown'){
        if(currentNoteID === 0){
            loadNote(notes[0].id)
        } else {
            const nextIndex = getNoteIndex(currentNoteID) + 1
            if(nextIndex > notes.length - 1) return
            loadNote(notes[nextIndex].id)
        }

    } else if(e.altKey && e.key === 'ArrowUp'){
        if(currentNoteID === 0){
            loadNote(notes[notes.length - 1].id)
        } else {
            const prevIndex = getNoteIndex(currentNoteID) - 1
            if(prevIndex < 0) return
            loadNote(notes[prevIndex].id)
        }

    } else if(e.altKey && e.key === 'd'){
        e.preventDefault()
        openSearchMenu()
    }
}