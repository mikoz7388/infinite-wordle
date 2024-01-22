import { ROWS } from './CONSTS';
import { words } from './words';

type cellColor = 'right' | 'wrong' | 'misplaced';
export type gameState = {
  isGameOver: boolean;
  currentAnswer: string;
  correctAnswer: string;
  allAnswers: string[];
  cellsColors: cellColor[];
};

const testState: gameState = {
  isGameOver: false,
  correctAnswer: '',
  currentAnswer: '',
  allAnswers: [],
  cellsColors: [],
};

// const initialState: gameState = {
//   currentAnswer: '',
//   allAnswers: [],
// };

export class Store extends EventTarget {
  private storageKey = 'wordle';
  state: gameState;

  constructor(storageKey?: string) {
    super();
    if (storageKey) this.storageKey = storageKey;
    this.state = testState;
  }

  saveState(stateOrFn: gameState | ((prevState: gameState) => gameState)) {
    const prevState = this.getState();

    let newState;

    switch (typeof stateOrFn) {
      case 'function':
        newState = stateOrFn(prevState);
        break;
      case 'object':
        newState = stateOrFn;
        break;
      default:
        throw new Error('Invalid argument passed to saveState');
    }
    // window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.state = newState;
    this.dispatchEvent(new Event('statechanged'));
  }

  getState(): gameState {
    return this.state;
    // const item = window.localStorage.getItem(this.storageKey);
    // return item ? JSON.parse(item) : initialState;
  }

  keyDownHandler(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.defineCellsColors();
      this.submitAnswer();
      this.isGameOver();
      return;
    }
    this.updateCurrentAnswer(e.key);
  }

  updateCurrentAnswer(answer: string) {
    const regex = /[a-z]/i;
    const stateClone = structuredClone(this.getState());

    switch (answer) {
      case 'Backspace':
        stateClone.currentAnswer = stateClone.currentAnswer.slice(0, -1);
        break;
      default:
        if (answer.length > 1) return;
        if (regex.test(answer)) {
          if (stateClone.currentAnswer.length < 5)
            stateClone.currentAnswer += answer.toLowerCase();
        }
    }
    this.saveState(stateClone);
  }

  submitAnswer() {
    const stateClone = structuredClone(this.getState());
    if (stateClone.currentAnswer.length !== 5) return;
    if (this.checkAnswer()) alert('You win!');
    stateClone.allAnswers.push(stateClone.currentAnswer);
    stateClone.currentAnswer = '';
    this.saveState(stateClone);
  }

  isGameOver() {
    const stateClone = structuredClone(this.getState());

    stateClone.isGameOver = stateClone.allAnswers.length === ROWS;
    this.saveState(stateClone);
  }

  checkAnswer() {
    const { currentAnswer, correctAnswer } = this.getState();
    return currentAnswer === correctAnswer;
  }

  generateRandomAnswer() {
    const stateClone = structuredClone(this.getState());
    stateClone.correctAnswer = words[Math.floor(Math.random() * words.length)];
    this.saveState(stateClone);
  }

  defineCellsColors() {
    const stateClone = structuredClone(this.getState());
    const currentAnswer = stateClone.currentAnswer;
    const correctAnswer = stateClone.correctAnswer;
    if (!stateClone.cellsColors) stateClone.cellsColors = [];
    for (let i = 0; i < currentAnswer.length; i++) {
      if (!correctAnswer.includes(currentAnswer[i])) {
        stateClone.cellsColors.push('wrong');
      }
      if (currentAnswer[i] === correctAnswer[i]) {
        stateClone.cellsColors.push('right');
      } else if (correctAnswer.includes(currentAnswer[i])) {
        stateClone.cellsColors.push('misplaced');
      }
    }
    this.saveState(stateClone);
  }

  reset() {
    const stateClone = structuredClone(this.getState());
    stateClone.currentAnswer = '';
    stateClone.allAnswers = [];
    this.generateRandomAnswer();
    this.saveState(stateClone);
  }
}
