
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
      apiKey: "AIzaSyBwHJi626w0zC1lSc4u1DwxgdcP9iqpNmU",
      authDomain: "projecte-smx.firebaseapp.com",
      projectId: "projecte-smx",
      storageBucket: "projecte-smx.firebasestorage.app",
      messagingSenderId: "525444233430",
      appId: "1:525444233430:web:ffd0c29181828940607177",
      measurementId: "G-ZMVTHMK0ZL"
    };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


const commentInput = document.getElementById('commentInput');
const sendBtn = document.getElementById('sendBtn');
const commentsList = document.getElementById('commentsList');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        commentInput.placeholder = `Escriu un comentari com a ${user.email}...`;
        sendBtn.disabled = false;
    } else {
        currentUser = null;
        commentInput.placeholder = "Inicia sessió per comentar";
        sendBtn.disabled = true; 
    }
});

sendBtn.addEventListener('click', async () => {
    const text = commentInput.value.trim();
    
 
    if (text === "") return;
    if (!currentUser) {
        alert("Has d'iniciar sessió!"); 
        return;
    }

    try {
       
        await addDoc(collection(db, "comentarios"), {
            gameId: GAME_ID,
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0], 
            text: text,
            timestamp: serverTimestamp() 
        });

        commentInput.value = ""; 
    } catch (e) {
        console.error("Error al publicar: ", e);
        alert("Error al enviar el comentari");
    }
});


const q = query(
    collection(db, "comentarios"), 
    where("gameId", "==", GAME_ID),
    orderBy("timestamp", "desc") 
);

onSnapshot(q, (snapshot) => {
    commentsList.innerHTML = ""; 

    snapshot.forEach((doc) => {
        const data = doc.data();
        

        const card = document.createElement('div');
        card.className = "comment-card";
        

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