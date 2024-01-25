import { COLS, DeleteIcon, QWERTY, ROWS } from './CONSTS';
import { gameState } from './store';

export class View {
  private board: HTMLDivElement;
  private keyboard: HTMLDivElement;

  constructor() {
    const board = document.querySelector<HTMLDivElement>('#board');
    const keyboard = document.querySelector<HTMLDivElement>('#keyboard');
    if (!board || !keyboard) {
      throw new Error('No element with id board or keyboard');
    }
    this.board = board;
    this.keyboard = keyboard;
  }
  renderBoard(rows: number, cols: number) {
    this.board.innerHTML = '';
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
      }
      this.board.appendChild(row);
    }
  }
  bindKeyboard(handler: (e: KeyboardEvent) => void) {
    window.addEventListener('keydown', handler);
  }
  bindKeyboardClick(handler: (e: MouseEvent) => void) {
    this.keyboard.addEventListener('click', handler);
  }

  updateBoard(state: gameState) {
    const cells = this.board.querySelectorAll('.cell');

    const answersString = state.allAnswers.concat(state.currentAnswer).join('');
    console.log('answersString', answersString);
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const cellIndex = i * COLS + j - 1;
        if (cellIndex >= state.allAnswers.length * COLS)
          cells[cellIndex].innerHTML = answersString[cellIndex] || '';
      }
    }
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

  animateShakeRow({ allAnswers }: gameState) {
    const rows = document.querySelectorAll('.row');
    const currentRow = allAnswers.length;
    rows[currentRow].classList.add('shake');
    setTimeout(() => {
      rows[currentRow].classList.remove('shake');
    }, 500);
  }
}
