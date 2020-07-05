import React, {useState, useCallback} from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Navigation from './components/MainUI/Navigation';
import Feed from './pages/Feed';
import logo from './logo.svg';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const login = useCallback((userBool) => {
    setIsLoggedIn(true);
    setIsUser(userBool);
  }, []);
  
  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  /**Conditional logic for isLoggedIn state goes here */

  return (
    <AuthContext.Provider 
      value={{isLoggedIn: isLoggedIn, isUser: isUser, login: login, logout:logout}}
    >
    <Router>
      <Navigation />
      <main>
      <Switch>
          <Route path="/feed/:userID" exact component={Feed}> 
            {/* This component = {} syntax actually passes userID prop */}
          </Route>
          <Route path="/explore" >
            {/*Explore page go here*/}
          </Route>
          <Redirect to="/feed" />
        </Switch>
      </main>
    </Router>
    </AuthContext.Provider>
);
}

export default App;
