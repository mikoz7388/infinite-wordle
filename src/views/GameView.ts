import { GameState } from '../types';
import { BoardView } from './BoardView';
import { KeyboardView } from './KeyboardView';
import { COLS, ROWS } from '../constants';
import { EventEmitter, EventMap } from '../utils/eventEmitter';

interface ViewEvents extends EventMap {
  keypress: KeyboardEvent;
  reset: void;
  click: MouseEvent;
}

export class GameView extends EventEmitter<ViewEvents> {
  private boardView: BoardView;
  private keyboardView: KeyboardView;
  private appElement: HTMLElement;

  constructor(appElement: HTMLElement) {
    super();
    this.appElement = appElement;

    // Set up HTML structure
    this.appElement.innerHTML = `
      <div>
        <header>
          <h1>Wordle</h1> 
          <button id="reset">Reset</button>
        </header>
        <div id="board"></div>
        <div id="keyboard"></div>
      </div>
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
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.emit('keypress', e);
    });

    // Reset button
    const resetButton = this.appElement.querySelector('#reset');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.emit('reset');
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
