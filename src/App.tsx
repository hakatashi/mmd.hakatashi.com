import { Component, createSignal, JSX } from 'solid-js';

import styles from './App.module.css';
import {throttle} from 'lodash';

const App: Component = () => {
  const [password, setPassword] = createSignal('');

  const onInputPassword: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    setPassword((event.target as HTMLInputElement).value)
    onChangePassword();
  };

  const onChangePassword = throttle(async () => {
    if (password().match(/[^a-zA-Z0-9]/)) {
      return;
    }
    const res = await fetch(`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${password()}.json`);
    const data = await res.json();
  }, 500);

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div class={styles.logo}/>
        <p class={styles.hint}>
          ☳☴☶☳☳☱☱☴☲☳☱☰☶☱☱☴☵☲☳☲☴☳☶☰☱☴☵☴☴☰☵☷☲☳☶☴☴☴☶☲☷☵☴☰☱☰☰☰
        </p>
        <input type="text" class={styles.password} onInput={onInputPassword} value={password()}/>
      </header>
    </div>
  );
};

export default App;
