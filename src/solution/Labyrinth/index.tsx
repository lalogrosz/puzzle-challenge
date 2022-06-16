import styles from './labyrinth.module.css';
import React from 'react';
import { useAppSelector } from '../../store/hooks';
import PlayerInput from '../PlayerInput';
import HighScore from '../HighScore';
import Maze from '../Maze';

const Labyrinth = () => {
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
