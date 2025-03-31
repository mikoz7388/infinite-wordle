import { GameState } from '../types';
import {
  ROTATE_ROW_ANIMATION_DURATION,
  CELL_ANIMATION_OFFSET,
} from '../constants';

export class BoardView {
  private boardElement: HTMLElement;
  private previousAnswerLength: Map<number, number> = new Map(); // Track previous answer length per row

  constructor(boardElement: HTMLElement) {
    this.boardElement = boardElement;
  }

  public renderBoard(rows: number, cols: number): void {
    this.boardElement.innerHTML = '';

    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      row.dataset.rowIdx = i.toString();

      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.cellIdx = j.toString();
        row.appendChild(cell);
      }

      this.boardElement.appendChild(row);
    }
  }

  public updateBoard(currentAnswer: string, rowIndex: number): void {
    const row = this.boardElement.querySelector(`[data-row-idx="${rowIndex}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('.cell');

    const prevLength = this.previousAnswerLength.get(rowIndex) || 0;

    const isLetterAdded = currentAnswer.length > prevLength;

    this.previousAnswerLength.set(rowIndex, currentAnswer.length);

    cells.forEach((cell) => {
      cell.textContent = '';
    });

    for (let i = 0; i < currentAnswer.length; i++) {
      if (cells[i]) {
        cells[i].textContent = currentAnswer[i].toUpperCase();

        if (i === currentAnswer.length - 1 && isLetterAdded) {
          this.animateLetterTyped(rowIndex, i);
        }
      }
    }
  }

  public animateShakeRow(state: GameState): void {
    const currentRowIdx = state.allAnswers.length;
    const row = this.boardElement.querySelector(
      `[data-row-idx="${currentRowIdx}"]`
    );
    if (!row) return;

    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 300);
  }

  public animateRotateRow(rowIdx: number): void {
    const row = this.boardElement.querySelector(`[data-row-idx="${rowIdx}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('.cell');

    cells.forEach((cell, idx) => {
      setTimeout(() => {
        cell.classList.add('flip');
      }, idx * CELL_ANIMATION_OFFSET); // Use offset instead of full duration
    });
  }

  public animateLetterTyped(rowIndex: number, colIndex: number): void {
    const row = this.boardElement.querySelector(`[data-row-idx="${rowIndex}"]`);
    if (!row) return;

    const cell = row.querySelector(`[data-cell-idx="${colIndex}"]`);
    if (!cell) return;

    // Add animation class
    cell.classList.add('letter-typed');

    setTimeout(() => {
      cell.classList.remove('letter-typed');
    }, 250);
  }

  public updateCellsColor(state: GameState, rowIdx: number): void {
    const row = this.boardElement.querySelector(`[data-row-idx="${rowIdx}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('.cell');
    const answer = state.allAnswers[rowIdx];
    const correctAnswer = state.correctAnswer;

    if (!answer) return;

    cells.forEach((cell, i) => {
      setTimeout(() => {
        // Add color exactly at the midpoint of the animation (when cell is "flipped")
        setTimeout(() => {
          if (answer[i] === correctAnswer[i]) {
            cell.classList.add('correct');
          } else if (correctAnswer.includes(answer[i])) {
            cell.classList.add('misplaced');
          } else {
            cell.classList.add('incorrect');
          }
        }, ROTATE_ROW_ANIMATION_DURATION / 2);
      }, i * CELL_ANIMATION_OFFSET);
    });
  }

  public reset(): void {
    // Clear the answer length tracking
    this.previousAnswerLength.clear();

    // Get all cells
    const cells = this.boardElement.querySelectorAll('.cell');

    // Reset each cell's content and styling
    cells.forEach((cell) => {
      // Clear content
      cell.textContent = '';

      // Reset styling - remove all state classes
      cell.classList.remove(
        'correct',
        'misplaced',
        'incorrect',
        'flip',
        'shake'
      );

      // Make sure cell is visible and properly styled
      (cell as HTMLElement).style.removeProperty('background-color');
      (cell as HTMLElement).style.removeProperty('color');
      (cell as HTMLElement).style.removeProperty('border-color');

      // Reset cell to its initial styling
      cell.className = 'cell';
    });

    // Clear any game over screens if present
    const gameOver = this.boardElement.querySelector('.modal');
    if (gameOver) {
      gameOver.remove();
    }
  }

  public showGameOver(state: GameState): void {
    const modalElement = document.createElement('div');
    modalElement.classList.add('modal');

    const message =
      state.allAnswers[state.allAnswers.length - 1] === state.correctAnswer
        ? 'Congratulations!'
        : `The answer was: ${state.correctAnswer.toUpperCase()}`;

    modalElement.innerHTML = `
      <div class="modal-content">
        <h2>${message}</h2>
        <button id="play-again">Play Again</button>
      </div>
    `;

    document.body.appendChild(modalElement);

    document.querySelector('#play-again')?.addEventListener('click', () => {
      modalElement.remove();
      // The controller will handle the reset
      document.querySelector('#reset')?.dispatchEvent(new Event('click'));
    });
  }
}
