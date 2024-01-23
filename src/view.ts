import { COLS, DeleteIcon, QWERTY, ROWS } from './CONSTS';
import { gameState } from './store';

export class View {
  game: HTMLDivElement = document.querySelector('#game')!;
  keyboard: HTMLDivElement = document.querySelector('#keyboard')!;

  renderBoard(rows: number, cols: number) {
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
  }
  bindKeyboard(handler: (e: KeyboardEvent) => void) {
    window.addEventListener('keydown', handler);
  }
  bindKeyboardClick(handler: (e: MouseEvent) => void) {
    this.keyboard.addEventListener('click', handler);
  }

  fillCells(game: HTMLDivElement, state: gameState) {
    const cells = game.querySelectorAll('.cell');

    const answersString = state.allAnswers.concat(state.currentAnswer).join('');

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const cellIndex = i * COLS + j;
        if (cellIndex >= state.allAnswers.length * COLS)
          cells[i * COLS + j].innerHTML = answersString[i * COLS + j] || '';
      }
    }
    console.log('fillCells', answersString);
  }

  updateBoard(state: gameState) {
    this.fillCells(this.game, state);
    state.isGameOver ? alert('Game Over!') : null;
  }
  createKeyboard() {
    QWERTY.forEach((row, index) => {
      const keyboardRow = document.createElement('div');
      for (const letter of row) {
        const key = document.createElement('button');
        key.textContent = letter.toUpperCase();

        keyboardRow.appendChild(key);
      }
      if (index === QWERTY.length - 1) {
        const enterKey = document.createElement('button');
        enterKey.textContent = 'Enter';
        keyboardRow.prepend(enterKey);

        const deleteKey = document.createElement('button');
        deleteKey.textContent = 'Backspace';
        deleteKey.innerHTML = DeleteIcon;
        keyboardRow.appendChild(deleteKey);
      }
      this.keyboard.appendChild(keyboardRow);
    });
  }

  updateScreenKeyboardColors(state: gameState) {
    const keys = this.keyboard.querySelectorAll('button');
    console.log(keys[1].textContent);
    return state;
  }
}
