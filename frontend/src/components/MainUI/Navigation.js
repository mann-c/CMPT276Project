import React from 'react'

import './Navigation.css';
import NavigationLinks from './NavigationLinks';

const Navigation = props => {
	return (
		<header className="navigation">
			<span className="navigation-title">
				Grababite
			</span>

			<span className="navigation-shoutout">
				<NavigationLinks />
			</span>
		</header>
	);
}

export default Navigation;