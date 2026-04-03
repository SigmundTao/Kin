import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm'

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

marked.use({
    mangle: false,
    headerIds: false,
    extensions: [tagExtension, progressBar, highlightExtension]
})

export { marked }