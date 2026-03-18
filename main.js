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

const tags = JSON.parse(localStorage.getItem('tags')) || [];

const tagSelectEl = document.getElementById('tag-select');

function updateTagSelect(){
    tagSelectEl.innerHTML = '';
    const allOption = document.createElement('option');
    tagSelectEl.appendChild(allOption);

    tags.forEach(tag => {
        tagSelectEl.appendChild(createTagOption(tag))
    })
}

function createTagOption(tag){
    const option = document.createElement('option');
    option.textContent = tag;
    option.value = tag;
    return option
}

function updateTagData(){
    localStorage.setItem('tags', JSON.stringify(tags));
}

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
    if(!note.tags || note.tags.length === 0){
        tagInputEl.value = ''
    } else {
        tagInputEl.value = note.tags.map(tag => `[${tag}]`).join(' ')
    }
    updateCurrentNoteID(note.id)
    updateWordCount()

    currentNoteDisplayState = 'Editing';

    const noteCards = document.querySelectorAll('.note-card')
    noteCards.forEach(card => {
        card.classList.remove('selected-note')
    })
    noteCards[noteIndex].classList.add('selected-note');
    
    tagDisplayEl.innerHTML = note.tags 
    ? note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
    : ''
}

function createSidebarNoteCard(title, date, containerEl, noteID, bookmarked){
    const sidebarNoteCard = document.createElement('div');
    sidebarNoteCard.classList.add('note-card')
    sidebarNoteCard.innerHTML = `
        <h4>${title}</h4>
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

//Tags
const tagInputEl = document.getElementById('tags-input');
const tagDisplayEl = document.getElementById('tags-display');

const tagColours = [
    [98, 0, 255, 0.5],
    [0, 223, 255, 0.5],
    [255, 0, 0, 0.5],
    [228, 255, 0, 0.5],
    [218, 0, 255, 0.5],
    [0, 255, 0, 0.5],
];

function getTags(){
    const matches = tagInputEl.value.match(/\[([^\]]+)\]/g) || []
    const tags = matches.map(tag => tag.slice(1, -1))
    return tags
}

function saveTags(tagArr){
    const index = getNoteIndex(currentNoteID)
    if(index === -1) return

    const oldTags = notes[index].tags;
    const removedTags = oldTags.filter(tag => !tagArr.includes(tag))

    notes[index].tags = tagArr

    tagArr.forEach(tag => {
        if(!tags.includes(tag)) tags.push(tag)
    })

    removedTags.forEach(t => {
        const stillInUse = notes.some(t =>notes.tag && notes.tag.includes(t))
        if(!stillInUse){
            tags.splice(tags.indexOf(t), 1)
        }
    })
    updateTagData();
    updateTagSelect()
    updateNoteData()
}

tagInputEl.addEventListener('blur', () => {
    const tags = getTags();
    tagInputEl.style.display = 'none';
    tagDisplayEl.style.display = 'flex';
    tagDisplayEl.innerHTML = tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('')
    saveTags(tags);
})

tagDisplayEl.addEventListener('click', () => {
    tagDisplayEl.style.display = 'none'
    tagInputEl.style.display = 'block'
    tagInputEl.focus()
})


getTags()

//character and word count
const wordCount = document.getElementById('word-count');
const characterCount = document.getElementById('character-count');
function updateWordCount(){
    const words = noteBodyEl.value.split(' ').length;
    const characters = noteBodyEl.value.split('').length;

    wordCount.textContent = `${words} Words`;
    characterCount.textContent = `${characters} Characters`
}

noteBodyEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        updateWordCount()
        createOrEdit()
    },300)
})



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
tagInputEl.value = '';
renderSidebarNoteCards()
updateTagSelect()