import classNames from 'classnames';
import React from 'react';

import styles from './square.module.css';

interface Props {
  fog?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
}

const Square = ({ fog, isStart, isWall, isFinish }: Props): React.ReactElement => {
  return (
    <div
      className={classNames(styles.square, {
        [styles.start]: isStart,
        [styles.finish]: isFinish,
        [styles.wall]: isWall
      })}
    >
      {!isStart && !isFinish && (
        <>
          <div className={classNames(styles.top, { [styles.fogTop]: fog?.top, [styles.cleanTop]: !fog?.top })}></div>
          <div className={classNames(styles.right, { [styles.fogRight]: fog?.right, [styles.cleanRight]: !fog?.right })}></div>
          <div className={classNames(styles.bottom, { [styles.fogBottom]: fog?.bottom, [styles.cleanBottom]: !fog?.bottom })}></div>
          <div className={classNames(styles.left, { [styles.fogLeft]: fog?.left, [styles.cleanLeft]: !fog?.left })}></div>
        </>
      )}
    </div>
  );
};

export default Square;
