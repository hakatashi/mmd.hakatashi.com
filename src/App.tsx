import { Component, createSignal, For, JSX } from 'solid-js';

import styles from './App.module.css';
import {sampleSize, throttle} from 'lodash';
import {Buffer} from 'buffer';

interface Model {
  dirname: string,
  filename: string,
  hash: string,
}

const sha256 = async (buffer: Buffer) => {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const poses = ['back_and_forward_legs', 'cross_leg', 'doggy', 'doggy_open_legs', 'doggy_with_v_sign', 'facing_upward', 'finger_pointing_up', 'folding_arms_behind_head', 'folding_arm_behind_head', 'goodbye_sengen', 'holding_leg_upward', 'jumping', 'lean_against_desk', 'looking_back_with_finger_on_mouth', 'lying', 'lying_with_v_sign', 'm_open', 'raising_both_hands', 'shhh', 'showing_hip', 'side_m_open', 'sitting_bending_backward', 'sitting_crossing_arms', 'sitting_self_massage', 'sitting_with_looking_at_sky', 'stand1', 'stand2', 'stand_back_hand_on_breast', 'stand_picking_skirt', 'waving_hand'];

const App: Component = () => {
  const [password, setPassword] = createSignal('');
  const [models, setModels] = createSignal<Model[]>([]);

  const onInputPassword: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    setPassword((event.target as HTMLInputElement).value)
    onChangePassword();
  };

  const onChangePassword = throttle(async () => {
    if (password().match(/[^a-zA-Z0-9]/)) {
      return;
    }
    const res = await fetch(`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${password()}.json`);
    const data = (await res.json()) as string[];
    const modelList: Model[] = [];
    for (const line of data) {
      const hash = await sha256(Buffer.from(line, 'hex'));
      const pathString = Buffer.from(line, 'hex').toString('utf-8');
      const slashIndex = pathString.indexOf('\\');
      if (slashIndex === -1) {
        continue;
      }
      const dirname = pathString.slice(0, slashIndex);
      const filename = pathString.slice(slashIndex + 1);
      modelList.push({dirname, filename, hash});
    }
    setModels(modelList);
  }, 500);

  return (
    <div class={styles.App}>
      {models().length === 0 ? (
        <header class={styles.header}>
          <div class={styles.logo}/>
          <p class={styles.hint}>
            ☳☴☶☳☳☱☱☴☲☳☱☰☶☱☱☴☵☲☳☲☴☳☶☰☱☴☵☴☴☰☵☷☲☳☶☴☴☴☶☲☷☵☴☰☱☰☰☰
          </p>
          <input type="text" class={styles.password} onInput={onInputPassword} value={password()}/>
        </header>
      ) : (
        <For each={sampleSize(models(), 100)}>{(model, i) =>
          <img class={styles.thumbnail} src={`https://mmd-archive-thumbs.s3.ap-northeast-1.amazonaws.com/${model.hash}/nude/render_${poses[i() % poses.length]}.webp`} />
        }</For>
      )}
    </div>
  );
};

export default App;
