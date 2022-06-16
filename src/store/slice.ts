import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { buildMaze, DirectionType, move, SquareModel } from '../solution/Labyrinth/service';

export type HighScore = {
  name: string;
  score: number;
};

export type InitialState = {
  squares: SquareModel[];
  current?: SquareModel;
  movesLeft: number;
  circlePosition: [number, number];
  won: boolean;
  lost: boolean;
  highScore: HighScore[];
  player?: string;
  started?: boolean;
};

const initialState = (): InitialState => ({
  ...buildMaze(),
  circlePosition: [0, 0],
  won: false,
  lost: false,
  highScore: []
});

const slice = createSlice({
  name: 'maze',
  initialState: initialState(),
  reducers: {
    move: (state, { payload }: PayloadAction<DirectionType>) => {
      move(state, payload);
    },
    restart: state => {
      const { squares, current, movesLeft, circlePosition, won, lost } = initialState();
      state.squares = squares;
      state.current = current;
      state.movesLeft = movesLeft;
      state.circlePosition = circlePosition;
      state.won = won;
      state.lost = lost;
    },
    start: state => {
      state.started = true;
    },
    setPlayer: (state, { payload }: PayloadAction<string>) => {
      state.player = payload;
    }
  }
});

export const { actions, reducer } = slice;
