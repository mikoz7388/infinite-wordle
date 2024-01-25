import { DeleteIcon, QWERTY } from './CONSTS';
import { gameState } from './store';
import { clearAnimation } from './utils';

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
        cell.setAttribute('data-state', 'empty');
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
    const rows = this.board.querySelectorAll<HTMLDivElement>('.row');
    const cells = Array.from(
      rows[state.allAnswers.length].querySelectorAll<HTMLDivElement>('.cell')
    );

    cells.forEach((cell, index) => {
      if (index === state.currentAnswer.length - 1 && cell.innerHTML === '') {
        this.animateLetterEntered(cell);
      }
      if (state.currentAnswer[index]) {
        cell.innerHTML = state.currentAnswer[index];
        cell.setAttribute('data-state', 'tbd');
        return;
      }
      cell.innerHTML = '';
      cell.setAttribute('data-state', 'empty');
    });
  }
  animateLetterEntered(cell: HTMLDivElement) {
    cell.style.animationName = 'letterEntered';
    cell.style.animationDuration = '100ms';
    cell.style.animationTimingFunction = 'ease-out';

    setTimeout(() => clearAnimation(cell), 200);
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
    // const keys = this.keyboard.querySelectorAll('button');
    return state;
  }

  animateShakeRow({ allAnswers }: gameState) {
    const rows = document.querySelectorAll<HTMLDivElement>('.row');
    const row = rows[allAnswers.length];
    row.style.animationName = 'shakeRow';
    row.style.animationDuration = '200ms';
    row.style.animationTimingFunction = 'ease-out';

    setTimeout(() => {
      clearAnimation(row);
    }, 500);
  }
}
