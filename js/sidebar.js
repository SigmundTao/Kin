import { displayingNotes, isFileHolderOpen, toggleFileHolderState } from './state.js'
import { getNoteIndex, updateNoteData, updateTagData } from './storage.js'
import { loadNote } from './editor.js'
import { showBookmarkedNotes } from './bookmarks.js'
import { updateTagSelect } from './tags.js'

export const collapsingFileHolderEl = document.getElementById('sidebar');
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
            <div class="note-card-img"></div>
            <p>${this.note.title}</p>
        `
        card.id = this.note.id;
        card.addEventListener('click', () => loadNote(this.note.id))
        return card
    }
}

/// Opening and closing of file holder element
/// Btn is in permsidebar.js
export function openFileHolder(){
    collapsingFileHolderEl.style.display = 'flex';
}

export function closeFileHolder(){
    collapsingFileHolderEl.style.display = 'none';
}

export function toggleFileHolder(){
    console.log('is this shit working')
    console.log(isFileHolderOpen)
    if(isFileHolderOpen){
        closeFileHolder()
        toggleFileHolderState()
    } else {
        openFileHolder()
        toggleFileHolderState()
    }
}

/// Right click menu (only when user clicks on a file/folder)
function createRightClickMenu(posX, posY){
    const menu = document.createElement('div')
    menu.classList.add('right-click-menu')
    menu.innerHTML = `
        <div class="rc-menu-item">Delete</div>
        <div class="rc-menu-item">Edit</div>
    `
    menu.style.left = posX + 'px'
    menu.style.top = posY + 'px'
    menu.style.position = 'fixed'
    return menu
}

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if(!event.target.classList.contains('note-card')
    && !event.target.parentElement.classList.contains('note-card')) return
    document.querySelector('.right-click-menu')?.remove()
    const xPosition = event.clientX
    const yPosition = event.clientY
    const menu = createRightClickMenu(xPosition, yPosition)
    collapsingFileHolderEl.appendChild(menu)
    menu.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('click', () => menu.remove(), { once:true })
});
