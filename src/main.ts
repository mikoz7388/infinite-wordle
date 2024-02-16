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
  const store = new Store('wordle');
  const view = new View();
  store.getStateFromLocalStorage();

  view.renderBoard(ROWS, COLS);
  view.createKeyboard();
  view.bindKeyboardClick((e) => {
    store.keyboardClickHandler(e);
  });
  view.bindKeyboard((e) => {
    store.keyDownHandler(e);
  });

  store.addEventListener('state-changed', () => {
    const state = store.getState();
    if (state.isGameOver) {
      setTimeout(() => view.showGameOver(state), 1500);
      return;
    }
    view.updateBoard(state.currentAnswer, state.allAnswers.length);
  });
  store.addEventListener('answer-submitted', () => {
    const state = store.getState();
    const rowIdx = state.allAnswers.length - 1;
    view.animateRotateRow(rowIdx);
    view.updateCellsColor(state, rowIdx);
    setTimeout(() => {
      view.updateKeyboard(state);
      store.isAnimationRunning = false;
    }, ROTATE_ROW_ANIMATION_DURATION * ROWS);
  });
  store.addEventListener('invalid-answer', () => {
    view.animateShakeRow(store.getState());
    setTimeout(() => (store.isAnimationRunning = false), 300);
  });

  store.addEventListener('local-storage-state-loaded', () => {
    const state = store.getState();

    for (let i = 0; i < state.allAnswers.length; i++) {
      view.updateBoard(state.allAnswers[i], i);
      setTimeout(() => {
        view.animateRotateRow(i);
        view.updateCellsColor(state, i);
      }, 120 * i);
    }
    setTimeout(() => {
      view.updateKeyboard(state);
      console.log('local-storage-state-loaded', state);
    }, ROTATE_ROW_ANIMATION_DURATION * (state.allAnswers.length + 2));
  });

  document
    .querySelector<HTMLButtonElement>('#reset')!
    .addEventListener('click', () => {
      store.reset();
      view.reset();
    });
}

window.addEventListener('load', init);
