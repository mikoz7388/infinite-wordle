import { COLS, ROWS } from './CONSTS';
import { Store } from './store';
import './style.css';
import { View } from './view';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  <header> <h1>Wordle</h1> 
  <button id="reset">Reset</button>
  </header>
    <div id="game"></div>
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

  store.addEventListener('statechanged', () => {
    view.updateBoard(store.getState());
  });
  store.addEventListener('answersubmitted', () => {
    view.updateScreenKeyboardColors(store.getState());
  });
}

window.addEventListener('load', init);
