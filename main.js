const noteDisplayDivEl = document.getElementById('notes-display-div');
const createNewNoteBtn = document.getElementById('create-new-note-btn');
const noteTitleEl = document.getElementById('note-title');
const noteBodyEl = document.getElementById('note-body');
const sidebarEl = document.getElementById('sidebar');
const saveNoteBtn = document.getElementById('save-note-btn');
const displayingNotesContainerEl = document.getElementById('displaying-notes-container');
const bookmarkNavBtn = document.getElementById('bookmark-nav-item');
const displayAllNotesBtn = document.getElementById('all-notes-btn');

const noteDisplayStates = ['Idle', 'Editing', 'Creating'];
let currentNoteDisplayState = 'Idle';
let currentNoteID = 0;
let showingBookmarks = false;

const notes = JSON.parse(localStorage.getItem('notes')) || [];
let displayingNotes = [...notes]

let idNum = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;

function showBookmarkedNotes(){
    showingBookmarks = true;
    displayingNotes = [];
    notes.forEach(note => {
        if(note.bookmarked){
            displayingNotes.push(note);
        }
    })
    renderSidebarNoteCards()
}

function showAllNotes(){
    displayingNotes = [...notes];
    showingBookmarks = false;
    renderSidebarNoteCards()
}

function updateNoteData(){
    localStorage.setItem('notes', JSON.stringify(notes));
}

function getNoteIndex(id){
    return notes.findIndex(i => i.id === id);
}

function loadNote(id){
    const noteIndex = getNoteIndex(id);
    const note = notes[noteIndex];

    noteTitleEl.value = note.title;
    noteBodyEl.value = note.body;
    updateCurrentNoteID(note.id)

    currentNoteDisplayState = 'Editing';

    const noteCards = document.querySelectorAll('.note-card')
    noteCards.forEach(card => {
        card.classList.remove('selected-note')
    })
    noteCards[noteIndex].classList.add('selected-note');    
}

function createSidebarNoteCard(title, date, containerEl, noteID, bookmarked){
    const sidebarNoteCard = document.createElement('div');
    sidebarNoteCard.classList.add('note-card')
    sidebarNoteCard.innerHTML = `
        <h2>${title}</h2>
        <p>${date}</p>
    `;
     
    console.log(bookmarked, title);

    const bookmark = document.createElement('div');
    bookmark.classList.add('note-card-bookmark')
    if(bookmarked){
        bookmark.classList.add('bookmarked')
    } else {
        bookmark.classList.add('unbookmarked');
    }

    sidebarNoteCard.appendChild(bookmark)

    bookmark.addEventListener('click', (e) => {
        e.stopPropagation();
        notes[getNoteIndex(noteID)].bookmarked = !notes[getNoteIndex(noteID)].bookmarked;
        if(showingBookmarks){
            showBookmarkedNotes()
        } else{
            renderSidebarNoteCards()
        }        
    })

    const deleteNoteBtn = document.createElement('button');
    deleteNoteBtn.classList.add('delete-note-btn');
    deleteNoteBtn.textContent = 'x';
    deleteNoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notes.splice(getNoteIndex(noteID), 1);
        updateNoteData()
        renderSidebarNoteCards()
    })

    sidebarNoteCard.appendChild(deleteNoteBtn) 

    sidebarNoteCard.addEventListener('click', () => loadNote(noteID))
    containerEl.appendChild(sidebarNoteCard)
}

function renderSidebarNoteCards(){
    displayingNotesContainerEl.innerHTML = '';
    displayingNotes.forEach(note => createSidebarNoteCard(note.title, note.date, displayingNotesContainerEl, note.id, note.bookmarked));
}

function createBlankNote(){
    noteBodyEl.value = '';
    noteTitleEl.value = 'Untitled Note';
    currentNoteDisplayState = 'Creating';
    noteTitleEl.focus()
}

function saveNoteChanges(){
    const noteIndex = getNoteIndex(currentNoteID);
    if(noteIndex === -1) return console.log('note not found, currentNoteID:', currentNoteID)
    if(checkForDuplicateNoteTitles(noteTitleEl.value, notes[noteIndex].id)){
        return;
    }
    notes[noteIndex].title = noteTitleEl.value;
    notes[noteIndex].body = noteBodyEl.value;
    updateCurrentNoteID(notes[noteIndex].id)
    updateNoteData()
    renderSidebarNoteCards(); 
    currentNoteDisplayState = 'Editing';
}

function createOrEdit(){
    if(currentNoteDisplayState === 'Creating') createNewNote();
    if(currentNoteDisplayState === 'Editing') saveNoteChanges();
}

function createNewNote(){
    const noteTitle =  noteTitleEl.value;
    const noteBody = noteBodyEl.value;
    const day = new Date();
    const date = `${day.getDate()}-${day.getMonth() + 1}-${day.getFullYear()}`;
    const id = idNum;
    idNum++;

    notes.push({title: noteTitle, body: noteBody, id:id, date: date, bookmarked: false});
    updateNoteData()
    updateCurrentNoteID(id);
    renderSidebarNoteCards();
    currentNoteDisplayState = 'Editing';
}

function checkForDuplicateNoteTitles(title, id){
    let hasDuplicates = false;
    notes.forEach(note => {
        if(note.id === id){
            return;
        } else {
            if(note.title === title){
                hasDuplicates = true;
            }
        }
        
    })
    return hasDuplicates;
}

function updateCurrentNoteID(id){
    currentNoteID = id;
}

function saveNote(){
    if(currentNoteDisplayState !== 'Creating') return;
    createNewNote();
}

createNewNoteBtn.addEventListener('click', createBlankNote);
saveNoteBtn.addEventListener('click', createOrEdit);

//search functionality
const searchMenu = document.getElementById('search-menu');
const closeSearchMenuBtn = document.getElementById('close-search-menu-btn');
const searchBarEl = document.getElementById('search-bar');
const searchResultsHolderEl = document.getElementById('search-results');

let searchResults = [...notes]
let debounceTimer;

function openSearchMenu(){
    searchBarEl.value = '';
    displaySearchResults(searchResults, searchResultsHolderEl)
    searchMenu.showModal();
    searchBarEl.focus();
}

function closeSearchMenu(){
    searchMenu.close();
}



function createMenuItem(fileObj){
    const menuItem = document.createElement('div');
    menuItem.classList.add('search-menu-item');
    menuItem.innerHTML = `
        <img src="assets/text-icon.svg" class ="search-result-img">
        <p>${fileObj.title}</p>
        <div class="date-container">
            <img src="assets/date-icon.svg" class ="search-result-img">
            <p>${fileObj.date}</p>
        </div>
    `

    menuItem.addEventListener('click', () => {
        loadNote(fileObj.id);
        closeSearchMenu();
    })
    return menuItem;
}

function displaySearchResults(array, desiredOuputContainer){
    array.forEach(item => {
        desiredOuputContainer.appendChild(createMenuItem(item))
    })
}

searchBarEl.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchResults = [];
        searchResultsHolderEl.innerHTML = '';
        notes.forEach(item => {
            if(item.title.includes(e.target.value)){
                searchResults.push(item)
            }
        });
        console.log(searchResults);
        displaySearchResults(searchResults, searchResultsHolderEl)
    },300)
})

searchMenu.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
        closeSearchMenu()
    }
})
closeSearchMenuBtn.addEventListener('click', closeSearchMenu);

window.addEventListener('keydown', (e) => {
    //Save note with alt+s
    if(e.altKey && e.key === 's'){
        e.preventDefault()
        if(currentNoteDisplayState === 'Creating'){
            saveNote()
        } else if(currentNoteDisplayState === 'Editing'){
            saveNoteChanges()
        }
    //create new note with alt+n
    } else if(e.altKey && e.key === 'n'){
        e.preventDefault()
        createBlankNote()
    //cycle through notes using alt + upArrow/downArrow
    } else if(e.altKey && e.key === 'ArrowDown'){
        if(currentNoteID === 0){
            loadNote(notes[0].id)
        } else {
            const nextIndex = getNoteIndex(currentNoteID) + 1; 
            if(nextIndex > notes.length -1) return;
            loadNote(notes[nextIndex].id);
        }
    } else if(e.altKey && e.key === 'ArrowUp'){
        if(currentNoteID === 0){
            loadNote(notes[notes.length - 1].id)
        } else {
            const prevIndex = getNoteIndex(currentNoteID) - 1;
            if(prevIndex < 0) return;
            loadNote(notes[prevIndex].id);
        }
    } else if (e.altKey && e.key === 'd'){
        e.preventDefault()
        openSearchMenu()
    }
})

bookmarkNavBtn.addEventListener('click', showBookmarkedNotes);
displayAllNotesBtn.addEventListener('click', showAllNotes);


window.addEventListener('keydown', (e) => {console.log(e.key)})
noteTitleEl.value = '';
noteBodyEl.value = `Press 'alt + n' to create a new note`;
renderSidebarNoteCards()