// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - replace with your own config
const firebaseConfig = {
	apiKey: 'AIzaSyD7A5tSpG2np88-Lqmi05foMedOD_akqms',
	authDomain: 'foodify-5f94b.firebaseapp.com',
	projectId: 'foodify-5f94b',
	storageBucket: 'foodify-5f94b.firebasestorage.com',
	messagingSenderId: '147656640420',
	appId: '1:147656640420:web:f36db04503e85ad9a4a331',
	measurementId: 'G-K5NEDEGRXW',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
