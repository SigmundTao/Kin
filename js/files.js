import { createBlankNote } from "./editor.js"

const newFileSpanEl = document.getElementById('new-file-anchor-text')

export function initFiles(){
    newFileSpanEl.addEventListener('click', createBlankNote)
}

newFileSpanEl.addEventListener('click', (e) => {
    e.preventDefault()
    console.log('stuff is happening')
})

window.addEventListener('click', (e) => {
    console.log(e.target)
})