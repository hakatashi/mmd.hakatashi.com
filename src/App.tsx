import { Component, createEffect, createSignal } from 'solid-js';
import { Router, Route } from '@solidjs/router';

import styles from './App.module.css';
import Login from './components/Login';
import Gallery from './components/Gallery';
import ProtectedRoute from './components/ProtectedRoute';

const App: Component = () => {
  const [password, setPassword] = createSignal(localStorage.getItem('password') ?? '');

  createEffect(() => {
    localStorage.setItem('password', password());
  });

  return (
    <div class={styles.App}>
      <Router>
        <Route
          path="/"
          component={() => <Login password={password} setPassword={setPassword} />}
        />
        <Route
          path="/gallery"
          component={() => (
            <ProtectedRoute password={password}>
              <Gallery password={password} />
            </ProtectedRoute>
          )}
        />
      </Router>
    </div>
  );
};

export default App;
