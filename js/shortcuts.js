import { selectedFileId, currentAppState, files, currentFolderId, currentNoteMode } from './state.js'
import { getFileIndex } from './storage.js'
import { saveNote, createNewNote } from './editor.js'
import { openSearchMenu } from './search.js'
import { createFolder } from './filetree.js'
import {createDefaultTab, getCountHolder, openFile, toggleNoteMode, updateCountHolder } from './tabs.js'
import { createQuickCaputeEl } from './quickcapture.js'

export function initShortcuts(){
    window.addEventListener('keydown', handleKeydown)
}

function handleKeydown(e){
    if(e.altKey && e.key === 's'){
        e.preventDefault()
        saveNote(files[getFileIndex(selectedFileId)])
        console.log('trying to save')

    } else if(e.altKey && e.key === 'n'){
        e.preventDefault()
       

    } else if(e.altKey && e.key === 'ArrowDown'){
        const folderContents = files.filter(f => f.parentId === currentFolderId)
        if(selectedFileId === null){
            openFile(folderContents[0].id)
        } else {
            const nextIndex = folderContents.findIndex(f => f.id === selectedFileId) + 1
            if(nextIndex > folderContents.length - 1) return
            loadTab(folderContents[nextIndex].id)
        }

    } else if(e.altKey && e.key === 'ArrowUp'){
        const folderContents = files.filter(f => f.parentId === currentFolderId)
        if(selectedFileId === null){
            openFile(folderContents[folderContents.length - 1].id)
        } else {
            const prevIndex = folderContents.findIndex(f => f.id === selectedFileId) - 1
            if(prevIndex < 0) return
            openFile(folderContents[prevIndex].id)
        }

    } else if(e.altKey && e.key === 'd'){
        e.preventDefault()
        openSearchMenu()
    } else if(e.altKey && e.key === 'f'){
        e.preventDefault()
        createFolder()
    } else if(e.altKey && e.key === 't'){
        e.preventDefault()
        createDefaultTab()
    } else if(e.altKey && e.key === 'p'){
        e.preventDefault()
        toggleNoteMode()
        updateCountHolder(getCountHolder(), files[getFileIndex(selectedFileId)], currentNoteMode)
    } else if(e.altKey && e.key === 'q'){
        e.preventDefault()
        createQuickCaputeEl()
    }
}