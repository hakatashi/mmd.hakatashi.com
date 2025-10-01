import { Component } from 'solid-js';
import styles from './ModeSwitcher.module.css';

interface ModeSwitcherProps {
  mode: () => string;
  setMode: (mode: string) => void;
}

const ModeSwitcher: Component<ModeSwitcherProps> = (props) => {
  return (
    <div class={styles.switcher}>
      <button
        class={props.mode() === 'original' ? styles.active : ''}
        onClick={() => props.setMode('original')}
      >
        Original
      </button>
      <button
        class={props.mode() === 'nude' ? styles.active : ''}
        onClick={() => props.setMode('nude')}
      >
        Nude
      </button>
    </div>
  );
};

export default ModeSwitcher;
