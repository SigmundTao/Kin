import { loadFile } from "./editor.js"
import { openTabs, getTabIndex, tabId, files, getFileHolderState, incrementTabId } from "./state.js"
import { getFileIndex } from "./storage.js"

const tabBar = document.getElementById('tab-bar')
const currentTabEl = document.getElementById('current-tab')

export function addNewTab(obj){
    openTabs.push({
        file: obj.fileId,
        id: obj.id
    })
}

export function deleteTab(tabId){
    openTabs.splice(getTabIndex(tabId), 1)
    renderTabs()
}

export function createDefaultTab(){
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
        searchText.textContent = 'Press Alt + f to search for a file'
        searchText.classList.add('default-page-text')
    
        defaultPage.appendChild(noteText)
        defaultPage.appendChild(folderText)
        defaultPage.appendChild(searchText)

        currentTabEl.appendChild(defaultPage)

        addNewTab({fileId: null, id:tabId})
        incrementTabId()
        renderTabs()
}

function renderTabs(){
    tabBar.innerHTML = ''
    openTabs.forEach(tab => {
        tabBar.appendChild(createTabCard(tab))
    })
}

function createTabCard(tab){
    const tabCard = document.createElement('div')
    tabCard.classList.add('tab')

    const tabTitle = document.createElement('p')
    tabTitle.textContent = tab.fileId ? files[getFileIndex(tab.fileId)].title :
    'New tab'

    const closeTabBtn = document.createElement('button')
    closeTabBtn.classList.add('close-tab-btn')
    closeTabBtn.textContent = 'X'
    closeTabBtn.addEventListener('click', () => {
        console.log('this is happening')
        deleteTab(tab.id)
        if(openTabs.length < 1){
            setTimeout(createDefaultTab, 1000)
        }
    })

    tabCard.appendChild(tabTitle)
    tabCard.appendChild(closeTabBtn)
    return tabCard
}

function updateCurrentTabDisplay(){}

export function checkForDefaultTabs(){
    return openTabs.findIndex(t => t.fileId === null)
}