import 'material-icons/iconfont/material-icons.css';

function Header() {
	return (
		<header className="header">
			<nav>
				<div className="header-bar">
					<h1 className="foodify-text"> Foodify</h1>

					<div search-container>
						<input type="text" id="search-input" placeholder="Search Recipes" />

						<button id="search-button"> Search</button>
					</div>

					<div className="header-menu">
						<div className="icons">
							<i className="material-icons">home</i>
							Home
						</div>

						<div className="icons">
							<i className="material-icons">favorite</i>
							Favorites
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}

export default Header;
