// Variables globales para almacenar datos
let tasks = [];
let notes = [];
let images = [];
let teamMembers = [];

// Constantes para las claves del localStorage
const STORAGE_KEYS = {
    TASKS: 'evento_especial_tasks',
    NOTES: 'evento_especial_notes',
    IMAGES: 'evento_especial_images',
    TEAM_MEMBERS: 'evento_especial_team_members'
};

// Funciones para manejo de localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        alert('Error al guardar los datos. El almacenamiento local podría estar lleno.');
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        return [];
    }
}

function clearAllLocalStorage() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos almacenados? Esta acción no se puede deshacer.')) {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        initializeData();
        alert('Todos los datos han sido eliminados y la aplicación ha sido reiniciada.');
    }
}

// Función para inicializar los datos desde localStorage
function initializeData() {
    tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS);
    notes = loadFromLocalStorage(STORAGE_KEYS.NOTES);
    images = loadFromLocalStorage(STORAGE_KEYS.IMAGES);
    teamMembers = loadFromLocalStorage(STORAGE_KEYS.TEAM_MEMBERS);

    // Si no hay datos, agregar datos de ejemplo
    if (tasks.length === 0 && notes.length === 0 && teamMembers.length === 0) {
        loadExampleData();
    }

    // Renderizar todos los elementos
    renderTasks();
    renderNotes();
    renderImages();
    renderTeamMembers();
}

// Función para cargar datos de ejemplo
function loadExampleData() {
    // Tareas de ejemplo
    tasks = [

    ];

    // Miembros del equipo de ejemplo
    teamMembers = [

    ];

    // Nota de ejemplo
    notes = [

    ];

    // Guardar datos de ejemplo en localStorage
    saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
    saveToLocalStorage(STORAGE_KEYS.NOTES, notes);
    saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);
}

// Función para cambiar entre tabs
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Funciones para gestión de tareas
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const responsible = document.getElementById('taskResponsible').value;
    const supplies = document.getElementById('taskSupplies').value;

    if (title.trim() === '') {
        alert('Por favor ingresa un título para la tarea');
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        responsible: responsible || 'Sin asignar',
        supplies: supplies || 'No especificado',
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    tasks.push(task);
    saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
    renderTasks();

    // Limpiar campos
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskResponsible').value = '';
    document.getElementById('taskSupplies').value = '';
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    taskList.innerHTML = '';

    // Agregar botón para limpiar todas las tareas
    if (tasks.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.style.marginBottom = '20px';
        clearButton.innerHTML = `
            <button class="btn btn-small btn-danger" onclick="clearAllTasks()" style="float: right;">
                🗑️ Limpiar todas las tareas
            </button>
            <div style="clear: both;"></div>
        `;
        taskList.appendChild(clearButton);
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;

        taskElement.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-details">
                    👤 Responsable: ${task.responsible} | 
                    📦 Insumos: ${task.supplies} | 
                    📅 Creado: ${task.createdAt}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-small btn-success" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↩️ Reabrir' : '✅ Completar'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteTask(${task.id})">🗑️ Eliminar</button>
            </div>
        `;

        taskList.appendChild(taskElement);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
        renderTasks();
    }
}

function clearAllTasks() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las tareas?')) {
        tasks = [];
        saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
        renderTasks();
    }
}

// Funciones para gestión de notas
function addNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    if (title.trim() === '' || content.trim() === '') {
        alert('Por favor completa el título y contenido de la nota');
        return;
    }

    const note = {
        id: Date.now(),
        title: title,
        content: content,
        createdAt: new Date().toLocaleDateString()
    };

    notes.push(note);
    saveToLocalStorage(STORAGE_KEYS.NOTES, notes);
    renderNotes();

    // Limpiar campos
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    notesList.innerHTML = '';

    // Agregar botón para limpiar todas las notas
    if (notes.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.style.marginBottom = '20px';
        clearButton.innerHTML = `
            <button class="btn btn-small btn-danger" onclick="clearAllNotes()">
                🗑️ Limpiar todas las notas
            </button>
        `;
        notesList.appendChild(clearButton);
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';

        noteElement.innerHTML = `
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content}</div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: #856404;">
                📅 ${note.createdAt}
                <button class="btn btn-small btn-danger" style="float: right;" onclick="deleteNote(${note.id})">🗑️</button>
            </div>
        `;

        notesList.appendChild(noteElement);
    });
}

function deleteNote(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        notes = notes.filter(n => n.id !== id);
        saveToLocalStorage(STORAGE_KEYS.NOTES, notes);
        renderNotes();
    }
}

function clearAllNotes() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las notas?')) {
        notes = [];
        saveToLocalStorage(STORAGE_KEYS.NOTES, notes);
        renderNotes();
    }
}

// Funciones para gestión de imágenes
function handleImageUpload(event) {
    const files = event.target.files;

    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const image = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    src: e.target.result,
                    uploadedAt: new Date().toLocaleDateString()
                };
                images.push(image);
                saveToLocalStorage(STORAGE_KEYS.IMAGES, images);
                renderImages();
            };
            reader.readAsDataURL(file);
        }
    }
}

function renderImages() {
    const gallery = document.getElementById('imageGallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    // Agregar botón para limpiar todas las imágenes
    if (images.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.style.marginBottom = '20px';
        clearButton.innerHTML = `
            <button class="btn btn-small btn-danger" onclick="clearAllImages()">
                🗑️ Limpiar todas las imágenes
            </button>
        `;
        gallery.appendChild(clearButton);
    }

    images.forEach(image => {
        const imageElement = document.createElement('div');
        imageElement.className = 'image-item';

        imageElement.innerHTML = `
            <img src="${image.src}" alt="${image.name}">
            <div class="image-overlay">
                <button class="btn btn-small btn-danger" onclick="deleteImage('${image.id}')">🗑️ Eliminar</button>
            </div>
        `;

        gallery.appendChild(imageElement);
    });
}

function deleteImage(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        images = images.filter(img => img.id != id);
        saveToLocalStorage(STORAGE_KEYS.IMAGES, images);
        renderImages();
    }
}

function clearAllImages() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las imágenes?')) {
        images = [];
        saveToLocalStorage(STORAGE_KEYS.IMAGES, images);
        renderImages();
    }
}

// Funciones para gestión del equipo de cocina
function addTeamMember() {
    const name = document.getElementById('memberName').value;
    const role = document.getElementById('memberRole').value;

    if (name.trim() === '' || role.trim() === '') {
        alert('Por favor completa el nombre y rol del miembro');
        return;
    }

    const member = {
        id: Date.now(),
        name: name,
        role: role,
        status: 'pending',
        addedAt: new Date().toLocaleDateString()
    };

    teamMembers.push(member);
    saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);
    renderTeamMembers();

    // Limpiar campos
    document.getElementById('memberName').value = '';
    document.getElementById('memberRole').value = '';
}

function renderTeamMembers() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';

    // Agregar botón para limpiar todo el equipo
    if (teamMembers.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.style.marginBottom = '20px';
        clearButton.innerHTML = `
            <button class="btn btn-small btn-danger" onclick="clearAllTeamMembers()">
                🗑️ Limpiar todo el equipo
            </button>
        `;
        teamGrid.appendChild(clearButton);
    }

    teamMembers.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.className = 'team-member';

        const initial = member.name.charAt(0).toUpperCase();

        memberElement.innerHTML = `
            <div class="member-avatar">${initial}</div>
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.role}</div>
            <div class="member-status status-${member.status}">
                ${member.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pendiente'}
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-small btn-success" onclick="confirmMember(${member.id})">
                    ${member.status === 'confirmed' ? '↩️ Desconfirmar' : '✅ Confirmar'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteMember(${member.id})">🗑️</button>
            </div>
        `;

        teamGrid.appendChild(memberElement);
    });
}

function confirmMember(id) {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
        member.status = member.status === 'confirmed' ? 'pending' : 'confirmed';
        saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);
        renderTeamMembers();
    }
}

function deleteMember(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) {
        teamMembers = teamMembers.filter(m => m.id !== id);
        saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);
        renderTeamMembers();
    }
}

function clearAllTeamMembers() {
    if (confirm('¿Estás seguro de que quieres eliminar TODO el equipo?')) {
        teamMembers = [];
        saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);
        renderTeamMembers();
    }
}

// Funciones de utilidad para exportar/importar datos
function exportData() {
    const data = {
        tasks: tasks,
        notes: notes,
        teamMembers: teamMembers,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `evento_especial_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm('¿Estás seguro de que quieres importar estos datos? Esto reemplazará todos los datos actuales.')) {
                tasks = data.tasks || [];
                notes = data.notes || [];
                teamMembers = data.teamMembers || [];

                // Guardar en localStorage
                saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
                saveToLocalStorage(STORAGE_KEYS.NOTES, notes);
                saveToLocalStorage(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);

                // Renderizar todo
                renderTasks();
                renderNotes();
                renderImages();
                renderTeamMembers();

                alert('Datos importados exitosamente!');
            }
        } catch (error) {
            alert('Error al importar los datos. Asegúrate de que el archivo sea válido.');
        }
    };
    reader.readAsText(file);
}

// Función para mostrar estadísticas
function showStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.length - completedTasks;
    const confirmedMembers = teamMembers.filter(m => m.status === 'confirmed').length;
    const pendingMembers = teamMembers.length - confirmedMembers;

    const stats = `
📊 ESTADÍSTICAS DEL EVENTO ESPECIAL - DÍA 28

📋 TAREAS:
• Total: ${tasks.length}
• Completadas: ${completedTasks}
• Pendientes: ${pendingTasks}

📝 NOTAS: ${notes.length}

🖼️ IMÁGENES: ${images.length}

👥 EQUIPO DE COCINA:
• Total miembros: ${teamMembers.length}
• Confirmados: ${confirmedMembers}
• Pendientes: ${pendingMembers}

📅 Última actualización: ${new Date().toLocaleString()}
    `;

    alert(stats);
}

// Inicializar la aplicación cuando se carga la página
window.onload = function () {
    initializeData();

    // Agregar botones de utilidad si no existen
    addUtilityButtons();
};

function addUtilityButtons() {
    // Agregar botones de utilidad al header si no existen
    const header = document.querySelector('.header');
    if (header && !document.getElementById('utility-buttons')) {
        const utilityDiv = document.createElement('div');
        utilityDiv.id = 'utility-buttons';
        utilityDiv.style.marginTop = '20px';
        utilityDiv.innerHTML = `
            <button class="btn btn-small" onclick="showStats()" style="margin: 5px;">📊 Estadísticas</button>
            <button class="btn btn-small" onclick="exportData()" style="margin: 5px;">💾 Exportar Datos</button>
            <label for="importInput" class="btn btn-small" style="margin: 5px; cursor: pointer;">📁 Importar Datos</label>
            <input type="file" id="importInput" accept=".json" onchange="importData(event)" style="display: none;">
            <button class="btn btn-small btn-danger" onclick="clearAllLocalStorage()" style="margin: 5px;">🗑️ Limpiar Todo</button>
        `;
        header.appendChild(utilityDiv);
    }
}