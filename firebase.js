import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCttUv3Vj3agBo-cd6p_DJgbDiJsnDwfCI",
  authDomain: "flashcard-saas-f5a5b.firebaseapp.com",
  projectId: "flashcard-saas-f5a5b",
  storageBucket: "flashcard-saas-f5a5b.appspot.com",
  messagingSenderId: "1082865352072",
  appId: "1:1082865352072:web:2d4c6662dcfa7baa20ce3d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db; // You are exporting db as the default export
