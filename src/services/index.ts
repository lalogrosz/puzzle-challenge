import { RootState } from '../store/hooks';

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
}

export interface Maze {
  squares: SquareModel[];
  current?: SquareModel;
  movesLeft: number;
  circlePosition: [number, number];
}

export type DirectionType = keyof typeof DIRECTION_MAP;

export const squareSize = process.env.REACT_APP_SQUARE_SIZE ? parseInt(process.env.REACT_APP_SQUARE_SIZE, 10) : 50;
export const size = process.env.REACT_APP_LABYRINTH_SIZE ? parseInt(process.env.REACT_APP_LABYRINTH_SIZE, 10) : 5;
const mazePath = (process.env.REACT_APP_LABYRINTH_PATH || '0,1;1,0;2,0;3,0;4,0;4,1;4,2;4,3;1,1')
  .split(';')
  .map(item => item.split(',').map(item => parseInt(item, 10)));
const moves = process.env.REACT_APP_TOTAL_MOVES ? parseInt(process.env.REACT_APP_TOTAL_MOVES, 10) : 10;
const initialPosition = process.env.REACT_APP_INITIAL_POSITION ? parseInt(process.env.REACT_APP_INITIAL_POSITION, 10) : 4;
const finishPosition = process.env.REACT_APP_FINISH_POSITION ? parseInt(process.env.REACT_APP_FINISH_POSITION, 10) : 24;

const OPPOSITE_DIRECTION = {
  top: Directions.bottom,
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
  ArrowUp: [0, -squareSize - 1],
  ArrowDown: [0, squareSize + 1],
  ArrowLeft: [-squareSize - 1, 0],
  ArrowRight: [squareSize + 1, 0]
};

export const buildMaze = (): Maze => {
  let isStart, isFinish, isWall: boolean;
  let neighbors: Neighbors;
  let i = 0;
  let circlePosition: [number, number] = [0, 0];

  const maze: Maze = {
    squares: [], // squares are not a multi-dimensional array. It is a flat array and it is easier to iterate.
    movesLeft: moves,
    circlePosition
  };

  // Creates the maze squares and sets the neighbors
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Decides if the square is a wall, start or finish
      isStart = i === initialPosition;
      isFinish = i === finishPosition;
      isWall = !mazePath.some(path => path[0] === x && path[1] === y) && !isStart && !isFinish;

      if (isStart) {
        circlePosition = [x * (squareSize + 1), y * (squareSize + 1)];
      }

      // Set the neighbors. Top and bottom are calculated by adding or subtracting the square size
      neighbors = {
        top: y - 1 >= 0 ? i - size : undefined,
        right: x + 1 < size ? i + 1 : undefined,
        bottom: y + 1 < size ? i + size : undefined,
        left: x - 1 >= 0 ? i - 1 : undefined
      };

      // Each square has a fog to hide the maze. The fog is set to true by default
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
        position: i
      });
      i++;
    }
  }
  // By default the fog is set to false for the start neighbors squares
  maze.current = maze.squares[initialPosition];
  maze.circlePosition = circlePosition;
  openNeighborsFog(maze.squares, maze.current.neighbors);

  return maze;
};

const openNeighborsFog = (squares: SquareModel[], neighbors: Neighbors) => {
  // Loop over the neighbors and set the fog to false
  (Object.keys(neighbors) as [Directions]).forEach(key => {
    if (neighbors[key] !== undefined) {
      // OPPOSITE_DIRECTION is used to know what direction the square is facing
      squares[neighbors[key]].fog[OPPOSITE_DIRECTION[key]] = false;
    }
  });
};

const moveCircle = (state: RootState, direction: DirectionType) => {
  // Use the CIRCLE_MOVE_MAP to move the circle
  const [x, y] = CIRCLE_MOVE_MAP[direction];
  state.circlePosition = [state.circlePosition[0] + x, state.circlePosition[1] + y];
};

const isValidKey = (key: string) => {
  // Only allow the arrow keys
  return Object.keys(DIRECTION_MAP).includes(key);
};

const canWalk = (state: RootState) => state.movesLeft > 0 && !state.won && !state.lost;

// This function check if the next square is one of the neighbors of the current square
const isNeighbor = (square: SquareModel, position: number) => (Object.keys(square.neighbors) as [Directions]).some(k => square.neighbors[k] === position);

// Push one high-score and sort the array by score
const addHighScore = (state: RootState) => {
  const highScore = state.highScore;
  const newScore = { name: state.player, score: state.movesLeft };
  highScore.push(newScore);
  state.highScore = highScore.sort((a, b) => b.score - a.score);
};

// This is the main function that handles the movement of the circle
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
