import { createContext } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    isUser: false,
    login: () => {}, 
    logout: () => {}
});

/** USING authcontext guide
 *  import React, { useContext } from 'react';
 *  
 * INSIDE LOGIN
 *  const auth = useContext(AuthContext);
 * 
 *  < Login logic >
 *  < Get confirmation from server >
 * 
 *  auth.login(true); TRUE for user login, FALSE for restaurant login
 *      change this if u think of a better data type
 */