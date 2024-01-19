import { COLS, ROWS } from './CONSTS';
import { Store } from './store';
import './style.css'
import { View } from './view';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>wordle</h1>
    <div id="game"></div>
    <div id="keyboard"></div>
  </div>
`

function init() {
 
  const store = new Store();
  const view = new View();

  view.renderBoard(ROWS,COLS);
}



window.addEventListener("load", init);