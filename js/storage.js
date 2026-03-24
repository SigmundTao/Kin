import { files } from './state.js'

export function updateFileData(){
    localStorage.setItem('files', JSON.stringify(files))
}

export function getFileIndex(id){
    const index = files.findIndex(i => i.id === Number(id))
    if(index === -1) console.warn('file not found for id: ', id)
    return index
}

export function checkForDuplicateTitles(title, id){
    return files.some(file => file.id !== id && file.title === title)
}

export function getFormattedDate(dateObj){
    return `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`
}