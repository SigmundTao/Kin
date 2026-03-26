import { highlightSelectedFile } from './editor.js';
import { files, currentFolderId, isFileHolderOpen, toggleFileHolderState, incrementIdNum, idNum, getSelectedFileId, setSelectedFileId, setAppState, setDraggedElid, getDraggedElId, selectedFileId, openTabs, getTabIndexFromFileId, openFolderIds } from './state.js'
import { getFileIndex, getFormattedDate, updateFileData } from './storage.js'
import { openFile, checkIfTabExists, deleteTab } from './tabs.js';
export const fileTreeEl = document.getElementById('filetree');
const fileTreeContainerEl = document.getElementById('files-container')
const createNoteBtn = document.getElementById('create-note-btn');
const createFolderBtn = document.getElementById('create-folder-btn')

fileTreeContainerEl.addEventListener('dragenter', dragEnter)
fileTreeContainerEl.addEventListener('dragover', dragOver)
fileTreeContainerEl.addEventListener('dragleave', dragLeave)
fileTreeContainerEl.addEventListener('drop', drop)

 export function renderFiletree(){
    fileTreeContainerEl.innerHTML = ''
    files.forEach(file => {
        if(file.parentId) return
        if(file.type === 'folder'){
            renderFolder(file, 0)
        } else {
            fileTreeContainerEl.appendChild(renderFile(file))
        }
    })
    highlightSelectedFile(selectedFileId)
}

function renderFolder(folder, depth = 0){
    const folderCard = new FileCard(folder)
    folderCard.element.style.paddingLeft = `${depth * 12}px`
    fileTreeContainerEl.appendChild(folderCard.element)
    
    if(!openFolderIds.has(folder.id)) return
    
    const folderContents = files.filter(f => f.parentId === folder.id)
    folderContents.forEach(file => {
        if(file.type === 'folder'){
            renderFolder(file, depth + 1)
        } else {
            const card = renderFile(file)
            card.style.paddingLeft = `${(depth + 1) * 12}px`
            fileTreeContainerEl.appendChild(card)
        }
    })
}

function renderFile(file){
    const fileCard = new FileCard(file)
    return fileCard.element
}

class FileCard {
    constructor(file){
        this.file = file
        this.element = this.createElement()
        this.id = file.id
    }

    createElement(){
        const card = document.createElement('div')
        card.id = this.file.id
        card.addEventListener('click', () => { openFile(this.file.id) })
        this.addDragEventListner(card)
        const type = this.file.type
        const imgSrc = returnImgBasedOnFileType(type)
        card.classList.add('file-card')
        const fileCardHeader = document.createElement('div')
        fileCardHeader.classList.add('file-card-header')
        fileCardHeader.innerHTML = `
            <img class="file-card-img" src="${imgSrc}">
            <p class="file-name">${this.file.title}</p>
        `
        card.appendChild(fileCardHeader)
        
        if(this.file.type === 'folder'){
            this.addDropListener(card)
            card.classList.add('folder')
            fileCardHeader.addEventListener('click', () => {
                if(openFolderIds.has(this.id)){
                    openFolderIds.delete(this.id)
                    renderFiletree()
                } else if(!openFolderIds.has(this.id)){
                    openFolderIds.add(this.id)
                    renderFiletree()
                }
            })
        }
        return card
    }

    addDragEventListner(card){
        card.draggable = 'true'
        card.addEventListener('dragstart', dragstart)
    }

    addDropListener(card){
        card.addEventListener('dragenter', dragEnter)
        card.addEventListener('dragover', dragOver)
        card.addEventListener('dragleave', dragLeave)
        card.addEventListener('drop', drop)
    }
}

function dragstart(e){
    setDraggedElid(e.currentTarget.id)
}

function dragEnter(e){
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
}

function dragOver(e){
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
}

function dragLeave(e){
    e.currentTarget.classList.remove('drag-over')
}

function drop(e){
    e.currentTarget.classList.remove('drag-over')
    const draggedId = Number(getDraggedElId())
    const targetId = Number(e.currentTarget.id)

    if(draggedId === targetId) return
    if(isDescendant(draggedId, targetId)) return

    const draggedFile = files[getFileIndex(draggedId)]
    if(!draggedFile) return
    
    if(e.currentTarget.id === 'files-container'){
        draggedFile.parentId = null
    } else {
        draggedFile.parentId = targetId
    }
    setDraggedElid(null)
    updateFileData()
    renderFiletree()
}

function isDescendant(draggedId, targetId){
    let current = files[getFileIndex(targetId)]
    while(current && current.parentId !== null){
        if(current.parentId === draggedId) return true
        current = files[getFileIndex(current.parentId)]
    }
    return false
}

function returnImgBasedOnFileType(fileType){
    if(fileType === 'note') return './assets/file.svg'
    else if(fileType === 'folder') return './assets/empty-folder.svg'
}

export function createFolder(){
    removeTempFile()
    const temporaryCard = document.createElement('div')
    temporaryCard.classList.add('file-card')
    temporaryCard.classList.add('temp')
    temporaryCard.innerHTML = `
        <div class="file-card-header">
            <img class="file-card-img" src="./assets/empty-folder.svg">
            <input type="text" id="temp-card-input">
        </div>
    `
    fileTreeContainerEl.appendChild(temporaryCard)
    const input = document.querySelector('#temp-card-input')
    input.focus()
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            if(input.value.trim() === '') return
            saveFolder()
            removeTempFile()
            renderFiletree()
        }
    })
}

function removeTempFile(){
    const tempFile = document.querySelector('.temp')
    if(tempFile) tempFile.remove()
}

function saveFolder(){
    const folderName = document.querySelector('#temp-card-input').value
    const id = idNum
    const date = getFormattedDate(new Date())
    files.push({
        title: folderName,
        body: '',
        id,
        type: 'folder',
        parentId: currentFolderId,
        date,
        lastEdited: date,
        tags: []
    })
    incrementIdNum()
    updateFileData()
}

createFolderBtn.addEventListener('click', createFolder)

export function openFileHolder(){
    fileTreeEl.classList.remove('closed')
}

export function closeFileHolder(){
    fileTreeEl.classList.add('closed')
}

export function toggleFileHolder(){
    isFileHolderOpen ? closeFileHolder() : openFileHolder()
    toggleFileHolderState()
}

function createRightClickMenu(posX, posY, file){
    const menu = document.createElement('div')
    menu.classList.add('right-click-menu')
    menu.appendChild(createDeleteBtn(file.id, menu))

    if(file.type === 'note'){
        const menuEditBtn = document.createElement('div')
        menuEditBtn.classList.add('rc-menu-item')
        menuEditBtn.textContent = 'Edit'
        menuEditBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            openFile(file.id)
            menu.remove()
        })
        menu.appendChild(menuEditBtn)
    }

    menu.style.left = posX + 'px'
    menu.style.top = posY + 'px'
    menu.style.position = 'fixed'
    return menu
}

export function deleteFile(id){
    files.splice(getFileIndex(id), 1)
    updateFileData()
    renderFiletree()
    if(id === getSelectedFileId()){
        setSelectedFileId(null)
        setAppState('Idle')
    }
    if(checkIfTabExists(id)){
        deleteTab(openTabs[getTabIndexFromFileId(id)].id)
    }
}

function createDeleteBtn(toBeDeleted, menu){
    const deleteBtn = document.createElement('div')
    deleteBtn.classList.add('rc-menu-item')
    deleteBtn.id = 'rc-delete-btn'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => {
        deleteFile(toBeDeleted)
        menu.remove()
    })
    return deleteBtn
}

fileTreeContainerEl.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    const eventTarget = event.target
    const file = eventTarget.closest('.file-card')
    if(!file) return

    document.querySelector('.right-click-menu')?.remove()

    const menu = createRightClickMenu(event.clientX, event.clientY, files[getFileIndex(Number(file.id))])
    fileTreeEl.appendChild(menu)
    menu.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('click', () => menu.remove(), { once: true })
})