import { COLS, ROWS } from './CONSTS';
import { gameState } from './store';

export class View {
  game: HTMLDivElement = document.querySelector('#game')!;
  keyboard: HTMLDivElement = document.querySelector('#keyboard')!;

  renderBoard(rows: number, cols: number, state: gameState) {
    this.game.innerHTML = '';
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
      }
      this.game.appendChild(row);
    }
    this.fillCells(this.game, state);
  }
  bindKeyBoard(handler: (e: KeyboardEvent) => void) {
    window.addEventListener('keydown', handler);
  }
  bindKeyBoardClick(handler: (e: MouseEvent) => void) {
    this.keyboard.addEventListener('click', handler);
  }

  fillCells(game: HTMLDivElement, state: gameState) {
    const cells = this.game.querySelectorAll('.cell');
    console.log(cells[0]);
    const answers = state.allAnswers.concat(state.currentAnswer);
    console.log(answers);

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        cells[i];
      }
    }
  }
}
