import { openTabs, getTabIndex, tabId, files, incrementTabId, currentTabId, setCurrentTabId } from "./state.js"
import { getFileIndex } from "./storage.js"
import { loadFile } from "./editor.js"

const tabBar = document.getElementById('tab-bar')
const currentTabEl = document.getElementById('current-tab')

export function addNewTab(obj){
    openTabs.push({
        file: obj.fileId,
        id: obj.id
    })
}

export function deleteTab(id){
    openTabs.splice(getTabIndex(id), 1)
    renderTabs()
    if(openTabs.length < 1){
        currentTabEl.innerHTML = ''
        setTimeout(createDefaultTab, 500)
    }
}

export function createDefaultTab(){
    if(checkForDefaultTabs() !== -1) return

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

    defaultPage.appendChild(noteText)
    defaultPage.appendChild(folderText)
    defaultPage.appendChild(searchText)
    currentTabEl.appendChild(defaultPage)

    addNewTab({fileId: null, id: tabId})
    setCurrentTabId(tabId)
    incrementTabId()
    renderTabs()
}

function renderTabs(){
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
    closeTabBtn.addEventListener('click', () => deleteTab(tab.id))

    tabCard.addEventListener('click', () => loadTab(tab.id))
    tabCard.appendChild(tabTitle)
    tabCard.appendChild(closeTabBtn)
    return tabCard
}

export function checkForDefaultTabs(){
    return openTabs.findIndex(t => t.file === null)
}

export function createNoteTab(file){
    addNewTab({fileId: file.id, id: tabId})
    setCurrentTabId(tabId)
    incrementTabId()

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
    renderTabs()
}

function loadTab(id){
    const tabIndex = getTabIndex(id)
    setCurrentTabId(id)
    if(openTabs[tabIndex].file === null){
        createDefaultTab()
    } else {
        createNoteTab(files[getFileIndex(openTabs[tabIndex].file)])
    }
    renderTabs()
}