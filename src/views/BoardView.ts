import { GameState } from '../types';
import {
  ROTATE_ROW_ANIMATION_DURATION,
  CELL_ANIMATION_OFFSET,
} from '../constants';

export class BoardView {
  private boardElement: HTMLElement;
  private previousAnswerLength: Map<number, number> = new Map();

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
      }, idx * CELL_ANIMATION_OFFSET);
    });
  }

  public animateLetterTyped(rowIndex: number, colIndex: number): void {
    const row = this.boardElement.querySelector(`[data-row-idx="${rowIndex}"]`);
    if (!row) return;

    const cell = row.querySelector(`[data-cell-idx="${colIndex}"]`);
    if (!cell) return;

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
    this.previousAnswerLength.clear();

    const cells = this.boardElement.querySelectorAll('.cell');

    cells.forEach((cell) => {
      cell.textContent = '';

      cell.classList.remove(
        'correct',
        'misplaced',
        'incorrect',
        'flip',
        'shake'
      );

      (cell as HTMLElement).style.removeProperty('background-color');
      (cell as HTMLElement).style.removeProperty('color');
      (cell as HTMLElement).style.removeProperty('border-color');

      cell.className = 'cell';
    });

    const gameOver = this.boardElement.querySelector('.modal');
    if (gameOver) {
      gameOver.remove();
    }
  }

  public showGameOver(state: GameState): void {
    this.removeModal();

    const modalElement = document.createElement('div');
    modalElement.classList.add('modal');

    const isWin =
      state.allAnswers[state.allAnswers.length - 1] === state.correctAnswer;

    const attempts = state.allAnswers.length;
    const attemptsText = attempts === 1 ? '1 attempt' : `${attempts} attempts`;

    const modalContent = `
      <div class="modal-content">
        ${
          isWin
            ? `<h2 class="victory">You won!</h2>
             <p>You solved the puzzle in ${attemptsText}.</p>`
            : `<h2 class="defeat">Game Over</h2>
             <p>The answer was: <strong>${state.correctAnswer.toUpperCase()}</strong></p>`
        }
        
        <div class="game-stats">
          <div class="stat">
            <span class="stat-value">${attempts}</span>
            <span class="stat-label">Tries</span>
          </div>
        
        </div>
        
        <div class="modal-buttons">
          <button id="play-again" class="secondary-button">Play Again</button>
          <button id="close-modal" class="secondary-button">Close</button>
        </div>
      </div>
    `;

    modalElement.innerHTML = modalContent;
    document.body.appendChild(modalElement);

    modalElement.querySelector('#play-again')?.addEventListener('click', () => {
      this.removeModal();
      document.dispatchEvent(new CustomEvent('gameReset'));
    });

    modalElement
      .querySelector('#close-modal')
      ?.addEventListener('click', () => {
        this.removeModal();
      });

    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        this.removeModal();
      }
    });
  }

  private removeModal(): void {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
      existingModal.remove();
    }
  }
}
