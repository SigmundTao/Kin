import { openTabs, deleteTab, addNewTab, getNumberOfTabs } from "./state"

function createDefaultTab(){
    addNewTab({ file: null })
}

function renderTabs(openTabsArr){
    if(!getNumberOfTabs()){
        createDefaultTab()
        renderTabs()
    }
    openTabsArr.forEach(t => {
        const tab = new Tab(t.file)
    });
}

class Tab {
    constructor(file){
        this.id = file.id
        this.element = this.createTabElement()
    }

    createTabElement(){
        const tab = document.createElement('div')
        tab.classList.add('tab')

        return tab
    }

    createDefaultTab(){
        const newNoteHyperlink = document.createElement('p')
        newNoteHyperlink.textContent = 'Press Alt + n to create a note'
    
        const newFolderHyperlink = document.createElement('p')
        newFolderHyperlink.textContent = 'Press Alt + f to create a folder'

        const searchHyperlink = document.createElement('p')
        searchHyperlink.textContent = 'Press Alt + d to search for a file'

        const idleScreen = document.createElement('div')
        idleScreen.appendChild(newNoteHyperlink)
        idleScreen.appendChild(newFolderHyperlink)
        idleScreen.appendChild(searchHyperlink)

        this.element.innerHTML = ``
        this.element.appendChild(idleScreen)
    }


    
}
    