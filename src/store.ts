export type gameState = { currentAnswer: string; allAnswers: string[] };

let testState: gameState = {
  currentAnswer: '',
  allAnswers: [],
};

const initialState: gameState = {
  currentAnswer: '',
  allAnswers: [],
};

export class Store extends EventTarget {
  private storageKey = 'wordle';

  constructor(storageKey?: string) {
    super();
    if (storageKey) this.storageKey = storageKey;
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
    testState = newState;
    console.log(testState);
    this.dispatchEvent(new Event('statechanged'));
  }

  getState(): gameState {
    return testState;
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

  updateCurrentAnswer(answer: string) {
    const regex = /[a-z]/i;

    switch (answer) {
      case 'Backspace':
        this.saveState((prevState) => {
          prevState.currentAnswer = prevState.currentAnswer.slice(0, -1);
          return prevState;
        });
        break;
      default:
        if (answer.length > 1) return;
        if (regex.test(answer)) {
          this.saveState((prevState) => {
            if (prevState.currentAnswer.length < 5)
              prevState.currentAnswer += answer.toLowerCase();
            return prevState;
          });
        }
    }
  }
  submitAnswer() {
    if (this.getState().currentAnswer.length !== 5) return;
    this.saveState((prevState) => {
      prevState.allAnswers.push(prevState.currentAnswer);
      prevState.currentAnswer = '';
      return prevState;
    });
  }
}
