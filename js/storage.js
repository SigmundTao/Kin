import { notes, tags } from './state.js'

export function updateNoteData(){
    localStorage.setItem('notes', JSON.stringify(notes))
}

export function updateTagData(){
    localStorage.setItem('tags', JSON.stringify(tags))
}

export function getNoteIndex(id){
    const index = notes.findIndex(i => i.id === id)
    if(index === -1) console.warn('Note not found for id: ', id)
    return index
}