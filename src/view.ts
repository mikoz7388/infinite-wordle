import {
  COLS,
  DeleteIcon,
  QWERTY,
  ROTATE_ROW_ANIMATION_DURATION,
  ROWS,
} from './CONSTS';
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
        this.changeCellColor(cell, 'empty');
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
        this.changeCellColor(cell, 'tbd');
        return;
      }
      cell.innerHTML = '';
      this.changeCellColor(cell, 'empty');
    });
  }
  animateLetterEntered(cell: HTMLDivElement) {
    cell.style.animationName = 'letterEntered';
    cell.style.animationDuration = '100ms';
    cell.style.animationTimingFunction = 'ease-out';

    setTimeout(() => clearAnimation(cell, 'letterEntered'), 200);
  }

  createKeyboard() {
    this.keyboard.innerHTML = '';
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

  updateKeyboard({ keyboardColors }: gameState) {
    const keyboard =
      this.keyboard.querySelectorAll<HTMLButtonElement>('button');
    keyboard.forEach((key) => {
      if (!key.textContent || key.textContent.length > 1) return;
      key.setAttribute(
        'data-state',
        keyboardColors.get([key.textContent][0].toLowerCase()) || 'tbd'
      );
    });
  }

  animateRotateRow(index: number) {
    const row = this.board.children[index];
    const cells = row.querySelectorAll<HTMLDivElement>('.cell');

    cells.forEach((cell, index) => {
      const animationDuration = ROTATE_ROW_ANIMATION_DURATION * index;
      cell.style.animationName = 'rotateRow';
      cell.style.animationDuration = `${ROTATE_ROW_ANIMATION_DURATION}ms`;
      cell.style.animationTimingFunction = 'ease-out';
      cell.style.animationDelay = `${animationDuration}ms`;
      setTimeout(() => clearAnimation(cell, 'rotateRow'), 1500);
    });
  }

  updateCellsColor({ allAnswers, correctAnswer }: gameState) {
    const rows = this.board.querySelectorAll<HTMLDivElement>('.row');
    const cells =
      rows[allAnswers.length - 1].querySelectorAll<HTMLDivElement>('.cell');

    const prevAnswer = allAnswers.at(-1);
    if (!prevAnswer) throw new Error('prevAnswer is undefined');
    cells.forEach((cell, index) => {
      const animationDuration =
        ROTATE_ROW_ANIMATION_DURATION * index +
        ROTATE_ROW_ANIMATION_DURATION / 2;
      if (prevAnswer[index] === correctAnswer[index]) {
        setTimeout(
          () => this.changeCellColor(cell, 'correct'),
          animationDuration
        );

        return;
      }
      if (correctAnswer.includes(prevAnswer[index])) {
        setTimeout(
          () => this.changeCellColor(cell, 'misplaced'),
          animationDuration
        );
        return;
      }
      setTimeout(
        () => this.changeCellColor(cell, 'incorrect'),
        animationDuration
      );
    });
  }

  changeCellColor(
    cell: HTMLDivElement,
    state: 'tbd' | 'empty' | 'correct' | 'incorrect' | 'misplaced'
  ) {
    cell.setAttribute('data-state', state);
  }

  animateShakeRow({ allAnswers }: gameState) {
    const rows = document.querySelectorAll<HTMLDivElement>('.row');
    const row = rows[allAnswers.length];
    row.style.animationName = 'shakeRow';
    row.style.animationDuration = '200ms';
    row.style.animationTimingFunction = 'ease-out';

    setTimeout(() => clearAnimation(row, 'shakeRow'), 500);
  }

  showGameOver({ correctAnswer }: gameState) {
    const modal = document.createElement('modal');
    modal.innerHTML = `
    <div class="modal">
      <h2>Game Over</h2>
      <p>The correct answer was ${correctAnswer}</p>
      <button>Close</button>
    </div>
  `;
    document.body.appendChild(modal);
    modal.querySelector('button')!.addEventListener('click', () => {
      modal.remove();
    });
  }

  reset() {
    this.createKeyboard();
    this.renderBoard(ROWS, COLS);
  }
}
