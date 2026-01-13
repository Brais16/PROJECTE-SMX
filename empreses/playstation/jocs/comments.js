// IMPORTAR FIREBASE (Usando versión modular v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- TU CONFIGURACIÓN DE FIREBASE (CÓPIALA DE LA CONSOLA DE FIREBASE) ---
const firebaseConfig = {
      apiKey: "AIzaSyBwHJi626w0zC1lSc4u1DwxgdcP9iqpNmU",
      authDomain: "projecte-smx.firebaseapp.com",
      projectId: "projecte-smx",
      storageBucket: "projecte-smx.firebasestorage.app",
      messagingSenderId: "525444233430",
      appId: "1:525444233430:web:ffd0c29181828940607177",
      measurementId: "G-ZMVTHMK0ZL"
    };

// Inicializar
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias del DOM
const commentInput = document.getElementById('commentInput');
const sendBtn = document.getElementById('sendBtn');
const commentsList = document.getElementById('commentsList');

// Variable para el usuario actual
let currentUser = null;

// 1. DETECTAR SI EL USUARIO ESTÁ LOGUEADO
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        commentInput.placeholder = `Escriu un comentari com a ${user.email}...`;
        sendBtn.disabled = false;
    } else {
        currentUser = null;
        commentInput.placeholder = "Inicia sessió per comentar";
        sendBtn.disabled = true; // Bloqueamos el botón si no hay login
    }
});

// 2. FUNCIÓN PARA ENVIAR COMENTARIO
sendBtn.addEventListener('click', async () => {
    const text = commentInput.value.trim();
    
    // Validación básica
    if (text === "") return;
    if (!currentUser) {
        alert("Has d'iniciar sessió!"); 
        return;
    }

    try {
        // Guardamos en la colección "comentarios"
        await addDoc(collection(db, "comentarios"), {
            gameId: GAME_ID, // Variable definida en el HTML
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0], // Usamos la parte antes del @ como nick
            text: text,
            timestamp: serverTimestamp() // Hora del servidor
        });

        commentInput.value = ""; // Limpiar input
    } catch (e) {
        console.error("Error al publicar: ", e);
        alert("Error al enviar el comentari");
    }
});

// 3. LEER COMENTARIOS EN TIEMPO REAL (La magia de Firebase)
// Solo queremos los comentarios DE ESTE JUEGO (GAME_ID)
const q = query(
    collection(db, "comentarios"), 
    where("gameId", "==", GAME_ID),
    orderBy("timestamp", "desc") // Ordenar del más nuevo al más viejo
);

// onSnapshot escucha cambios en la base de datos automáticamente
onSnapshot(q, (snapshot) => {
    commentsList.innerHTML = ""; // Limpiar lista antes de repintar

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Crear el HTML de cada comentario
        const card = document.createElement('div');
        card.className = "comment-card";
        
        // Formatear fecha (si existe, al principio puede ser null por latencia)
        let dateStr = "Ara mateix";
        if (data.timestamp) {
            dateStr = data.timestamp.toDate().toLocaleDateString() + ' ' + data.timestamp.toDate().toLocaleTimeString();
        }

        card.innerHTML = `
            <div class="comment-header">
                <span class="comment-user">${data.userName}</span>
                <span class="comment-date">${dateStr}</span>
            </div>
            <p class="comment-text">${data.text}</p>
        `;

        commentsList.appendChild(card);
    });
});