import { Component, createEffect, createSignal } from 'solid-js';
import { Router, Route } from '@solidjs/router';

import styles from './App.module.css';
import Login from './components/Login';
import Gallery from './components/Gallery';
import ModelDetails from './components/ModelDetails';
import ProtectedRoute from './components/ProtectedRoute';

interface Model {
  dirname: string;
  filename: string;
  hash: string;
}

const App: Component = () => {
  const [password, setPassword] = createSignal(localStorage.getItem('password') ?? '');
  const [sampledModels, setSampledModels] = createSignal<Model[]>([]);

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
              <Gallery password={password} sampledModels={sampledModels} setSampledModels={setSampledModels} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/models/:hash"
          component={() => (
            <ProtectedRoute password={password}>
              <ModelDetails password={password} sampledModels={sampledModels} />
            </ProtectedRoute>
          )}
        />
      </Router>
    </div>
  );
};

export default App;
