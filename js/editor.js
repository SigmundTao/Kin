import { files, selectedFileId, setAppState, setSelectedFileId, idNum, incrementIdNum, currentAppState, currentFolderId } from './state.js'
import { getFileIndex, updateFileData, checkForDuplicateTitles, getFormattedDate } from './storage.js'
import { createFolder, renderFolderContents } from './filetree.js'
import { loadTagsForNote, clearTags, handleTagDisplayClick } from './tags.js'
import { openSearchMenu } from './search.js'

let bodyDebounce

export function initEditor(){
    
}

function handleBodyInput(){
    clearTimeout(bodyDebounce)
    bodyDebounce = setTimeout(() => {
        updateWordCount()
        if(currentAppState === 'Editing') saveNoteChanges()
    }, 300)
}

function highlightSelectedFile(id){
    document.querySelectorAll('.file-card').forEach(card => card.classList.remove('selected-note'))
    const selectedCard = document.getElementById(id)
    if(selectedCard) selectedCard.classList.add('selected-note')
}

function displayDates(file){
    if(!file.lastEdited) file.lastEdited = file.date
    dateCreatedEl.innerHTML = `<div class="created-at"></div><p>${file.date}</p>`
    lastEditedEl.textContent = file.lastEdited
}

export function loadFile(id){
    const fileIndex = getFileIndex(id)
    if(fileIndex === -1) return
    const file = files[fileIndex]
    loadTagsForNote(file)
    setSelectedFileId(file.id)
    setAppState('Editing')
    updateEditorVisibility()
    updateWordCount()
    highlightSelectedFile(file.id)
    displayDates(file)
}

export function createBlankNote(){
    clearTags()
    noteBodyEl.value = ''
    noteTitleEl.value = 'Untitled'
    setAppState('Creating')
    updateEditorVisibility()
    noteTitleEl.focus()
    noteTitleEl.setSelectionRange(noteTitleEl.value.length, noteTitleEl.value.length)
}

export function saveNoteChanges(){
    const fileIndex = getFileIndex(selectedFileId)
    if(fileIndex === -1) return
    const file = files[fileIndex]
    if(checkForDuplicateTitles(noteTitleEl.value, file.id)) return
    file.title = noteTitleEl.value
    file.body = noteBodyEl.value
    file.lastEdited = getFormattedDate(new Date())
    setSelectedFileId(file.id)
    setAppState('Editing')
    displayDates(file)
    updateFileData()
    renderFolderContents()
}

export function createNewNote(){
    const date = getFormattedDate(new Date())
    const id = idNum
    files.push({
        title: noteTitleEl.value,
        body: noteBodyEl.value,
        id,
        type: 'note',
        parentId: currentFolderId,
        date,
        lastEdited: date,
        tags: []
    })
    incrementIdNum()
    updateFileData()
    setSelectedFileId(id)
    setAppState('Editing')
    renderFolderContents()
}

export function updateWordCount(){
    const text = noteBodyEl.value.trim()
    const words = text === '' ? 0 : text.split(/\s+/).length
    wordCountEl.textContent = `${words} Words`
    characterCountEl.textContent = `${noteBodyEl.value.length} Characters`
}

export function updateEditorVisibility(){
    idleScreenEl.style.display = currentAppState !== 'Idle' ? 'none' : 'flex'
}

export function focusOnNoteBody(){
    noteBodyEl.focus()
}

export function focusOnNoteTitle(){
    noteTitleEl.focus()
}