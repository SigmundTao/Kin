import { files, currentFolderId, isFileHolderOpen, toggleFileHolderState, incrementIdNum, idNum, getSelectedFileId, setSelectedFileId, setAppState, updateEditorVisibility } from './state.js'
import { getFileIndex, getFormattedDate, updateFileData } from './storage.js'
import { loadFile, createBlankNote, focusOnNoteTitle } from './editor.js'

export const fileTreeEl = document.getElementById('sidebar');
const fileTreeContainerEl = document.getElementById('displaying-notes-container')
const createNoteBtn = document.getElementById('new-note-btn');
const createFolderBtn = document.getElementById('create-folder-btn')

createNoteBtn.addEventListener('click', createBlankNote)

export function renderFolderContents(){
    fileTreeContainerEl.innerHTML = ''
    const folderContents = files.filter(file => file.parentId === currentFolderId)
    folderContents.forEach(file => {
        const card = new FileCard(file)
        fileTreeContainerEl.appendChild(card.element)
    })
}

class FileCard {
    constructor(file){
        this.file = file
        this.element = this.createElement()
    }

    createElement(){
        const card = document.createElement('div')
        const type = this.file.type
        const imgSrc = returnImgBasedOnFileType(type)
        card.classList.add('note-card')
        card.innerHTML = `
            <img class="note-card-img" src="${imgSrc}">
            <p class="file-name">${this.file.title}</p>
        `
        card.id = this.file.id
        if(this.file.type === 'note'){
            card.addEventListener('click', () => loadFile(this.file.id))
        }
        return card
    }
}

function returnImgBasedOnFileType(fileType){
    if(fileType === 'note') return './assets/file.svg'
    else if(fileType === 'folder') return './assets/empty-folder.svg'
}

export function createFolder(){
    removeTempFolder()
    const temporaryCard = document.createElement('div')
    temporaryCard.classList.add('note-card')
    temporaryCard.classList.add('temp')
    temporaryCard.innerHTML = `
        <img class="note-card-img" src="./assets/empty-folder.svg">
        <input type="text" id="temp-card-input">
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

    if(!eventTarget.classList.contains('note-card')
    && !eventTarget.parentElement.classList.contains('note-card')) return
    document.querySelector('.right-click-menu')?.remove()

    const file = eventTarget.classList.contains('note-card') ? eventTarget : eventTarget.parentElement
    console.log('file-id: ', file.id)
    const menu = createRightClickMenu(event.clientX, event.clientY, files[getFileIndex(file.id)])
    fileTreeEl.appendChild(menu)
    menu.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('click', () => menu.remove(), { once: true })
})