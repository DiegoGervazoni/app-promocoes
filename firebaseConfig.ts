// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZVeHFbgr7bKO6EcRqu_qRM3ZtwpyRlvs",
  authDomain: "apppromocoes.firebaseapp.com",
  projectId: "apppromocoes",
  storageBucket: "apppromocoes.appspot.com",
  messagingSenderId: "789256830497",
  appId: "1:789256830497:web:4ed236e3f6fc704dd92d60"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

