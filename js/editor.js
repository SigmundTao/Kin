import { files, getFileIndex, idNum, currentFolderId, incrementIdNum, setSelectedFileId, setAppState } from "./state.js"
import { getFormattedDate, updateFileData, checkForDuplicateTitles } from "./storage.js"
import { createTab, renderTabs } from "./tabs.js"
import { renderFiletree } from "./filetree.js"

const createNoteBtn = document.getElementById('create-note-btn')
createNoteBtn.addEventListener('click', createNewNote)

export function highlightSelectedFile(id){
    document.querySelectorAll('.file-card').forEach(card => card.classList.remove('selected-file'))
    const selectedCard = document.getElementById(id)
    if(selectedCard) selectedCard.classList.add('selected-file')
}

 export function getTitleInput(){
    return document.querySelector('.note-title')
}

export function getBodyInput(){
    return document.querySelector('.note-body')
}

export function saveNote(file){
    const fileIndex = getFileIndex(file.id)
    if(fileIndex === -1) return
    if(checkForDuplicateTitles(file.title, file.id)) return
    file.title = getTitleInput().value
    console.log(getTitleInput().value)
    file.body = getBodyInput().value
    file.lastEdited = getFormattedDate(new Date())
    setSelectedFileId(file.id)
    setAppState('Editing')
    updateFileData()
    renderFiletree()
    renderTabs()
}

export function createNewNote(){
    const date = getFormattedDate(new Date())
    const id = idNum
    const title = getUntitledTitle()
    files.push({
        title: title,
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
    renderFiletree()
    return id
}

export function getUntitledTitle(){
    const untitledTitles = new Set(files.filter(f => f.title.startsWith('Untitled')).map(f => f.title))
    if(!untitledTitles.has('Untitled')) return 'Untitled'
    let i = 1
    while(untitledTitles.has(`Untitled ${i}`)){
        i++
        if(i > 1000) break
    }
    return `Untitled ${i}`
}