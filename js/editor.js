import { files, getFileIndex, idNum, currentFolderId, incrementIdNum, setSelectedFileId, setAppState } from "./state.js"
import { getFormattedDate, updateFileData } from "./storage.js"
import { createTab } from "./tabs.js"
import { renderFolderContents } from "./filetree.js"

const createNoteBtn = document.getElementById('create-note-btn')
createNoteBtn.addEventListener('click', createNewNote)

export function highlightSelectedFile(id){
    document.querySelectorAll('.file-card').forEach(card => card.classList.remove('selected-file'))
    const selectedCard = document.getElementById(id)
    if(selectedCard) selectedCard.classList.add('selected-file')
}

function getTitleInput(){
    return document.querySelector('note-title')
}

function getBodyInput(){
    return document.querySelector('note-body')
}

export function saveNote(file){
    const fileIndex = getFileIndex(file.id)
    if(fileIndex === -1) return
    const note = files[fileIndex]
    if(checkForDuplicateTitles(title, file.id)) return
    note.title = getTitleInput().value
    note.body = getBodyInput().value
    note.lastEdited = getFormattedDate(new Date())
    setSelectedFileId(file.id)
    setAppState('Editing')
    updateFileData()
    renderFolderContents()
}

export function createNewNote(){
    const date = getFormattedDate(new Date())
    const id = idNum
    files.push({
        title: 'Untitled',
        body: '',
        id,
        type: 'note',
        parentId: currentFolderId,
        date,
        lastEdited: date,
        tags: []
    })
    createTab(id)
    incrementIdNum()
    updateFileData()
    setSelectedFileId(id)
    setAppState('Editing')
    renderFolderContents()
    return id
}

export function initEditor(){
    
}