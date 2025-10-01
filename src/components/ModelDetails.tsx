import { Component, createEffect, createSignal, For } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { throttle } from 'lodash';
import { Buffer } from 'buffer';
import styles from './ModelDetails.module.css';
import ModeSwitcher from './ModeSwitcher';

interface Model {
  dirname: string;
  filename: string;
  hash: string;
}

interface ModelDetailsProps {
  password: () => string;
}

const sha256 = async (buffer: Buffer) => {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const poses = ['back_and_forward_legs', 'cross_leg', 'doggy', 'doggy_open_legs', 'doggy_with_v_sign', 'facing_upward', 'finger_pointing_up', 'folding_arms_behind_head', 'folding_arm_behind_head', 'goodbye_sengen', 'holding_leg_upward', 'jumping', 'lean_against_desk', 'looking_back_with_finger_on_mouth', 'lying', 'lying_with_v_sign', 'm_open', 'raising_both_hands', 'shhh', 'showing_hip', 'side_m_open', 'sitting_bending_backward', 'sitting_crossing_arms', 'sitting_self_massage', 'sitting_with_looking_at_sky', 'stand1', 'stand2', 'stand_back_hand_on_breast', 'stand_picking_skirt', 'waving_hand'];

const ModelDetails: Component<ModelDetailsProps> = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [model, setModel] = createSignal<Model | null>(null);
  const [mode, setMode] = createSignal(localStorage.getItem('mode') ?? 'original');

  createEffect(() => {
    localStorage.setItem('mode', mode());
  });

  const loadModel = throttle(async () => {
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

      for (const line of data) {
        const hash = await sha256(Buffer.from(line, 'hex'));
        if (hash === params.hash) {
          const pathString = Buffer.from(line, 'hex').toString('utf-8');
          const slashIndex = pathString.indexOf('\\');
          if (slashIndex === -1) {
            continue;
          }
          const dirname = pathString.slice(0, slashIndex);
          const filename = pathString.slice(slashIndex + 1);
          setModel({dirname, filename, hash});
          break;
        }
      }

      if (!model()) {
        navigate('/gallery');
      }
    } catch (error) {
      console.error('Failed to load model:', error);
      navigate('/');
    }
  }, 500);

  createEffect(() => {
    loadModel();
  });

  return (
    <>
      <ModeSwitcher mode={mode} setMode={setMode} />
      <div class={styles.container}>
        {model() && (
          <>
            <h2>{model()!.dirname}</h2>
            <p>{model()!.filename}</p>
            <div class={styles.poseGrid}>
              <For each={poses}>{(pose) =>
                <div class={styles.poseItem}>
                  <img
                    class={styles.thumbnail}
                    src={`https://mmd-archive-thumbs.s3.ap-northeast-1.amazonaws.com/${model()!.hash}/${mode()}/render_${pose}.webp`}
                    alt={pose}
                  />
                  <p class={styles.poseName}>{pose.replace(/_/g, ' ')}</p>
                </div>
              }</For>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ModelDetails;
