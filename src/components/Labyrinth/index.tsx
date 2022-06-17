import React, { ReactElement } from 'react';

import { useAppSelector } from '../../store/hooks';
import HighScore from '../HighScore';
import Maze from '../Maze';
import PlayerInput from '../PlayerInput';
import styles from './labyrinth.module.css';

const Labyrinth = (): ReactElement => {
  const state = useAppSelector(state => state);
  const started = state.started;

  const HighScoreMemo = React.memo(HighScore);

  return state ? (
    <section className={styles.main}>
      {started && <Maze />}
      <PlayerInput />
      <HighScoreMemo highScore={state.highScore} />
    </section>
  ) : (
    <></>
  );
};

export default Labyrinth;
