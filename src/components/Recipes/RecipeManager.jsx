// src/components/RecipeManager.jsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

function RecipeManager() {
	// User authentication state
	const [user, setUser] = useState(null);
	const [authForm, setAuthForm] = useState({
		email: '',
		password: '',
		isLogin: true,
	});
	const [authError, setAuthError] = useState('');

	// Recipe states
	const [recipes, setRecipes] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [showFavorites, setShowFavorites] = useState(true);

	// Selected recipe for editing
	const [selectedRecipe, setSelectedRecipe] = useState(null);

	// New recipe form
	const [newRecipe, setNewRecipe] = useState({
		name: '',
		cooktime: 1,
		ingredients: '',
		directions: '',
		discoveryYear: new Date().getFullYear(),
		founder: '',
		type: '',
		isFavorite: false,
	});

	// Check authentication state on component mount
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			if (currentUser) {
				// Load user's recipes
				loadUserRecipes(currentUser.uid);
			} else {
				// Clear recipes when logged out
				setRecipes([]);
				setFavorites([]);
			}
		});

		return () => unsubscribe();
	}, []);

	// Load user recipes from Firestore
	const loadUserRecipes = async (userId) => {
		try {
			const recipesRef = collection(db, 'users', userId, 'recipes');
			const querySnapshot = await getDocs(recipesRef);

			const recipesList = [];
			const favoritesList = [];

			querySnapshot.forEach((doc) => {
				const recipe = { id: doc.id, ...doc.data() };
				recipesList.push(recipe);

				if (recipe.isFavorite) {
					favoritesList.push(recipe);
				}
			});

			setRecipes(recipesList);
			setFavorites(favoritesList);
		} catch (error) {
			console.error('Error loading recipes:', error);
		}
	};

	// Auth form handlers
	const handleAuthInputChange = (e) => {
		setAuthForm({ ...authForm, [e.target.name]: e.target.value });
	};

	const toggleAuthMode = () => {
		setAuthForm({ ...authForm, isLogin: !authForm.isLogin });
		setAuthError('');
	};

	const handleAuth = async (e) => {
		e.preventDefault();
		setAuthError('');

		try {
			if (authForm.isLogin) {
				// Login
				await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
			} else {
				// Register
				await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
			}
			// Reset form
			setAuthForm({ email: '', password: '', isLogin: true });
		} catch (error) {
			setAuthError(error.message);
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	// Recipe handlers
	const handleNewRecipeChange = (field, value) => {
		setNewRecipe((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSelectedRecipeChange = (field, value) => {
		setSelectedRecipe((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleAddRecipe = async () => {
		if (!user) return;
		if (newRecipe.name.trim() === '') {
			alert('Please provide a recipe name');
			return;
		}

		try {
			// Add to Firestore
			const recipeRef = doc(collection(db, 'users', user.uid, 'recipes'));
			const newRecipeData = { ...newRecipe, createdAt: new Date() };

			await setDoc(recipeRef, newRecipeData);

			const newRecipeWithId = { id: recipeRef.id, ...newRecipeData };

			// Update local state
			setRecipes((prev) => [...prev, newRecipeWithId]);

			if (newRecipeData.isFavorite) {
				setFavorites((prev) => [...prev, newRecipeWithId]);
			}

			// Reset form
			setNewRecipe({
				name: '',
				cooktime: 1,
				ingredients: '',
				directions: '',
				discoveryYear: new Date().getFullYear(),
				founder: '',
				type: '',
				isFavorite: false,
			});
		} catch (error) {
			console.error('Error adding recipe:', error);
		}
	};

	const handleUpdateRecipe = async () => {
		if (!user || !selectedRecipe) return;

		try {
			// Update in Firestore
			const recipeRef = doc(db, 'users', user.uid, 'recipes', selectedRecipe.id);
			await updateDoc(recipeRef, selectedRecipe);

			// Update local state
			setRecipes((prev) => prev.map((recipe) => (recipe.id === selectedRecipe.id ? selectedRecipe : recipe)));

			// Update favorites if needed
			if (selectedRecipe.isFavorite) {
				setFavorites((prev) => {
					const exists = prev.some((fav) => fav.id === selectedRecipe.id);
					if (exists) {
						return prev.map((fav) => (fav.id === selectedRecipe.id ? selectedRecipe : fav));
					} else {
						return [...prev, selectedRecipe];
					}
				});
			} else {
				setFavorites((prev) => prev.filter((fav) => fav.id !== selectedRecipe.id));
			}

			alert('Recipe updated successfully!');
		} catch (error) {
			console.error('Error updating recipe:', error);
		}
	};

	const handleRemoveRecipe = async (id) => {
		if (!user) return;

		try {
			// Delete from Firestore
			await deleteDoc(doc(db, 'users', user.uid, 'recipes', id));

			// Update local state
			setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
			setFavorites((prev) => prev.filter((recipe) => recipe.id !== id));

			// If the deleted recipe was selected, clear selection
			if (selectedRecipe && selectedRecipe.id === id) {
				setSelectedRecipe(null);
			}
		} catch (error) {
			console.error('Error deleting recipe:', error);
		}
	};

	const handleToggleFavorite = async (recipe) => {
		if (!user) return;

		const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };

		try {
			// Update in Firestore
			const recipeRef = doc(db, 'users', user.uid, 'recipes', recipe.id);
			await updateDoc(recipeRef, { isFavorite: updatedRecipe.isFavorite });

			// Update local state
			setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? updatedRecipe : r)));

			if (updatedRecipe.isFavorite) {
				setFavorites((prev) => [...prev, updatedRecipe]);
			} else {
				setFavorites((prev) => prev.filter((fav) => fav.id !== recipe.id));
			}

			// Update selected recipe if this is the one being edited
			if (selectedRecipe && selectedRecipe.id === recipe.id) {
				setSelectedRecipe(updatedRecipe);
			}
		} catch (error) {
			console.error('Error updating favorite status:', error);
		}
	};

	const handleSelectRecipe = (recipe) => {
		setSelectedRecipe(recipe);
	};

	// Render a single recipe card
	function RecipeCard({ recipe }) {
		return (
			<div
				className="recipe-card"
				style={{
					border: '1px solid #ddd',
					borderRadius: '8px',
					padding: '15px',
					margin: '10px',
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					width: '300px',
					cursor: 'pointer',
					backgroundColor: selectedRecipe && selectedRecipe.id === recipe.id ? '#f0f8ff' : 'white',
					position: 'relative',
				}}
				onClick={() => handleSelectRecipe(recipe)}
			>
				<h3 style={{ marginTop: 0 }}>{recipe.name}</h3>
				<div style={{ marginBottom: '10px' }}>
					<div>
						<strong>Cook Time:</strong> {recipe.cooktime} hours
					</div>
					<div>
						<strong>Type:</strong> {recipe.type}
					</div>
					<div>
						<strong>Year:</strong> {recipe.discoveryYear}
					</div>
					<div>
						<strong>Founder:</strong> {recipe.founder}
					</div>
				</div>

				<div style={{ fontSize: '0.9em', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
					<strong>Ingredients:</strong> {recipe.ingredients.substring(0, 100)}
					{recipe.ingredients.length > 100 && '...'}
				</div>

				<div
					style={{
						position: 'absolute',
						top: '10px',
						right: '10px',
						display: 'flex',
						gap: '5px',
					}}
				>
					{/* Favorite button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleToggleFavorite(recipe);
						}}
						style={{
							backgroundColor: recipe.isFavorite ? '#FFD700' : '#f8f8f8',
							color: recipe.isFavorite ? '#000' : '#666',
							border: '1px solid #ddd',
							borderRadius: '50%',
							width: '30px',
							height: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							fontSize: '16px',
						}}
					>
						★
					</button>

					{/* Delete button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleRemoveRecipe(recipe.id);
						}}
						style={{
							backgroundColor: '#f44336',
							color: 'white',
							border: 'none',
							borderRadius: '50%',
							width: '30px',
							height: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							fontSize: '16px',
						}}
					>
						×
					</button>
				</div>
			</div>
		);
	}

	// If not logged in, show auth form
	if (!user) {
		return (
			<div
				style={{
					maxWidth: '400px',
					margin: '40px auto',
					padding: '20px',
					boxShadow: '0 0 10px rgba(0,0,0,0.1)',
					borderRadius: '8px',
				}}
			>
				<h1 style={{ textAlign: 'center' }}>Recipe Manager</h1>
				<h2>{authForm.isLogin ? 'Login' : 'Create Account'}</h2>

				{authError && <div style={{ color: 'red', marginBottom: '15px' }}>{authError}</div>}

				<form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
					<input
						type="email"
						name="email"
						placeholder="Email"
						value={authForm.email}
						onChange={handleAuthInputChange}
						required
						style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						value={authForm.password}
						onChange={handleAuthInputChange}
						required
						style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<button
						type="submit"
						style={{
							backgroundColor: '#4CAF50',
							color: 'white',
							padding: '12px',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '16px',
						}}
					>
						{authForm.isLogin ? 'Login' : 'Create Account'}
					</button>
				</form>

				<p style={{ textAlign: 'center', marginTop: '15px' }}>
					{authForm.isLogin ? "Don't have an account? " : 'Already have an account? '}
					<button
						onClick={toggleAuthMode}
						style={{
							background: 'none',
							border: 'none',
							color: '#2196F3',
							cursor: 'pointer',
							fontSize: '16px',
						}}
					>
						{authForm.isLogin ? 'Sign Up' : 'Login'}
					</button>
				</p>
			</div>
		);
	}

	// Main recipe manager UI for logged in users
	return (
		<div
			style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
		>
			<div
				style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
			>
				<h1>Recipe Manager</h1>
				<div>
					<span style={{ marginRight: '10px' }}>Logged in as: {user.email}</span>
					<button
						onClick={handleLogout}
						style={{
							backgroundColor: '#f44336',
							color: 'white',
							padding: '8px 15px',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Logout
					</button>
				</div>
			</div>

			{/* View toggle */}
			<div style={{ marginBottom: '20px' }}>
				<button
					onClick={() => setShowFavorites(false)}
					style={{
						backgroundColor: !showFavorites ? '#2196F3' : '#f1f1f1',
						color: !showFavorites ? 'white' : '#333',
						padding: '8px 15px',
						border: 'none',
						borderRadius: '4px 0 0 4px',
						cursor: 'pointer',
					}}
				>
					All Recipes ({recipes.length})
				</button>
				<button
					onClick={() => setShowFavorites(true)}
					style={{
						backgroundColor: showFavorites ? '#2196F3' : '#f1f1f1',
						color: showFavorites ? 'white' : '#333',
						padding: '8px 15px',
						border: 'none',
						borderRadius: '0 4px 4px 0',
						cursor: 'pointer',
					}}
				>
					Favorites ({favorites.length})
				</button>
			</div>

			{/* Selected Recipe Details (if any) */}
			{selectedRecipe && (
				<div
					className="selected-recipe-card"
					style={{
						border: '1px solid #ddd',
						borderRadius: '8px',
						padding: '20px',
						marginBottom: '20px',
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						backgroundColor: '#f9f9f9',
					}}
				>
					<h2 className="card-title">
						{selectedRecipe.name}
						<button
							onClick={() => handleToggleFavorite(selectedRecipe)}
							style={{
								backgroundColor: 'transparent',
								border: 'none',
								cursor: 'pointer',
								fontSize: '24px',
								color: selectedRecipe.isFavorite ? '#FFD700' : '#ccc',
								marginLeft: '10px',
							}}
						>
							★
						</button>
					</h2>
					<div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
						<span>
							<strong>Cook Time:</strong> {selectedRecipe.cooktime} hours
						</span>
						<span>
							<strong>Type:</strong> {selectedRecipe.type}
						</span>
						<span>
							<strong>Year:</strong> {selectedRecipe.discoveryYear}
						</span>
						<span>
							<strong>Founder:</strong> {selectedRecipe.founder}
						</span>
					</div>
					<div>
						<h3>Ingredients:</h3>
						<p>{selectedRecipe.ingredients}</p>
					</div>
					<div>
						<h3>Directions:</h3>
						<p>{selectedRecipe.directions}</p>
					</div>
				</div>
			)}

			{/* Recipe Gallery */}
			<h2>{showFavorites ? 'Favorite Recipes' : 'All Recipes'}</h2>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '15px',
					justifyContent: 'flex-start',
					marginBottom: '30px',
				}}
			>
				{(showFavorites ? favorites : recipes).length === 0 ? (
					<div style={{ padding: '20px', color: '#666' }}>
						{showFavorites
							? 'No favorite recipes yet. Add some by clicking the star icon!'
							: 'No recipes in your collection yet. Add one using the form below!'}
					</div>
				) : (
					(showFavorites ? favorites : recipes).map((recipe) => (
						<RecipeCard key={recipe.id} recipe={recipe} />
					))
				)}
			</div>

			{/* Edit Selected Recipe (if any) */}
			{selectedRecipe && (
				<div style={{ marginBottom: '30px' }}>
					<h2>Edit Recipe</h2>
					<div style={{ display: 'grid', gap: '10px' }}>
						<input
							type="text"
							placeholder="Recipe Name"
							value={selectedRecipe.name}
							onChange={(e) => handleSelectedRecipeChange('name', e.target.value)}
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<input
							type="number"
							placeholder="Cook Time (hours)"
							value={selectedRecipe.cooktime}
							onChange={(e) => handleSelectedRecipeChange('cooktime', parseInt(e.target.value) || 1)}
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<input
							type="text"
							placeholder="Recipe Type"
							value={selectedRecipe.type}
							onChange={(e) => handleSelectedRecipeChange('type', e.target.value)}
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<input
							type="number"
							placeholder="Discovery Year"
							value={selectedRecipe.discoveryYear}
							onChange={(e) =>
								handleSelectedRecipeChange(
									'discoveryYear',
									parseInt(e.target.value) || new Date().getFullYear()
								)
							}
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<input
							type="text"
							placeholder="Founder"
							value={selectedRecipe.founder}
							onChange={(e) => handleSelectedRecipeChange('founder', e.target.value)}
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<textarea
							placeholder="Ingredients"
							value={selectedRecipe.ingredients}
							onChange={(e) => handleSelectedRecipeChange('ingredients', e.target.value)}
							rows="3"
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<textarea
							placeholder="Directions"
							value={selectedRecipe.directions}
							onChange={(e) => handleSelectedRecipeChange('directions', e.target.value)}
							rows="4"
							style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
						<div>
							<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
								<input
									type="checkbox"
									checked={selectedRecipe.isFavorite}
									onChange={(e) => handleSelectedRecipeChange('isFavorite', e.target.checked)}
									style={{ marginRight: '8px' }}
								/>
								Add to Favorites
							</label>
						</div>
						<button
							onClick={handleUpdateRecipe}
							style={{
								backgroundColor: '#2196F3',
								color: 'white',
								padding: '10px',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Update Recipe
						</button>
					</div>
				</div>
			)}

			{/* Add New Recipe */}
			<div style={{ marginBottom: '30px' }}>
				<h2>Add New Recipe</h2>
				<div style={{ display: 'grid', gap: '10px' }}>
					<input
						type="text"
						placeholder="Recipe Name"
						value={newRecipe.name}
						onChange={(e) => handleNewRecipeChange('name', e.target.value)}
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<input
						type="number"
						placeholder="Cook Time (hours)"
						value={newRecipe.cooktime}
						onChange={(e) => handleNewRecipeChange('cooktime', parseInt(e.target.value) || 1)}
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<input
						type="text"
						placeholder="Recipe Type"
						value={newRecipe.type}
						onChange={(e) => handleNewRecipeChange('type', e.target.value)}
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<input
						type="number"
						placeholder="Discovery Year"
						value={newRecipe.discoveryYear}
						onChange={(e) =>
							handleNewRecipeChange('discoveryYear', parseInt(e.target.value) || new Date().getFullYear())
						}
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<input
						type="text"
						placeholder="Founder"
						value={newRecipe.founder}
						onChange={(e) => handleNewRecipeChange('founder', e.target.value)}
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<textarea
						placeholder="Ingredients"
						value={newRecipe.ingredients}
						onChange={(e) => handleNewRecipeChange('ingredients', e.target.value)}
						rows="3"
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<textarea
						placeholder="Directions"
						value={newRecipe.directions}
						onChange={(e) => handleNewRecipeChange('directions', e.target.value)}
						rows="4"
						style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
					/>
					<div>
						<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
							<input
								type="checkbox"
								checked={newRecipe.isFavorite}
								onChange={(e) => handleNewRecipeChange('isFavorite', e.target.checked)}
								style={{ marginRight: '8px' }}
							/>
							Add to Favorites
						</label>
					</div>
					<button
						onClick={handleAddRecipe}
						style={{
							backgroundColor: '#4CAF50',
							color: 'white',
							padding: '10px',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Add Recipe
					</button>
				</div>
			</div>
		</div>
	);
}

export default RecipeManager;
