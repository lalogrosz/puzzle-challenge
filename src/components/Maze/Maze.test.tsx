import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import Maze from '.';
import store from '../../store';
import { actions } from '../../store/slice';

describe('Maze component', () => {
  let container: HTMLElement;
  beforeEach(() => {
    ({ container } = render(
      <Provider store={store}>
        <Maze />
      </Provider>
    ));
    store.dispatch(actions.setPlayer('Alan'));
    store.dispatch(actions.start());
  });

  it('should create the maze with custom environment values', () => {
    expect(store.getState().squares.length).toBe(9);
    expect(store.getState().movesLeft).toBe(6);
  });

  it('should render the maze', () => {
    expect(container.firstChild.firstChild).toHaveClass('circle');
  });

  it('should play Alan', () => {
    const state = store.getState();
    expect(state.player).toBe('Alan');
  });

  describe('when the player moves', () => {
    beforeEach(() => {
      store.dispatch(actions.restart());
    });

    it('should open fog from neighbors', () => {
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      const squares = store.getState().squares;
      expect(squares[6].fog.top).toBeFalsy();
      expect(squares[6].fog.bottom).toBeTruthy();

      expect(squares[4].fog.left).toBeFalsy();
      expect(squares[6].fog.right).toBeTruthy();
    });

    it('should not move if the square is a wall', () => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      let state = store.getState();
      expect(state.current.position).toBe(1);
      expect(state.movesLeft).toBe(5);

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      state = store.getState();
      expect(state.current.position).toBe(1);
      expect(state.movesLeft).toBe(5);
    });

    it('should not move if is a border square', () => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      let state = store.getState();
      expect(state.current.position).toBe(0);
      expect(state.movesLeft).toBe(6);
    });

    it('should win', () => {
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });

      const { won, lost, movesLeft } = store.getState();
      expect(won).toBeTruthy();
      expect(lost).toBeFalsy();
      expect(movesLeft).toBe(2);

      // Also check the victory message
      expect(screen.getByText('You won')).toBeInTheDocument();

      // And the user couldn't move anymore
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(store.getState().movesLeft).toBe(2);
    });

    it('should lose', () => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const { won, lost, movesLeft } = store.getState();
      expect(lost).toBeTruthy();
      expect(won).toBeFalsy();
      expect(movesLeft).toBe(0);

      // Also check the victory message
      expect(screen.getByText('You lost')).toBeInTheDocument();

      // And the user couldn't move anymore
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(store.getState().movesLeft).toBe(0);
    });
  });
});
