export const files = JSON.parse(localStorage.getItem('files'))|| []
export let selectedFileId = null
export let currentFolderId = null
export let currentAppState = 'Idle'
export let draggedElId = null
export let idNum = files.length > 0 ? Math.max(...files.map(n => n.id)) + 1 : 1
export const appStates = ['Idle', 'Editing', 'Creating']
export let isFileHolderOpen = false
const idleScreenEl = document.getElementById('idle-screen');

export function setAppState(state){
    if(!appStates.includes(state)){
        console.warn('Not a valid state:', state)
        return;
    }
    currentAppState = state;
}

export function getCurrentFolderContents(){
    return files.filter(f => f.parentId === currentFolderId)
}

export function setCurrentFolderId(id){
    currentFolderId = id
}

export function getSelectedFileId(){
    return selectedFileId
}

export function setSelectedFileId(id){
    selectedFileId = id
}

export function incrementIdNum(){ idNum++ }
export function updateEditorVisibility(){
    if(currentAppState !== 'Idle') idleScreenEl.style.display = 'none';
    else { idleScreenEl.style.display = 'flex' }
}

export function getFileHolderState(){ return isFileHolderOpen }
export function toggleFileHolderState(){ isFileHolderOpen = !isFileHolderOpen }

export function getDraggedElId(){ return draggedElId }
export function setDraggedElid(id){ draggedElId = id }