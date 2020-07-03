import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Navigation from './components/MainUI/Navigation';
import Feed from './pages/Feed';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
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
);
}

export default App;
