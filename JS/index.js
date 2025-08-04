// ===========================================
// CONFIGURACIÓN DE FIREBASE
// ===========================================

const firebaseConfig = {
    apiKey: "AIzaSyBsvR13ePYwscMAG1lruFNVKdh3bI0tudM",
    authDomain: "noteapp-e8a35.firebaseapp.com",
    projectId: "noteapp-e8a35",
    storageBucket: "noteapp-e8a35.firebasestorage.app",
    messagingSenderId: "185584012565",
    appId: "1:185584012565:web:42eb6d343e7153da092d1c"
};

// Variables globales
let tasks = [];
let notes = [];
let images = [];
let teamMembers = [];
let db = null;
let isOnline = false;
let currentUser = null;

// ===========================================
// INICIALIZACIÓN
// ===========================================

function initApp() {
    // Crear usuario
    currentUser = {
        id: localStorage.getItem('user_id') || 'user_' + Date.now(),
        name: localStorage.getItem('user_name') || 'Usuario Anónimo'
    };
    localStorage.setItem('user_id', currentUser.id);

    // Intentar conectar Firebase
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            isOnline = true;
            setupFirebaseListeners();
            console.log('🟢 Firebase conectado');
        } else {
            throw new Error('Firebase no disponible');
        }
    } catch (error) {
        console.log('🔴 Firebase no disponible, usando localStorage');
        isOnline = false;
        loadLocalData();
    }

    updateUI();
    setupButtons();
}

function setupFirebaseListeners() {
    // Tareas
    db.collection('tasks').onSnapshot(snapshot => {
        tasks = [];
        snapshot.forEach(doc => tasks.push({id: doc.id, ...doc.data()}));
        renderTasks();
    });

    // Notas
    db.collection('notes').onSnapshot(snapshot => {
        notes = [];
        snapshot.forEach(doc => notes.push({id: doc.id, ...doc.data()}));
        renderNotes();
    });

    // Equipo
    db.collection('team').onSnapshot(snapshot => {
        teamMembers = [];
        snapshot.forEach(doc => teamMembers.push({id: doc.id, ...doc.data()}));
        renderTeam();
    });

    // Imágenes
    db.collection('images').onSnapshot(snapshot => {
        images = [];
        snapshot.forEach(doc => images.push({id: doc.id, ...doc.data()}));
        renderImages();
    });
}

function loadLocalData() {
    tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    notes = JSON.parse(localStorage.getItem('notes') || '[]');
    teamMembers = JSON.parse(localStorage.getItem('team') || '[]');
    images = JSON.parse(localStorage.getItem('images') || '[]');
    
    renderTasks();
    renderNotes();
    renderTeam();
    renderImages();
}

function saveLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

async function saveFirebase(collection, item) {
    if (!isOnline) return;
    try {
        await db.collection(collection).doc(item.id.toString()).set(item);
    } catch (error) {
        console.error('Error guardando:', error);
    }
}

async function deleteFirebase(collection, id) {
    if (!isOnline) return;
    try {
        await db.collection(collection).doc(id.toString()).delete();
    } catch (error) {
        console.error('Error eliminando:', error);
    }
}

// ===========================================
// INTERFAZ DE USUARIO
// ===========================================

function openTab(evt, tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar pestaña activa
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function updateUI() {
    const status = document.getElementById('connection-status');
    const userInfo = document.getElementById('user-info');

    if (status) {
        status.className = `connection-status ${isOnline ? 'status-online' : 'status-offline'}`;
        status.innerHTML = isOnline ? 
            '🟢 Conectado - Datos sincronizados' : 
            '🔴 Modo local - Solo en este dispositivo';
    }

    if (userInfo) {
        userInfo.innerHTML = `
            👤 <strong>${currentUser.name}</strong>
            <button class="btn btn-small" onclick="changeName()">✏️ Cambiar</button>
        `;
    }
}

function changeName() {
    const newName = prompt('Tu nombre:', currentUser.name);
    if (newName && newName.trim()) {
        currentUser.name = newName.trim();
        localStorage.setItem('user_name', currentUser.name);
        updateUI();
    }
}

function setupButtons() {
    const header = document.querySelector('.header');
    if (!header || document.getElementById('utility-buttons')) return;

    const utilityDiv = document.createElement('div');
    utilityDiv.id = 'utility-buttons';
    utilityDiv.innerHTML = `
        <div id="connection-status" class="connection-status">🔄 Conectando...</div>
        <div id="user-info" class="user-info">👤 ${currentUser.name}</div>
        <div class="share-section">
            <h4>🔗 Compartir</h4>
            <button class="btn btn-small" onclick="shareLink()">📋 Copiar enlace</button>
        </div>
        <button class="btn btn-small" onclick="showStats()">📊 Estadísticas</button>
        <button class="btn btn-small" onclick="exportData()">💾 Exportar</button>
    `;
    header.appendChild(utilityDiv);
    updateUI();
}

// ===========================================
// TAREAS
// ===========================================

function addTask() {
    const title = document.getElementById('taskTitle').value;
    const responsible = document.getElementById('taskResponsible').value;
    const supplies = document.getElementById('taskSupplies').value;

    if (!title.trim()) {
        alert('Ingresa un título para la tarea');
        return;
    }

    const task = {
        id: Date.now(),
        title: title.trim(),
        responsible: responsible.trim() || 'Sin asignar',
        supplies: supplies.trim() || 'No especificado',
        completed: false,
        createdAt: new Date().toLocaleDateString(),
        createdBy: currentUser.name
    };

    if (isOnline) {
        saveFirebase('tasks', task);
    } else {
        tasks.push(task);
        saveLocal('tasks', tasks);
        renderTasks();
    }

    // Limpiar campos
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskResponsible').value = '';
    document.getElementById('taskSupplies').value = '';
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: #666; margin: 40px 0;">No hay tareas todavía. ¡Agrega la primera!</p>';
        return;
    }

    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-details">
                    👤 ${task.responsible} | 📦 ${task.supplies} | 📅 ${task.createdAt}
                    ${task.createdBy ? ` | 👤 Por: ${task.createdBy}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-small btn-success" onclick="toggleTask('${task.id}')">
                    ${task.completed ? '↩️ Reabrir' : '✅ Completar'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteTask('${task.id}')">🗑️</button>
            </div>
        `;
        taskList.appendChild(taskDiv);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id == id);
    if (!task) return;

    task.completed = !task.completed;
    task.modifiedBy = currentUser.name;

    if (isOnline) {
        saveFirebase('tasks', task);
    } else {
        saveLocal('tasks', tasks);
        renderTasks();
    }
}

function deleteTask(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;

    if (isOnline) {
        deleteFirebase('tasks', id);
    } else {
        tasks = tasks.filter(t => t.id != id);
        saveLocal('tasks', tasks);
        renderTasks();
    }
}

// ===========================================
// NOTAS
// ===========================================

function addNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    if (!title.trim() || !content.trim()) {
        alert('Completa título y contenido');
        return;
    }

    const note = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toLocaleDateString(),
        createdBy: currentUser.name
    };

    if (isOnline) {
        saveFirebase('notes', note);
    } else {
        notes.push(note);
        saveLocal('notes', notes);
        renderNotes();
    }

    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: #666; margin: 40px 0;">No hay notas todavía. ¡Agrega la primera!</p>';
        return;
    }

    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content}</div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: #856404;">
                📅 ${note.createdAt} ${note.createdBy ? `| 👤 ${note.createdBy}` : ''}
                <button class="btn btn-small btn-danger" style="float: right;" onclick="deleteNote('${note.id}')">🗑️</button>
            </div>
        `;
        notesList.appendChild(noteDiv);
    });
}

function deleteNote(id) {
    if (!confirm('¿Eliminar esta nota?')) return;

    if (isOnline) {
        deleteFirebase('notes', id);
    } else {
        notes = notes.filter(n => n.id != id);
        saveLocal('notes', notes);
        renderNotes();
    }
}

// ===========================================
// IMÁGENES
// ===========================================

function handleImageUpload(event) {
    const files = event.target.files;

    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            const image = {
                id: Date.now() + Math.random(),
                name: file.name,
                src: e.target.result,
                uploadedAt: new Date().toLocaleDateString(),
                uploadedBy: currentUser.name
            };

            if (isOnline) {
                saveFirebase('images', image);
            } else {
                images.push(image);
                saveLocal('images', images);
                renderImages();
            }
        };
        reader.readAsDataURL(file);
    }
}

function renderImages() {
    const gallery = document.getElementById('imageGallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    if (images.length === 0) {
        gallery.innerHTML = '<p style="text-align: center; color: #666; margin: 40px 0;">No hay imágenes todavía. ¡Sube la primera!</p>';
        return;
    }

    images.forEach(image => {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-item';
        imageDiv.innerHTML = `
            <img src="${image.src}" alt="${image.name}">
            <div class="image-overlay">
                <small>${image.uploadedBy ? `Por: ${image.uploadedBy}` : ''}</small>
                <button class="btn btn-small btn-danger" onclick="deleteImage('${image.id}')">🗑️</button>
            </div>
        `;
        gallery.appendChild(imageDiv);
    });
}

function deleteImage(id) {
    if (!confirm('¿Eliminar esta imagen?')) return;

    if (isOnline) {
        deleteFirebase('images', id);
    } else {
        images = images.filter(img => img.id != id);
        saveLocal('images', images);
        renderImages();
    }
}

// ===========================================
// EQUIPO DE COCINA
// ===========================================

function addTeamMember() {
    const name = document.getElementById('memberName').value;
    const role = document.getElementById('memberRole').value;

    if (!name.trim() || !role.trim()) {
        alert('Completa nombre y rol');
        return;
    }

    const member = {
        id: Date.now(),
        name: name.trim(),
        role: role.trim(),
        status: 'pending',
        addedAt: new Date().toLocaleDateString(),
        addedBy: currentUser.name
    };

    if (isOnline) {
        saveFirebase('team', member);
    } else {
        teamMembers.push(member);
        saveLocal('team', teamMembers);
        renderTeam();
    }

    document.getElementById('memberName').value = '';
    document.getElementById('memberRole').value = '';
}

function renderTeam() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';

    if (teamMembers.length === 0) {
        teamGrid.innerHTML = '<p style="text-align: center; color: #666; margin: 40px 0; grid-column: 1/-1;">No hay miembros todavía. ¡Agrega el primero!</p>';
        return;
    }

    teamMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        memberDiv.innerHTML = `
            <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.role}</div>
            <div class="member-status status-${member.status}">
                ${member.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pendiente'}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; text-align: center;">
                <small>${member.addedBy ? `Por: ${member.addedBy}` : ''}</small>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-small btn-success" onclick="confirmMember('${member.id}')">
                    ${member.status === 'confirmed' ? '↩️ Pendiente' : '✅ Confirmar'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteMember('${member.id}')">🗑️</button>
            </div>
        `;
        teamGrid.appendChild(memberDiv);
    });
}

function confirmMember(id) {
    const member = teamMembers.find(m => m.id == id);
    if (!member) return;

    member.status = member.status === 'confirmed' ? 'pending' : 'confirmed';
    member.modifiedBy = currentUser.name;

    if (isOnline) {
        saveFirebase('team', member);
    } else {
        saveLocal('team', teamMembers);
        renderTeam();
    }
}

function deleteMember(id) {
    if (!confirm('¿Eliminar este miembro?')) return;

    if (isOnline) {
        deleteFirebase('team', id);
    } else {
        teamMembers = teamMembers.filter(m => m.id != id);
        saveLocal('team', teamMembers);
        renderTeam();
    }
}

// ===========================================
// UTILIDADES
// ===========================================

function showStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const confirmedMembers = teamMembers.filter(m => m.status === 'confirmed').length;

    alert(`📊 ESTADÍSTICAS DEL EVENTO

🌐 ${isOnline ? 'EN LÍNEA - Datos compartidos' : 'MODO LOCAL - Solo en este dispositivo'}

📋 TAREAS: ${tasks.length} (${completedTasks} completadas)
📝 NOTAS: ${notes.length}
🖼️ IMÁGENES: ${images.length}
👥 EQUIPO: ${teamMembers.length} (${confirmedMembers} confirmados)

👤 Usuario: ${currentUser.name}
📅 ${new Date().toLocaleString()}`);
}

function exportData() {
    const data = {
        tasks,
        notes,
        teamMembers,
        images: images.map(img => ({...img, src: 'imagen-exportada'})), // No exportar base64
        exportDate: new Date().toISOString(),
        exportedBy: currentUser.name
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `evento-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function shareLink() {
    const link = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            alert('¡Link copiado! Compártelo con tu equipo.');
        });
    } else {
        prompt('Copia este link:', link);
    }
}

// ===========================================
// INICIO
// ===========================================

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}