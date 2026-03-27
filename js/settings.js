const settingEl = document.getElementById('settings')
const closeSettingsBtn = document.getElementById('close-settings-btn')
const themeSelectEl = document.getElementById('theme-select')
const openSettingsBtn = document.getElementById('settings-btn')
const savedTheme = localStorage.getItem('theme') || 'sakura'

function openSettingsMenu(){
    console.log('stuff is happening')
    settingEl.showModal()
}

function closeSettingsMenu(){
    settingEl.close()
}

function setTheme(theme){
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
}

closeSettingsBtn.addEventListener('click', closeSettingsMenu)

export function initSettings(){
    setTheme(savedTheme)
    openSettingsBtn.addEventListener('click', openSettingsMenu)
}

themeSelectEl.addEventListener('change', () => setTheme(themeSelectEl.value))