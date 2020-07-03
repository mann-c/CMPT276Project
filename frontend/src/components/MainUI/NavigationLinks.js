import React from 'react'
import { NavLink } from 'react-router-dom'

import './NavigationLinks.css';

const NavigationLinks = props => {
    return  (
        <ul className="navigation-links">
            <li>
                <NavLink to="/feed/1">FEED 1</NavLink>
            </li>
            <li>
                <NavLink to="/feed/2">FEED 2</NavLink>
            </li>
            {/*<li>
                <NavLink to="/explore">EXPLORE</NavLink>
            </li>
            <li>
                <NavLink to="/recents">RECENTS</NavLink>
            </li>*/}
        </ul>
    );
}

export default NavigationLinks;