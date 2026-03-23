import { files } from './state.js'
import { loadFile } from './editor.js'

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
        loadFile(file.id)
        closeSearchMenu()
    })
    return menuItem
}

function displaySearchResults(array, container){
    array.forEach(item => container.appendChild(createMenuItem(item)))
}