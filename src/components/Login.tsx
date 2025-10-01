import { Component, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { throttle } from 'lodash';
import { Buffer } from 'buffer';
import styles from './Login.module.css';

interface LoginProps {
  password: () => string;
  setPassword: (value: string) => void;
}

const sha256 = async (buffer: Buffer) => {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const Login: Component<LoginProps> = (props) => {
  const navigate = useNavigate();

  const onInputPassword: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    props.setPassword((event.target as HTMLInputElement).value);
    onChangePassword();
  };

  const onChangePassword = throttle(async () => {
    if (props.password().match(/[^a-zA-Z0-9]/)) {
      return;
    }
    try {
      const res = await fetch(`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${props.password()}.json`);
      if (res.ok) {
        const data = (await res.json()) as string[];
        if (data.length > 0) {
          navigate('/gallery');
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }, 500);

  return (
    <header class={styles.header}>
      <div class={styles.logo}/>
      <p class={styles.hint}>
        ☳☴☶☳☳☱☱☴☲☳☱☰☶☱☱☴☵☲☳☲☴☳☶☰☱☴☵☴☴☰☵☷☲☳☶☴☴☴☶☲☷☵☴☰☱☰☰☰
      </p>
      <input
        type="text"
        class={styles.password}
        onInput={onInputPassword}
        value={props.password()}
        placeholder="Enter password..."
      />
    </header>
  );
};

export default Login;