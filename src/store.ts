import { ROWS } from './CONSTS';
import { words } from './words';

export type gameState = {
  isGameOver: boolean;
  currentAnswer: string;
  correctAnswer: string;
  allAnswers: string[];
  keyboardColors: Map<string, 'correct' | 'incorrect' | 'misplaced'>;
};

export class Store extends EventTarget {
  private storageKey = 'wordle';
  public state: gameState;
  public isAnimationRunning = false;
  private defaultState: gameState = {
    isGameOver: false,
    correctAnswer: '',
    currentAnswer: '',
    allAnswers: [],
    keyboardColors: new Map(),
  };

  constructor(storageKey: string) {
    super();
    this.storageKey = storageKey;
    this.state = this.defaultState;
    this.state.correctAnswer = this.generateRandomAnswer();

    const localStorageState = this.getStateFromLocalStorage();
    if (localStorageState) {
      this.syncState(localStorageState);
    }
  }

  syncState({
    allAnswers,
    correctAnswer,
  }: {
    allAnswers: string[];
    correctAnswer: string;
  }) {
    this.state.allAnswers = allAnswers;
    this.state.correctAnswer = correctAnswer;

    for (const answer of allAnswers) {
      this.state.keyboardColors = this.updateScreenKeyboardColors(
        answer,
        correctAnswer
      );
    }
    setTimeout(
      () => this.dispatchEvent(new Event('local-storage-state-loaded')),
      0
    );
  }

  saveState(state: gameState) {
    if (!state) throw new Error('Invalid argument passed to saveState');

    this.state = state;
    this.saveStateToLocalStorage(state);
    this.dispatchEvent(new Event('state-changed'));
  }

  saveStateToLocalStorage({ allAnswers, correctAnswer }: gameState) {
    const state = { allAnswers, correctAnswer };
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  getStateFromLocalStorage(): {
    allAnswers: string[];
    correctAnswer: string;
  } | null {
    const item = window.localStorage.getItem(this.storageKey);
    if (!item) return null;
    const { allAnswers, correctAnswer } = JSON.parse(item);
    return { allAnswers, correctAnswer };
  }

  getState(): gameState {
    return this.state;
  }

  keyDownHandler(e: KeyboardEvent) {
    if (this.getState().isGameOver || this.isAnimationRunning) return;
    if (e.key === 'Enter') {
      this.submitAnswer();
      return;
    }
    this.updateCurrentAnswer(e.key);
    console.log(this.getState());
  }

  keyboardClickHandler(e: MouseEvent) {
    if (this.getState().isGameOver || this.isAnimationRunning) return;
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
    if (this.isAnimationRunning) return;
    this.isAnimationRunning = true;

    const stateClone = structuredClone(this.getState());
    if (!this.isCurrentAnswerInWords()) {
      this.dispatchEvent(new Event('invalid-answer'));
      return;
    }

    stateClone.keyboardColors = this.updateScreenKeyboardColors(
      stateClone.currentAnswer,
      stateClone.correctAnswer
    );
    stateClone.allAnswers.push(stateClone.currentAnswer);
    stateClone.isGameOver = this.isGameOver(stateClone);
    stateClone.currentAnswer = '';
    this.saveState(stateClone);
    this.dispatchEvent(new Event('answer-submitted'));
  }

  isGameOver({ correctAnswer, currentAnswer, allAnswers }: gameState) {
    console.log(correctAnswer, currentAnswer, allAnswers);
    if (correctAnswer === currentAnswer || allAnswers.length === ROWS) {
      return true;
    }

    return false;
  }

  isCurrentAnswerInWords() {
    const { currentAnswer } = this.getState();
    if (currentAnswer.length !== 5) return false;
    return words.includes(currentAnswer);
  }

  generateRandomAnswer() {
    return words[Math.floor(Math.random() * words.length)];
  }

  updateScreenKeyboardColors(currentAnswer: string, correctAnswer: string) {
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
    stateClone.keyboardColors = new Map();
    stateClone.isGameOver = false;
    stateClone.correctAnswer = this.generateRandomAnswer();
    this.saveState(stateClone);
  }
}
