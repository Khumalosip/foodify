# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

 Recipe Manager

The RecipeManager is a React component that enables authenticated users to manage a collection of recipes using Firebase Authentication and Firestore. Users can add, edit, delete, and favorite recipes with a sleek and functional UI.
🔧 Features

    🔐 User authentication (sign up, log in, and logout) via Firebase Auth

    🧾 Add, edit, and delete recipes stored in Firestore

    ⭐ Mark recipes as favorites

    📑 Display and filter recipes (all or favorites)

    ☁️ Real-time sync with Firebase Firestore

📁 File Structure

/src
  /components
    RecipeManager.jsx
/firebase
  config.js         # Firebase app configuration

🚀 Setup Instructions
1. Clone the Repository

git clone https://github.com/yourusername/recipe-manager.git
cd recipe-manager

2. Install Dependencies

npm install

3. Configure Firebase

Create a firebase/config.js file and add your Firebase configuration:

// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

🧪 Usage

    Import and use the RecipeManager component in your app:

import RecipeManager from './components/RecipeManager';

function App() {
  return (
    <div>
      <h1>My Recipe App</h1>
      <RecipeManager />
    </div>
  );
}

export default App;

    Start your development server:

npm start

🧠 State Management

The component manages the following state:

    user: The authenticated user.

    recipes: List of all user recipes.

    favorites: Filtered list of favorite recipes.

    selectedRecipe: The currently selected recipe for editing.

    newRecipe: Data for adding a new recipe.

    authForm: Controls the login/register form.

    authError: Displays authentication errors.

💡 Key Functions

    handleAuth: Registers or logs in the user.

    loadUserRecipes: Fetches recipes from Firestore.

    handleAddRecipe: Adds a new recipe.

    handleUpdateRecipe: Updates the selected recipe.

    handleRemoveRecipe: Deletes a recipe.

    handleToggleFavorite: Toggles favorite status.

    handleSelectRecipe: Sets the selected recipe for editing.

📬 Feedback & Contribution

Contributions, suggestions, and pull requests are welcome! If you encounter bugs or want to enhance the project, feel free to fork it and submit your changes.
