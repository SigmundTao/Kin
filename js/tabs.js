import { openTabs, setCurrentTabId, tabId, currentTabId, getTabIndex, getTabIndexFromFileId, incrementTabId, files, setSelectedFileId, currentNoteMode, setCurrentNoteMode } from "./state.js"
import { checkForDuplicateTitles, getFileIndex } from "./storage.js"
import { highlightSelectedFile, getTitleInput, getBodyInput, saveNote } from "./editor.js"
import { deleteFile } from "./filetree.js"
import { marked } from './markdown.js'

export const currentTabEl = document.getElementById('current-tab')
const tabBar = document.getElementById('tab-bar')
let noteDebounce

export function createTab(fileId){
    openTabs.push({file: fileId, id: tabId})
    setCurrentTabId(tabId)
    incrementTabId()
    loadTab(currentTabId)
    renderTabs()
}

export function loadTab(id){
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

export function checkForDefaultTabs(){
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

    defaultPage.appendChild(noteText)
    defaultPage.appendChild(folderText)
    defaultPage.appendChild(searchText)
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

    const persistentTitle = document.createElement('div')
    persistentTitle.textContent = titleInput.value
    persistentTitle.classList.add('persistent-title')

    const noteContentInput = document.createElement('textarea')
    noteContentInput.classList.add('note-body')
    noteContentInput.value = file.body

    const markdownDisplay = document.createElement('div');
    markdownDisplay.classList.add('note-body')
    markdownDisplay.classList.add('markdown-display')
    markdownDisplay.id = 'markdown-div'
    markdownDisplay.addEventListener('click', () => { switchToEditMode(noteContentInput, markdownDisplay) })

    const countHolder = document.createElement('div')
    countHolder.classList.add('count-holder')

    tab.appendChild(titleInput)
    tab.appendChild(noteContentInput)
    tab.appendChild(markdownDisplay)
    tab.appendChild(countHolder)
    currentTabEl.appendChild(tab)
    currentTabEl.appendChild(persistentTitle)
    updateCountHolder(countHolder, file, currentNoteMode)
    switchToDisplayMode(noteContentInput, markdownDisplay)

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
            updateCountHolder(countHolder, file)
        }, 300);
    })

}

function getMarkdownEl(){
    return document.getElementById('markdown-div')
}

export function toggleNoteMode(){
    const bodyInput = getBodyInput()
    const markdownEl = getMarkdownEl()

    if(bodyInput && markdownEl){
            if(currentNoteMode === 'display'){
            switchToEditMode(bodyInput, markdownEl)
        } else {
            switchToDisplayMode(bodyInput, markdownEl)
        }
    }
}
    

function switchToDisplayMode(bodyInput, markdownDiv){
    markdownDiv.innerHTML = marked.parse(bodyInput.value)
    bodyInput.style.display = 'none'
    markdownDiv.style.display = 'flex'
    setCurrentNoteMode('display')
    setTimeout(() => {
    const bars = document.querySelectorAll('.progress-bar-fill')
    console.log('bars found:', bars.length)
    bars.forEach(bar => {
        console.log('data-value:', bar.dataset.value)
        bar.style.width = bar.dataset.value + '%'
        console.log('style after:', bar.style.width)
    })
}, 0)
}
function switchToEditMode(bodyInput, markdownDiv){
    markdownDiv.style.display = 'none'
    bodyInput.style.display = 'flex'
    setCurrentNoteMode('edit')
}

export function updateCountHolder(holder, file, currentNoteMode){
    let imgClass;

    if(currentNoteMode === 'display') imgClass = 'display-mode'
    else imgClass = 'edit-mode'

    console.log(imgClass)

    holder.innerHTML = `
        <div class="note-mode-img ${imgClass}" ></div>
        <div class="word-count">${getWordCount(file)} Words</div>
        <div class="char-count">${getCharacterCount(file)} Characters</div>`
    console.log('imgClass at render time:', imgClass)
}

export function getCountHolder(){
    return document.querySelector('.count-holder')
}

function getWordCount(file){
    return file.body.split(' ').length
}

function getCharacterCount(file){
    return file.body.split('').length
}

export function overwriteDefaultTab(fileId){
    const defaultTabIndex = getTabIndexFromFileId(null)

    openTabs[defaultTabIndex].file = fileId
}

