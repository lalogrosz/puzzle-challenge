import debounce from 'lodash.debounce';
import { ReactElement, useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { actions } from '../../store/slice';
import styles from './player-input.module.css';

const PlayerInput = (): ReactElement => {
  const dispatch = useAppDispatch();
  const started = useAppSelector(state => state.started);

  const [disabled, setDisabled] = useState(true);

  const debouncedLog = debounce(player => {
    dispatch(actions.setPlayer(player));
  }, 300);

  const onRestart = useCallback(() => {
    dispatch(actions.restart());
  }, [dispatch]);

  const onStart = useCallback(() => {
    dispatch(actions.start());
  }, [dispatch]);

  const onChange = useCallback(
    ({ target: { value: player } }) => {
      setDisabled(player.length === 0);
      debouncedLog(player); // passing the setState along...
    },
    [debouncedLog]
  );

  return (
    <section className={styles.main}>
      <input type="text" onChange={onChange} placeholder="Player Name" />
      {started ? (
        <button onClick={onRestart} disabled={disabled}>
          Restart
        </button>
      ) : (
        <button onClick={onStart} disabled={disabled}>
          Start
        </button>
      )}
    </section>
  );
};

export default PlayerInput;
