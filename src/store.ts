type gameState = { currentAnswer: string; allAnswers: string[] };

let testState: gameState = {
  currentAnswer: '',
  allAnswers: ['test'],
};

const initialState: gameState = {
  currentAnswer: '',
  allAnswers: [],
};

export class Store {
  constructor(private storageKey = 'wordle') {
    this.storageKey = storageKey;
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
  }

  getState(): gameState {
    return testState;
    // const item = window.localStorage.getItem(this.storageKey);
    // return item ? JSON.parse(item) : initialState;
  }

  keyDownHandler(e: KeyboardEvent) {
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
            prevState.currentAnswer += answer.toLowerCase();
            return prevState;
          });
        }
    }

    // this.saveState((prevState) => {
    //   if (prevState.currentAnswer.length < 5) {
    //     prevState.currentAnswer += answer;
    //     console.log(this.getState());
    //     return prevState;
    //   }
    //   throw new Error('Answer is too long');
    // });
  }
}
