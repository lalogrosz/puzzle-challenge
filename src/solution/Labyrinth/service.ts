import { RootState } from '../../store/hooks';

export enum Directions {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left'
}

export type Neighbors = Record<Directions, number>;

export interface SquareModel {
  fog: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  neighbors: Neighbors;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  position: number;
  coords: [number, number];
}

export interface Maze {
  squares: SquareModel[];
  current?: SquareModel;
  movesLeft: number;
}

export type DirectionType = keyof typeof DIRECTION_MAP;

export const squareSize = process.env.REACT_APP_SQUARE_SIZE ? parseInt(process.env.REACT_APP_SQUARE_SIZE, 10) : 50;
export const size = process.env.REACT_APP_LABYRINTH_SIZE ? parseInt(process.env.REACT_APP_LABYRINTH_SIZE, 10) : 5;
const mazePath = (process.env.REACT_APP_LABYRINTH_PATH || '0,1;1,0;2,0;3,0;4,0;4,1;4,2;4,3')
  .split(';')
  .map(item => item.split(',').map(item => parseInt(item, 10)));
const moves = process.env.REACT_APP_TOTAL_MOVES ? parseInt(process.env.REACT_APP_TOTAL_MOVES, 10) : 20;

const OPPOSITE_DIRECTION = {
  top: Directions.top,
  right: Directions.left,
  bottom: Directions.top,
  left: Directions.right
};

const DIRECTION_MAP = {
  ArrowUp: -size,
  ArrowDown: size,
  ArrowLeft: -1,
  ArrowRight: 1
};

const CIRCLE_MOVE_MAP = {
  ArrowUp: [-squareSize - 1, 0],
  ArrowDown: [squareSize + 1, 0],
  ArrowLeft: [0, -squareSize - 1],
  ArrowRight: [0, squareSize + 1]
};

export const buildMaze = (): Maze => {
  let isStart, isFinish, isWall: boolean;
  let neighbors: Neighbors;
  let i = 0;

  const maze: Maze = {
    squares: [],
    movesLeft: moves
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      isStart = x === 0 && y === 0;
      isFinish = x === size - 1 && y === size - 1;
      isWall = !mazePath.some(path => path[0] === x && path[1] === y) && !isStart && !isFinish;

      neighbors = {
        top: y - 1 >= 0 ? i - size : undefined,
        right: x + 1 < size ? i + 1 : undefined,
        bottom: y + 1 < size ? i + size : undefined,
        left: x - 1 >= 0 ? i - 1 : undefined
      };

      maze.squares.push({
        fog: {
          top: true,
          right: true,
          bottom: true,
          left: true
        },
        neighbors,
        isStart,
        isFinish,
        isWall,
        position: i,
        coords: [x, y]
      });
      i++;
    }
  }
  maze.current = maze.squares[0];
  openNeighborsFog(maze.squares, maze.current.neighbors);
  return maze;
};

const openNeighborsFog = (squares: SquareModel[], neighbors: Neighbors) => {
  (Object.keys(neighbors) as [Directions]).forEach(key => {
    if (neighbors[key]) {
      squares[neighbors[key]].fog[OPPOSITE_DIRECTION[key]] = false;
    }
  });
};

const moveCircle = (state: RootState, direction: DirectionType) => {
  const [x, y] = CIRCLE_MOVE_MAP[direction];
  state.circlePosition = [state.circlePosition[0] + x, state.circlePosition[1] + y];
};

const isValidKey = (key: string) => {
  return Object.keys(DIRECTION_MAP).includes(key);
};

const canWalk = (state: RootState) => state.movesLeft > 0 && !state.won && !state.lost;

const isNeighbor = (square: SquareModel, position: number) => (Object.keys(square.neighbors) as [Directions]).some(k => square.neighbors[k] === position);

const addHighScore = (state: RootState) => {
  const highScore = state.highScore;
  const newScore = { name: state.player, score: state.movesLeft };
  highScore.push(newScore);
  state.highScore = highScore.sort((a, b) => b.score - a.score);
};

export const move = (state: RootState, direction: DirectionType): boolean => {
  if (!isValidKey(direction)) {
    return;
  }

  if (!canWalk(state)) {
    return;
  }

  const newPosition = state.current.position + DIRECTION_MAP[direction];
  if (!isNeighbor(state.current, newPosition)) {
    return;
  }

  const newSquare = state.squares[newPosition];
  if (newSquare.isWall) {
    return;
  }

  state.movesLeft--;

  // Move circle
  moveCircle(state, direction);

  openNeighborsFog(state.squares, newSquare.neighbors);

  // Clear fog from new square
  newSquare.fog = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  state.current = newSquare;

  if (newSquare.isFinish) {
    state.won = true;
    addHighScore(state);
    return;
  }

  if (state.movesLeft === 0) {
    state.lost = true;
  }
};
