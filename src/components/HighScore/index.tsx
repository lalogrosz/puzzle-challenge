import React from 'react';
import { HighScore } from '../../store/slice';
import styles from './high-score.module.css';
import cn from 'classnames';

const TopScore = ({ highScore }: { highScore: HighScore[] }) => {
  return highScore && highScore.length > 0 ? (
    <section className={styles.main}>
      <h1>Top Score</h1>
      <div className={styles.container}>
        <div className={cn(styles.header, styles.row)}>
          <div>Name</div>
          <div className={styles.points}>Points</div>
        </div>
        {highScore.map(({ name, score }, index) => (
          <div className={styles.row} key={`${name}-${index}`}>
            <div>{name}</div>
            <div className={styles.points}>{score}</div>
          </div>
        ))}
      </div>
    </section>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default TopScore;
