// Chave para identificar os dados salvos pela aplicação no navagegador
const STORAGE_KEY = "prompts_storage"

// Estado para carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
}
// Seleção dos elementos HMTL por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  promptList: document.getElementById("prompt-list"),
  searchInput: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de evento input para atualização em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
  updateAllEditableStates()
}

// Sidebar open/close logic
function openSidebar() {
  elements.sidebar.style.display = "flex"
  elements.btnOpen.style.display = "none"
}

function closeSidebar() {
  elements.sidebar.style.display = "none"
  elements.btnOpen.style.display = "block"
}

function attachSidebarHandlers() {
  elements.sidebar.style.display = "none"
  elements.btnOpen.style.display = ""

  elements.btnOpen.addEventListener("click", openSidebar)
  elements.btnCollapse.addEventListener("click", closeSidebar)
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title && !hasContent) {
    alert(
      "Por favor, preencha o título e o conteúdo do prompt antes de salvar."
    )
    return
  }

  if (state.selectedId) {
    // Editar prompt existente
    const prompt = state.prompts.find((p) => p.id === state.selectedId)
    if (prompt) {
      prompt.title = title || "Sem título"
      prompt.content = content || "Sem conteúdo"
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }

    state.prompts.unshift(newPrompt) // Adiciona no início da lista
    state.selectedId = newPrompt.id
  }

  renderPromptList(elements.searchInput.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar os prompts no localStorage:", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carregar os prompts do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <span class="prompt-item-title">${prompt.title}</span>
        <span class="prompt-item-description">${prompt.content}</span
        >
      </div>
      <button class="btn-icon" title="Remover" data-action="remove">
        <img src="assets/remove.svg" alt="Remover" class="icon icon-trash"/>
      </button>
    </li>
  `
}

function renderPromptList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((prompt) => createPromptItem(prompt))
    .join("")

  elements.promptList.innerHTML = filteredPrompts
}

function addnewPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.innerHTML = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}
function copySelected() {
  try {
    const content = elements.promptContent
    navigator.clipboard.writeText(content.innerText)
    alert("Conteúdo copiado")
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}
// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", addnewPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.searchInput.addEventListener("input", (event) => {
  renderPromptList(event.target.value)
})

elements.promptList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest('button[data-action="remove"]')
  const item = event.target.closest("[data-id]")

  if (!item) return
  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    // remover prompt
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderPromptList(elements.searchInput.value)
    persist()
    return
  }

  if (event.target.closest('[data-action="select"]')) {
    const prompt = state.prompts.find((p) => p.id === id)
    elements.promptTitle.textContent = prompt.title
    elements.promptContent.innerHTML = prompt.content
    updateAllEditableStates()
  }
})

// Inicialização
function init() {
  load()
  renderPromptList("")
  attachAllEditableHandlers()
  attachSidebarHandlers()
}

// Executa a inicialização
init()
