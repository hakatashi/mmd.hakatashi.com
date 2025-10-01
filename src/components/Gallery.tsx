import { Component, createEffect, createSignal, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { sampleSize, throttle } from 'lodash';
import { Buffer } from 'buffer';
import styles from '../App.module.css';

interface Model {
  dirname: string;
  filename: string;
  hash: string;
}

interface GalleryProps {
  password: () => string;
}

const sha256 = async (buffer: Buffer) => {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const poses = ['back_and_forward_legs', 'cross_leg', 'doggy', 'doggy_open_legs', 'doggy_with_v_sign', 'facing_upward', 'finger_pointing_up', 'folding_arms_behind_head', 'folding_arm_behind_head', 'goodbye_sengen', 'holding_leg_upward', 'jumping', 'lean_against_desk', 'looking_back_with_finger_on_mouth', 'lying', 'lying_with_v_sign', 'm_open', 'raising_both_hands', 'shhh', 'showing_hip', 'side_m_open', 'sitting_bending_backward', 'sitting_crossing_arms', 'sitting_self_massage', 'sitting_with_looking_at_sky', 'stand1', 'stand2', 'stand_back_hand_on_breast', 'stand_picking_skirt', 'waving_hand'];

const Gallery: Component<GalleryProps> = (props) => {
  const navigate = useNavigate();
  const [models, setModels] = createSignal<Model[]>([]);

  const loadModels = throttle(async () => {
    if (!props.password() || props.password().match(/[^a-zA-Z0-9]/)) {
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${props.password()}.json`);
      if (!res.ok) {
        navigate('/');
        return;
      }

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
    } catch (error) {
      console.error('Failed to load models:', error);
      navigate('/');
    }
  }, 500);

  createEffect(() => {
    loadModels();
  });

  const mode = localStorage.getItem('mode') ?? 'original';

  return (
    <div class={styles.App}>
      <For each={sampleSize(models(), 100)}>{(model, i) =>
        <img
          class={styles.thumbnail}
          src={`https://mmd-archive-thumbs.s3.ap-northeast-1.amazonaws.com/${model.hash}/${mode}/render_${poses[i() % poses.length]}.webp`}
        />
      }</For>
    </div>
  );
};

export default Gallery;