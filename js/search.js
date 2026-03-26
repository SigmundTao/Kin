import { files, idNum, incrementIdNum, currentFolderId } from './state.js'
import { openFile, renderTabs } from './tabs.js'
import { createNewNote } from './editor.js'
import { updateFileData, getFormattedDate } from './storage.js'
import { renderFiletree } from './filetree.js'

const searchMenu = document.getElementById('search-menu')
const searchBarEl = document.getElementById('search-bar')
const searchResultsEl = document.getElementById('search-results')

let searchResults = [...files]
let searchDebounce

export function initSearch(){
    searchBarEl.addEventListener('input', handleSearchInput)
    searchMenu.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') closeSearchMenu()
    })
}

export function openSearchMenu(){
    searchBarEl.value = ''
    searchResultsEl.innerHTML = ''
    displaySearchResults(files, searchResultsEl)
    searchMenu.showModal()
    searchBarEl.focus()
    window.addEventListener('click', () => closeSearchMenu(), { once: true })
}

export function closeSearchMenu(){
    searchMenu.close()
}

function handleSearchInput(e){
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        searchResults = files.filter(item =>
            item.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
            item.body && item.body.toLowerCase().includes(e.target.value.toLowerCase())
        )
        searchResultsEl.innerHTML = ''
        displaySearchResults(searchResults, searchResultsEl)
    }, 300)
}

function createMenuItem(file){
    const menuItem = document.createElement('div')
    menuItem.classList.add('search-result')
    menuItem.innerHTML = `
        <img src="assets/file.svg" class="search-result-img">
        <p>${file.title}</p>
        <div class="search-result-date-container">
            <img src="assets/date-icon.svg" class="search-result-img">
            <p>${file.date}</p>
        </div>
    `
    menuItem.addEventListener('click', () => {
        openFile(file.id)
        closeSearchMenu()
    })
    return menuItem
}

function displaySearchResults(array, container){
    if(array.length != 0){
        array.forEach(item => container.appendChild(createMenuItem(item)))
    } else {
        console.log(array)
        const newNoteCard = createNewNoteMenuItem()
        newNoteCard.addEventListener('click', createNoteFromMenu)
        container.appendChild(newNoteCard)
    }
}

function createNoteFromMenu(){
    const date = getFormattedDate(new Date())
    const id = idNum
    const title = searchBarEl.value.trim('')
    files.push({
        title: title,
        body: '',
        id,
        type: 'note',
        parentId: currentFolderId,
        date,
        lastEdited: date,
        tags: []
    })

    updateFileData()
    incrementIdNum()
    openFile(id)
    renderFiletree()
    closeSearchMenu()
}

function createNewNoteMenuItem(){
    const menuItem = document.createElement('div')
    menuItem.classList.add('search-result')
    menuItem.classList.add('new-note-card')
    menuItem.innerHTML = `
        <div>${searchBarEl.value}</div>
        <div class="menu-create-note-btn">Create Note</div>
    `
    return menuItem
}

searchBarEl.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && document.querySelector('.new-note-card')){
        createNoteFromMenu()
    }
})