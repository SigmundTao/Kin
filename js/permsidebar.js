import { toggleFileHolder, collapsingFileHolderEl} from "./sidebar.js"

const toggleFilesBtn = document.getElementById('files-btn')

export function initPermSidebar(){
    toggleFilesBtn.addEventListener('click', toggleFileHolder)
}