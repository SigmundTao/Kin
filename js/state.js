export const notes = JSON.parse(localStorage.getItem('notes')) || []
export const tags = JSON.parse(localStorage.getItem('tags')) || []
export let displayingNotes = [...notes]
export let currentNoteID = null
export let currentNoteDisplayState = 'Idle'
export let showingBookmarks = false
export let idNum = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1
export const noteDisplayStates = ['Idle', 'Editing', 'Creating']
const idleScreenEl = document.getElementById('idle-screen');

export function setCurrentNoteID(id){ currentNoteID = id }
export function setDisplayState(state){
    if(!noteDisplayStates.includes(state)){
        console.warn('Not a valid state:', state)
        return;
    }
    currentNoteDisplayState = state;
}

export function getCurrentNoteId(){
    return currentNoteID
}
export function setShowingBookmarks(val){ showingBookmarks = val }
export function resetDisplayingNotes(){ displayingNotes = [...notes] }
export function setDisplayingNotes(arr){ displayingNotes = arr }
export function incrementIdNum(){ idNum++ }
export function updateEditorVisibility(){
    if(!currentNoteDisplayState === 'Idle') idleScreenEl.style.display = 'none';
    else { idleScreenEl.style.display = 'flex' }
}