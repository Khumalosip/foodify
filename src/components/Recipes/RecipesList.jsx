import React, { useState } from 'react';

function RecipeList() {
	const [addrecipes, setAddrecipes] = useState(['Apple', 'Orange', 'Banana']);

	function handlerAddRecipes() {
		const newRecipe = document.getElementById('addrecipeInput').value;
		document.getElementById('addrecipeInput').value = '';

		setAddrecipes((a) => [...a, newRecipe]);
	}

	function handlerRemoveRecipe(index) {
		setAddrecipes(addrecipes.filter((_, i) => i !== index));
	}

	return (
		<div>
			<h2>List of Ingredients</h2>
			<ul>
				{addrecipes.map((addrecipe, index) => (
					<li key={index} onClick={() => handlerRemoveRecipe(index)}>
						{addrecipe}
					</li>
				))}
			</ul>
			,
			<input type="text" id="addrecipeInput" placeholder="Enter name of Recipe" />
			<button onClick={handlerAddRecipes}> Add Recipe </button>
		</div>
	);
}

export default RecipeList;
