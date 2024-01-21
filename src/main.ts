import { COLS, ROWS } from './CONSTS';
import { Store } from './store';
import './style.css';
import { View } from './view';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  <button id="reset">Reset</button>
    <h1>wordle</h1>
    <div id="game"></div>
    <div id="keyboard"></div>
  </div>
`;

function init() {
  const store = new Store();
  const view = new View();

  store.generateRandomAnswer();
  view.renderBoard(ROWS, COLS, store.getState());

  store.addEventListener('statechanged', () => {
    view.renderBoard(ROWS, COLS, store.getState());
  });
  window.addEventListener('keydown', (e) => {
    store.keyDownHandler(e);
  });
}

window.addEventListener('load', init);
