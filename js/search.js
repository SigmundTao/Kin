import { notes } from './state.js'
import { loadNote } from './editor.js'

const searchMenu = document.getElementById('search-menu')
const closeSearchMenuBtn = document.getElementById('close-search-menu-btn')
const searchBarEl = document.getElementById('search-bar')
const searchResultsHolderEl = document.getElementById('search-results')

let searchResults = [...notes]
let searchDebounce

export function initSearch(){
    closeSearchMenuBtn.addEventListener('click', closeSearchMenu)
    searchBarEl.addEventListener('input', handleSearchInput)
    searchMenu.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') closeSearchMenu()
    })
}

export function openSearchMenu(){
    searchBarEl.value = ''
    searchResultsHolderEl.innerHTML = ''
    displaySearchResults(notes, searchResultsHolderEl)
    searchMenu.showModal()
    searchBarEl.focus()
}

function closeSearchMenu(){
    searchMenu.close()
}

function handleSearchInput(e){
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        searchResults = notes.filter(item => item.title.includes(e.target.value))
        searchResultsHolderEl.innerHTML = ''
        displaySearchResults(searchResults, searchResultsHolderEl)
    }, 300)
}

function createMenuItem(note){
    const menuItem = document.createElement('div')
    menuItem.classList.add('search-menu-item')
    menuItem.innerHTML = `
        <img src="assets/text-icon.svg" class="search-result-img">
        <p>${note.title}</p>
        <div class="date-container">
            <img src="assets/date-icon.svg" class="search-result-img">
            <p>${note.date}</p>
        </div>
    `
    menuItem.addEventListener('click', () => {
        loadNote(note.id)
        closeSearchMenu()
    })
    return menuItem
}

function displaySearchResults(array, container){
    array.forEach(item => container.appendChild(createMenuItem(item)))
}