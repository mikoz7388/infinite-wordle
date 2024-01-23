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
      this.submitAnswer();
      return;
    }
    this.updateCurrentAnswer(e.key);
  }

  keyboardClickHandler(e: MouseEvent) {
    const target = e.target;

    if (target instanceof SVGElement) {
      this.updateCurrentAnswer('Backspace');
      return;
    }

    if (!(target instanceof HTMLButtonElement)) return;
    if (!target.textContent) return;
    if (target.textContent === 'Enter') {
      this.submitAnswer();
      return;
    }
    if (target.textContent === 'Backspace') {
      this.updateCurrentAnswer(target.textContent);
      return;
    }
    this.updateCurrentAnswer(target.textContent);
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
    console.log('submit');
    const stateClone = structuredClone(this.getState());
    if (stateClone.currentAnswer.length !== 5) return;
    if (!this.isCurrentAnswerInWords()) {
      this.animateShakeRow();
      return;
    }

    stateClone.cellsColors = this.defineCellsColors();
    if (this.isAnswerCorrect()) alert('You win!');
    stateClone.allAnswers.push(stateClone.currentAnswer);
    stateClone.currentAnswer = '';
    this.saveState(stateClone);
  }

  isGameOver() {
    const stateClone = structuredClone(this.getState());

    stateClone.isGameOver = stateClone.allAnswers.length === ROWS;
    this.saveState(stateClone);
  }

  isCurrentAnswerInWords() {
    const { currentAnswer } = this.getState();
    return words.includes(currentAnswer);
  }

  isAnswerCorrect() {
    const { currentAnswer, correctAnswer } = this.getState();
    return currentAnswer === correctAnswer;
  }
  generateRandomAnswer() {
    const stateClone = structuredClone(this.getState());
    stateClone.correctAnswer = words[Math.floor(Math.random() * words.length)];
    this.saveState(stateClone);
  }

  defineCellsColors() {
    const {
      cellsColors = [],
      correctAnswer,
      currentAnswer,
    } = structuredClone(this.getState());

    for (let i = 0; i < currentAnswer.length; i++) {
      if (!correctAnswer.includes(currentAnswer[i])) {
        cellsColors.push('wrong');
      }
      if (currentAnswer[i] === correctAnswer[i]) {
        cellsColors.push('right');
      } else if (correctAnswer.includes(currentAnswer[i])) {
        cellsColors.push('misplaced');
      }
    }
    return cellsColors;
  }

  animateShakeRow() {
    console.log('animate');
    const { allAnswers } = this.getState();
    const rows = document.querySelectorAll('.row');
    const currentRow = allAnswers.length;
    rows[currentRow].classList.add('shake');
    setTimeout(() => {
      rows[currentRow].classList.remove('shake');
    }, 500);
    console.log(rows[currentRow]);
  }

  reset() {
    const stateClone = structuredClone(this.getState());
    stateClone.currentAnswer = '';
    stateClone.allAnswers = [];
    stateClone.cellsColors = [];
    stateClone.isGameOver = false;
    this.generateRandomAnswer();
    this.saveState(stateClone);
  }
}
