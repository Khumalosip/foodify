// src/firebase/firebase-service.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';

// Authentication services
export const authService = {
	// Register a new user
	registerUser: (email, password) => {
		return createUserWithEmailAndPassword(auth, email, password);
	},

	// Sign in an existing user
	loginUser: (email, password) => {
		return signInWithEmailAndPassword(auth, email, password);
	},

	// Sign out
	logoutUser: () => {
		return signOut(auth);
	},

	// Get current user
	getCurrentUser: () => {
		return auth.currentUser;
	},

	// Listen for auth state changes
	onAuthStateChanged: (callback) => {
		return onAuthStateChanged(auth, callback);
	},
};

// Recipe services
export const recipeService = {
	// Get all recipes for a user
	getUserRecipes: async (userId) => {
		const recipesRef = collection(db, 'users', userId, 'recipes');
		const querySnapshot = await getDocs(recipesRef);

		const recipes = [];
		querySnapshot.forEach((doc) => {
			recipes.push({ id: doc.id, ...doc.data() });
		});

		return recipes;
	},

	// Add a new recipe
	addRecipe: async (userId, recipeData) => {
		const recipeRef = doc(collection(db, 'users', userId, 'recipes'));
		await setDoc(recipeRef, { ...recipeData, createdAt: new Date() });
		return { id: recipeRef.id, ...recipeData, createdAt: new Date() };
	},

	// Update an existing recipe
	updateRecipe: async (userId, recipeId, recipeData) => {
		const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
		await updateDoc(recipeRef, recipeData);
		return { id: recipeId, ...recipeData };
	},

	// Delete a recipe
	deleteRecipe: async (userId, recipeId) => {
		const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
		await deleteDoc(recipeRef);
		return recipeId;
	},

	// Update favorite status
	updateFavoriteStatus: async (userId, recipeId, isFavorite) => {
		const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
		await updateDoc(recipeRef, { isFavorite });
		return { recipeId, isFavorite };
	},
};
