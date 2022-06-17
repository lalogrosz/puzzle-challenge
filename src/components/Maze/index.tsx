import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { actions } from '../../store/slice';
import { DirectionType, size, squareSize } from '../../services';
import Square from '../Square';
import styles from './maze.module.css';

const Maze = (): ReactElement => {
  const state = useAppSelector(state => state);
  const started = state.started;
  const circlePosition = state.circlePosition;

  const [circlePositionStyle, setCirclePositionStyle] = useState({
    top: '0px',
    left: '0px'
  });

  const [labyrinthStyle, setLabyrinthStyle] = useState({
    gridTemplateRows: '',
    gridTemplateColumns: ''
  });

  const dispatch = useAppDispatch();

  const keyDownHandler = useCallback(
    (ev: KeyboardEvent) => {
      started && dispatch(actions.move(ev.key as DirectionType));
    },
    [dispatch, started]
  );

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);

    setLabyrinthStyle({
      gridTemplateRows: `repeat(${size}, ${squareSize}px)`,
      gridTemplateColumns: `repeat(${size}, ${squareSize}px)`
    });

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);

  useEffect(() => {
    setCirclePositionStyle({
      top: `${circlePosition[0]}px`,
      left: `${circlePosition[1]}px`
    });
  }, [circlePosition]);

  return (
    <div>
      <div className={styles.circle} style={circlePositionStyle}></div>
      <div className={styles.labyrinth} style={labyrinthStyle}>
        {state.squares &&
          state.squares.map((square, index) => (
            <Square key={index} isFinish={square.isFinish} isStart={square.isStart} isWall={square.isWall} fog={square.fog}></Square>
          ))}
      </div>
      <div className={styles.footerText}>
        {state.won && <div className={styles.youWonText}>You won</div>}
        {state.lost && <div className={styles.youLostText}>You lost</div>}
        <div className={styles.movesLeftText}>Moves left {state.movesLeft}</div>
      </div>
    </div>
  );
};

export default Maze;
