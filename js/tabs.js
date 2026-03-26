import { openTabs, setCurrentTabId, tabId, currentTabId, getTabIndex, getTabIndexFromFileId, incrementTabId, files, setSelectedFileId } from "./state.js"
import { checkForDuplicateTitles, getFileIndex } from "./storage.js"
import { highlightSelectedFile, getTitleInput, getBodyInput, saveNote } from "./editor.js"
import { deleteFile } from "./filetree.js"

const currentTabEl = document.getElementById('current-tab')
const tabBar = document.getElementById('tab-bar')
let noteDebounce

export function createTab(fileId){
    openTabs.push({file: fileId, id: tabId})
    setCurrentTabId(tabId)
    incrementTabId()
    loadTab(currentTabId)
    renderTabs()
}

function loadTab(id){
    const tabIndex = getTabIndex(id)
    if(tabIndex === -1) return
    const fileId = openTabs[tabIndex].file
    if(fileId === null){
        createDefaultView()
        setSelectedFileId(null)
        highlightSelectedFile()
    } else {
        const file = files[getFileIndex(fileId)]
        setSelectedFileId(file.id)
        highlightSelectedFile(file.id)
        createNoteView(file)
    }
}

export function createDefaultTab(){
    if(checkForDefaultTabs() !== -1){
        switchToTab(openTabs[openTabs.findIndex(t => t.file === null)].id)
        return
    }
    createTab(null)
}

function switchToTab(id){
    setCurrentTabId(id)
    loadTab(id)
    renderTabs()
}

export function deleteTab(id){
    const tabIndex = getTabIndex(id)
    openTabs.splice(tabIndex, 1)
    if(openTabs.length < 1){
        currentTabEl.innerHTML = ''
        createDefaultTab()
        highlightSelectedFile(null)
        return
    }

    if(currentTabId === id){
        const nextTab = openTabs[tabIndex] || openTabs[tabIndex - 1]
        switchToTab(nextTab.id)
    } else {
        renderTabs()
    }
}

export function renderTabs(){
    tabBar.innerHTML = ''
    openTabs.forEach(tab => {
        const tabCard = createTabCard(tab)
        if(tab.id === currentTabId) tabCard.classList.add('current-tab')
        tabBar.appendChild(tabCard)
    })
}

function createTabCard(tab){
    const tabCard = document.createElement('div')
    tabCard.classList.add('tab-card')
    tabCard.id = tab.id

    const tabTitle = document.createElement('p')
    tabTitle.textContent = tab.file ? files[getFileIndex(tab.file)].title : 'New tab'

    const closeTabBtn = document.createElement('button')
    closeTabBtn.classList.add('close-tab-btn')
    closeTabBtn.textContent = 'X'
    closeTabBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteTab(tab.id)
    })

    tabCard.addEventListener('click', () => switchToTab(tab.id))
    tabCard.appendChild(tabTitle)
    tabCard.appendChild(closeTabBtn)
    return tabCard
}

export function openFile(fileId){
    if(files[getFileIndex(fileId)].type === 'folder') return
    if(checkIfTabExists(fileId)){
        const tabIndex = getTabIndexFromFileId(fileId)
        switchToTab(openTabs[tabIndex].id)
    } else {
        if(checkForDefaultTabs() !== -1){
            overwriteDefaultTab(fileId)
            loadTab(fileId)
            const defaultTabIndex = openTabs.findIndex(t => t.file === fileId)
            switchToTab(openTabs[defaultTabIndex].id)
        } else {
            createTab(fileId)
        }
    }
}

function checkForDefaultTabs(){
    return openTabs.findIndex(t => t.file === null)
}

export function checkIfTabExists(fileId){
    return openTabs.findIndex(t => t.file === fileId) !== -1
}

function createDefaultView(){
    currentTabEl.innerHTML = ''

    const defaultPage = document.createElement('div')
    defaultPage.classList.add('default-page')

    const noteText = document.createElement('p')
    noteText.textContent = 'Press Alt + n to create a note'
    noteText.classList.add('default-page-text')

    const folderText = document.createElement('p')
    folderText.textContent = 'Press Alt + f to create a new folder'
    folderText.classList.add('default-page-text')

    const searchText = document.createElement('p')
    searchText.textContent = 'Press Alt + d to search for a file'
    searchText.classList.add('default-page-text')

    const ginkgoTreeImg = document.createElement('div')
    ginkgoTreeImg.classList.add('ginkgo-tree')

    defaultPage.appendChild(noteText)
    defaultPage.appendChild(folderText)
    defaultPage.appendChild(searchText)
    defaultPage.appendChild(ginkgoTreeImg)
    currentTabEl.appendChild(defaultPage)
}

function createNoteView(file){
    currentTabEl.innerHTML = ''

    const tab = document.createElement('div')
    tab.classList.add('tab')

    const titleInput = document.createElement('input')
    titleInput.type = 'text'
    titleInput.classList.add('note-title')
    titleInput.value = file.title

    const noteContentInput = document.createElement('textarea')
    noteContentInput.classList.add('note-body')
    noteContentInput.value = file.body

    tab.appendChild(titleInput)
    tab.appendChild(noteContentInput)
    currentTabEl.appendChild(tab)

    titleInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            saveNote(file)
            noteContentInput.focus()
        }
    })

    noteContentInput.addEventListener('input', () => {
        clearTimeout(noteDebounce)

        noteDebounce = setTimeout(() => {
            saveNote(file)
        }, 300);
    })
}

function overwriteDefaultTab(fileId){
    const defaultTabIndex = getTabIndexFromFileId(null)

    openTabs[defaultTabIndex].file = fileId
}

