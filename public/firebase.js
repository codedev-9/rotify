import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDW8Tf1ubpf-UfhIMiByHQ7el787sgynjc",
  authDomain: "rotify-72e6d.firebaseapp.com",
  projectId: "rotify-72e6d",
  storageBucket: "rotify-72e6d.firebasestorage.app",
  messagingSenderId: "284936245033",
  appId: "1:284936245033:web:aa5ad067356d2469e6b138"
};

const app = initializeApp(firebaseConfig);

// Attach Firestore to window so other scripts can use it
window.db = getFirestore(app);