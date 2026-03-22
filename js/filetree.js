import { files, currentFolderId, isFileHolderOpen, toggleFileHolderState, incrementIdNum, idNum, getSelectedFileId, setSelectedFileId, setAppState, updateEditorVisibility, setDraggedElid, getDraggedElId } from './state.js'
import { getFileIndex, getFormattedDate, updateFileData } from './storage.js'
import { loadFile, createBlankNote, focusOnNoteTitle } from './editor.js'

export const fileTreeEl = document.getElementById('sidebar');
const fileTreeContainerEl = document.getElementById('displaying-notes-container')
const createNoteBtn = document.getElementById('new-note-btn');
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

    folderContents.forEach(file => {
        const childCard = file.type === 'folder' ? renderFolder(file) : renderFile(file)
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
                console.log(contentsHolder.classList)
            })
        }
        return card
    }

    addDragEventListner(card){
        card.draggable = 'true';
        card.addEventListener('dragstart', dragstart)
    }

    addDropListener(card){
        card.addEventListener('dragenter', dragEnter)
        card.addEventListener('dragover', dragOver)
        card.addEventListener('dragleave', dragLeave)
        card.addEventListener('drop', drop)
    }
}

/// Drag and drop files handlers
function dragstart(e){
    setDraggedElid(e.target.id)
}

function dragEnter(e){
    e.preventDefault()
    const fileCard = e.target.classList.contains('file-card') ?  e.target
    : e.target.parentElement
    fileCard.classList.add('drag-over')
}

function dragOver(e){
    e.preventDefault()
    const fileCard = e.target.classList.contains('file-card') ?  e.target
    : e.target.parentElement
    fileCard.classList.add('drag-over')
}

function dragLeave(e){
    const fileCard = e.target.classList.contains('file-card') ?  e.target
    : e.target.parentElement
    fileCard.classList.remove('drag-over')
}

function drop(e){
    e.target.classList.remove('drag-over')

    const fileCard = e.target.classList.contains('file-card') ?  e.target
    : e.target.parentElement

    const draggedFile = files[getFileIndex(getDraggedElId())]

    draggedFile.parentId = Number(fileCard.id)
    setDraggedElid(null)
    updateFileData()
    renderFolderContents()
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
    fileTreeEl.style.display = 'flex'
}

export function closeFileHolder(){
    fileTreeEl.style.display = 'none'
}

export function toggleFileHolder(){
    isFileHolderOpen ? closeFileHolder() : openFileHolder()
    toggleFileHolderState()
}

function createRightClickMenu(posX, posY, file){
    console.log(file)
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
    console.log(eventTarget)

    if(!eventTarget.classList.contains('file-card')
    && !eventTarget.parentElement.classList.contains('file-card')) return
    document.querySelector('.right-click-menu')?.remove()

    const file = eventTarget.classList.contains('file-card') ? eventTarget : eventTarget.parentElement
    console.log('file-id: ', file.id)
    const menu = createRightClickMenu(event.clientX, event.clientY, files[getFileIndex(file.id)])
    fileTreeEl.appendChild(menu)
    menu.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('click', () => menu.remove(), { once: true })
})