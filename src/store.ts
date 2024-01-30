import { ROWS } from './CONSTS';
import { words } from './words';

type keyStateColor = 'correct' | 'incorrect' | 'misplaced';

export type gameState = {
  isGameOver: boolean;
  currentAnswer: string;
  correctAnswer: string;
  allAnswers: string[];
  keyboardColors: Map<string, keyStateColor>;
};

const testState: gameState = {
  isGameOver: false,
  correctAnswer: '',
  currentAnswer: '',
  allAnswers: [],
  keyboardColors: new Map(),
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
    let newState: gameState;

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
    this.dispatchEvent(new Event('state-changed'));
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
    const stateClone = structuredClone(this.getState());
    if (!this.isCurrentAnswerInWords()) {
      this.dispatchEvent(new Event('invalid-answer'));
      return;
    }

    if (this.isAnswerCorrect()) alert('You win!');
    stateClone.keyboardColors = this.updateScreenKeyboardColors(stateClone);
    stateClone.allAnswers.push(stateClone.currentAnswer);
    stateClone.currentAnswer = '';
    this.saveState(stateClone);

    this.dispatchEvent(new Event('answer-submitted'));
  }

  isGameOver() {
    const stateClone = structuredClone(this.getState());

    stateClone.isGameOver = stateClone.allAnswers.length === ROWS;
    this.saveState(stateClone);
  }

  isCurrentAnswerInWords() {
    const { currentAnswer } = this.getState();
    if (currentAnswer.length !== 5) return false;
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

  updateScreenKeyboardColors({ currentAnswer, correctAnswer }: gameState) {
    const keyboardColors = this.getState().keyboardColors;

    for (let i = 0; i < currentAnswer.length; i++) {
      if (
        currentAnswer[i] === correctAnswer[i] ||
        keyboardColors.get(currentAnswer[i]) === 'correct'
      ) {
        keyboardColors.set(currentAnswer[i], 'correct');
        continue;
      }
      if (
        correctAnswer.includes(currentAnswer[i]) &&
        keyboardColors.get(currentAnswer[i]) !== 'correct'
      ) {
        keyboardColors.set(currentAnswer[i], 'misplaced');
        continue;
      } else {
        keyboardColors.set(currentAnswer[i], 'incorrect');
      }
    }

    return keyboardColors;
  }

  reset() {
    const stateClone = structuredClone(this.getState());
    stateClone.currentAnswer = '';
    stateClone.allAnswers = [];
    stateClone.isGameOver = false;
    this.generateRandomAnswer();
    this.saveState(stateClone);
  }
}
