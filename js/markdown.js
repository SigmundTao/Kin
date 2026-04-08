import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm'
import { getFormattedDate } from './storage.js'
import { getBodyInput } from './editor.js'
import { getWordCount } from './tabs.js'
import { getFileIndex, selectedFileId, files } from './state.js'

const highlightExtension = {
    name: 'highlight',
    level: 'inline',
    start(src){ return src.indexOf('==') },
    tokenizer(src){
        const match = src.match(/^==([^=]+)==/)
        if(match) return { type: 'highlight', raw: match[0], text: match[1] }
    },
    renderer(token){ return `<mark class="highlight-md">${token.text}</mark>` }
}

const tagExtension = {
    name: 'tag',
    level: 'inline',
    start(src){ return src.indexOf('#') },
    tokenizer(src){
        const match = src.match(/^#([a-zA-Z][a-zA-Z0-9_-]*)/)
        if(match) return { type: 'tag', raw: match[0], tag: match[1] }
    },
    renderer(token){ 
        return `<span class="md-tag" data-tag="${token.tag}">${token.tag}</span>` 
    }
}

const progressBar = {
    name: 'progressBar',
    level: 'block',
    start(src){ return src.indexOf(':::[') },
    tokenizer(src){
        const match = src.match(/^:::\[(\d+)\]/)
        if(match){
            return {
                type: 'progressBar',
                raw: match[0],
                value: Math.min(100, Math.max(0, Number(match[1])))
            }
        }
    },
    renderer(token){
        return `
            <div class="progress-bar-container">
                <div class="progress-bar-fill" data-value="${token.value}"></div>
                <span class="progress-bar-label">${token.value}%</span>
            </div>
        `
    }
}

const importantLabel = {
    name: 'importantLabel',
    level: 'inline',
    start(src){ return src.indexOf('[!]') },
    tokenizer(src){
        const match = src.match(/^\[!\]/)
        if(match) return { type: 'importantLabel', raw: match[0] }
    },
    renderer(token){
        return `<span class="important-label"></span>`
    }
}

const colorSwash = {
    name: 'colorSwash',
    level: 'inline',
    start(src){ return src.indexOf('(#') },
    tokenizer(src){
        const match = src.match(/^\(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\)/)
        if(match) return { type: 'colorSwash', raw: match[0], color: match[1] }
    },
    renderer(token){
        return `<span class="color-swash" style="background-color: #${token.color};"></span>`
    }
}

const nameTag = {
    name: 'nameTag',
    level: 'inline',
    start(src){ return src.indexOf('@') },
    tokenizer(src){
        const match = src.match(/^@([a-zA-Z][a-zA-Z0-9_-]*)/)
        if(match) return {
            type: 'nameTag',
            raw: match[0],
            name: match[1]
        }
    },
    renderer(token){
        return `<span class="name-tag">@${token.name}</span>`
    }
}

const currentDate = {
    name: 'currentDate',
    level: 'inline',
    start(src){ return src.indexOf('{{') },
    tokenizer(src){
        const match = src.match(/^{{date}}/)
        if(match){
            const curDate = getFormattedDate(new Date())
            return {
                type: 'currentDate',
                raw: match[0],
                date: curDate
            }
        }
    },
    renderer(token){
        return `
            <span class="current-date-md date-md">
                <span class="date-img"></span>
                <span>${token.date}</span>
            </span>
        `
    }
}

const tomorrow = {
    name: 'tomorrow',
    level: 'inline',
    start(src){ return src.indexOf('{{') },
    tokenizer(src){
        const match = src.match(/^{{tomorrow}}/)
        if(match){
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            const formattedDate = getFormattedDate(tomorrow)

            return {
                type: 'tomorrow',
                raw: match[0],
                date: formattedDate
            }
        }
    },
    renderer(token){
        return `
            <span class="tomorrow-md date-md">
                <span class="date-img"></span>
                <span>${token.date}</span>
            </span>
        `
    }
}

const yesterday = {
    name: 'yesterday',
    level: 'inline',
    start(src){ return src.indexOf('{{') },
    tokenizer(src){
        const match = src.match(/^{{yesterday}}/)
        if(match){
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            const formattedDate = getFormattedDate(yesterday)

            return {
                type: 'yesterday',
                raw: match[0],
                date: formattedDate
            }
        }
    },
    renderer(token){
        return `
            <span class="yesterday-md date-md">
                <span class="date-img"></span>
                <span>${token.date}</span>
            </span>
        `
    }
}

const wordCount = {
    name: 'wordCount',
    level: 'inline',
    start(src){ return src.indexOf('{{') },
    tokenizer(src){
        const match = src.match(/^{{wordcount}}/)
        if(match){
            const count = getWordCount(files[getFileIndex(selectedFileId)])
            return {
                type: 'wordCount',
                raw: match[0],
                words: count
            }
        }
    },
    renderer(token){
        return `
            <span class="word-count-md">${token.words} Words</span>
        `
    }
}

marked.use({
    mangle: false,
    headerIds: false,
    extensions: [wordCount, tagExtension, progressBar, highlightExtension, importantLabel, colorSwash, nameTag, currentDate, tomorrow, yesterday]
})

export { marked }