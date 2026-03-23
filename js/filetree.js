import { files, currentFolderId, isFileHolderOpen, toggleFileHolderState, incrementIdNum, idNum, getSelectedFileId, setSelectedFileId, setAppState, setDraggedElid, getDraggedElId } from './state.js'
import { getFileIndex, getFormattedDate, updateFileData } from './storage.js'
import { loadFile, createBlankNote, focusOnNoteTitle, updateEditorVisibility } from './editor.js'

export const fileTreeEl = document.getElementById('filetree');
const fileTreeContainerEl = document.getElementById('files-container')
const createNoteBtn = document.getElementById('create-note-btn');
const createFolderBtn = document.getElementById('create-folder-btn')

createNoteBtn.addEventListener('click', createBlankNote)

export function renderFolderContents(){
    fileTreeContainerEl.innerHTML = ''
    files.forEach(file => {
        if(file.parentId) return
        const card = file.type === 'folder' ? renderFolder(file) : renderFile(file)
        fileTreeContainerEl.appendChild(card)
    })  
}

function renderFolder(folder){
    const folderCard = new FileCard(folder)
    const folderContents = files.filter(f => f.parentId === folder.id)
    const folderContentsHolder = folderCard.element.querySelector('.folder-contents')
    folderCard.element.appendChild(folderContentsHolder)
    const paddingLeft = Number(folderCard.element.style.paddingLeft.split('px')[0])

    folderContents.forEach(file => {
        const childCard = file.type === 'folder' ? renderFolder(file) : renderFile(file)
        childCard.style.paddingLeft = `${paddingLeft + 10}px`
        folderContentsHolder.appendChild(childCard)
    })

    return folderCard.element
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
        
        if(this.file.type === 'note'){
            card.addEventListener('click', () => loadFile(this.id))
        } else if(this.file.type === 'folder'){
            this.addDropListener(card)
            card.classList.add('folder')
            const contentsHolder = document.createElement('div')
            contentsHolder.classList.add('folder-contents')
            card.appendChild(contentsHolder)
            fileCardHeader.addEventListener('click', () => {
                contentsHolder.classList.toggle('showing-contents')
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
    
    draggedFile.parentId = targetId
    setDraggedElid(null)
    updateFileData()
    renderFolderContents()
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
    removeTempFolder()
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
            removeTempFolder()
            renderFolderContents()
        }
    })
}

function removeTempFolder(){
    const tempFolder = document.querySelector('.temp')
    if(tempFolder) tempFolder.remove()
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
    toggleFileHolderState()
    isFileHolderOpen ? closeFileHolder() : openFileHolder()
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
            loadFile(file.id)
            menu.remove()
            focusOnNoteTitle()
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
    renderFolderContents()
    if(id === getSelectedFileId()){
        setSelectedFileId(null)
        setAppState('Idle')
        updateEditorVisibility()
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

window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    const eventTarget = event.target

    if(!eventTarget.classList.contains('file-card')
    && !eventTarget.parentElement.classList.contains('file-card')) return
    document.querySelector('.right-click-menu')?.remove()

    const file = eventTarget.closest('.file-card')
    const menu = createRightClickMenu(event.clientX, event.clientY, files[getFileIndex(Number(file.id))])
    fileTreeEl.appendChild(menu)
    menu.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('click', () => menu.remove(), { once: true })
})