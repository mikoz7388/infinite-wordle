import { COLS, ROTATE_ROW_ANIMATION_DURATION, ROWS } from './CONSTS';
import { Store } from './store';
import './style.css';
import { View } from './view';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  <header> <h1>Wordle</h1> 
  <button id="reset">Reset</button>
  </header>
    <div id="board"></div>
    <div id="keyboard"></div>
  </div>
`;

function init() {
  const store = new Store();
  const view = new View();

  store.generateRandomAnswer();
  view.renderBoard(ROWS, COLS);
  view.createKeyboard();
  view.bindKeyboardClick((e) => {
    store.keyboardClickHandler(e);
  });
  view.bindKeyboard((e) => {
    store.keyDownHandler(e);
  });

  store.addEventListener('state-changed', () => {
    if (store.getState().isGameOver) {
      setTimeout(() => view.showGameOver(store.getState()), 1500);
      return;
    }
    view.updateBoard(store.getState());
  });
  store.addEventListener('answer-submitted', () => {
    view.animateRotateRow(store.getState().allAnswers.length - 1);
    view.updateCellsColor(store.getState());
    setTimeout(() => {
      view.updateKeyboard(store.getState());
      store.isAnimationRunning = false;
    }, ROTATE_ROW_ANIMATION_DURATION * ROWS);
  });
  store.addEventListener('invalid-answer', () => {
    view.animateShakeRow(store.getState());
    setTimeout(() => (store.isAnimationRunning = false), 300);
  });

  document
    .querySelector<HTMLButtonElement>('#reset')!
    .addEventListener('click', () => {
      store.reset();
      view.reset();
    });
}

window.addEventListener('load', init);
