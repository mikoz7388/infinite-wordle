import { GameState } from '../types';
import { BoardView } from './BoardView';
import { KeyboardView } from './KeyboardView';
import { COLS, ROWS } from '../constants';
import { EventEmitter, EventMap } from '../utils/eventEmitter';

interface ViewEvents extends EventMap {
  keydown: KeyboardEvent;
  reset: Event;
  click: MouseEvent;
}

export class GameView extends EventEmitter<ViewEvents> {
  private boardView: BoardView;
  private keyboardView: KeyboardView;
  private appElement: HTMLElement;

  constructor(appElement: HTMLElement) {
    super();
    this.appElement = appElement;

    this.appElement.innerHTML = `
        <header>
          <div></div>
          <h1>Wordle</h1> 
          <div>
            <button id="reset" class="reset-button" aria-label="Reset Game">
              <svg fill="#FFFFFF"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="64px" viewBox="-105.78 -105.78 740.48 740.48" xml:space="preserve" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke="#FFFFFF" stroke-width="10.57838"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M70.846,324.059c3.21,3.926,8.409,3.926,11.619,0l69.162-84.621c3.21-3.926,1.698-7.108-3.372-7.108h-36.723 c-5.07,0-8.516-4.061-7.427-9.012c18.883-85.995,95.625-150.564,187.207-150.564c105.708,0,191.706,85.999,191.706,191.706 c0,105.709-85.998,191.707-191.706,191.707c-12.674,0-22.95,10.275-22.95,22.949s10.276,22.949,22.95,22.949 c131.018,0,237.606-106.588,237.606-237.605c0-131.017-106.589-237.605-237.606-237.605 c-116.961,0-214.395,84.967-233.961,196.409c-0.878,4.994-5.52,9.067-10.59,9.067H5.057c-5.071,0-6.579,3.182-3.373,7.108 L70.846,324.059z"></path> </g> </g> </g></svg>     </button>
          </div>
        </header>
        <div id="board"></div>
        <div id="keyboard"></div>
    `;

    const boardElement = this.appElement.querySelector('#board') as HTMLElement;
    const keyboardElement = this.appElement.querySelector(
      '#keyboard'
    ) as HTMLElement;

    this.boardView = new BoardView(boardElement);
    this.keyboardView = new KeyboardView(keyboardElement);

    this.initEventListeners();
  }

  private initEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.emit('keydown', e);
    });

    const resetButton = this.appElement.querySelector('#reset');
    if (resetButton) {
      resetButton.addEventListener('click', (e) => {
        resetButton.classList.add('spinning');

        setTimeout(() => {
          resetButton.classList.remove('spinning');
        }, 500);

        this.emit('reset', e);
      });
    }
  }

  public renderBoard(): void {
    this.boardView.renderBoard(ROWS, COLS);
  }

  public createKeyboard(): void {
    this.keyboardView.createKeyboard();
  }

  public bindKeyboardClick(handler: (e: MouseEvent) => void): void {
    this.keyboardView.bindKeyboardClick(handler);
  }

  public updateBoard(currentAnswer: string, rowIndex: number): void {
    this.boardView.updateBoard(currentAnswer, rowIndex);
  }

  public animateShakeRow(state: GameState): void {
    this.boardView.animateShakeRow(state);
  }

  public animateRotateRow(rowIdx: number): void {
    this.boardView.animateRotateRow(rowIdx);
  }

  public updateCellsColor(state: GameState, rowIdx: number): void {
    this.boardView.updateCellsColor(state, rowIdx);
  }

  public updateKeyboard(state: GameState): void {
    this.keyboardView.updateKeyboard(state);
  }

  public showGameOver(state: GameState): void {
    this.boardView.showGameOver(state);
  }

  public reset(): void {
    this.boardView.reset();
    this.keyboardView.reset();
  }
}
