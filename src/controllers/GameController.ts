import { GameModel } from '../models/GameModel';
import { GameView } from '../views/GameView';
import { GameEvent } from '../types';
import {
  CELL_ANIMATION_OFFSET,
  ROTATE_ROW_ANIMATION_DURATION,
} from '../constants';

export class GameController {
  private model: GameModel;
  private view: GameView;
  private timeouts: NodeJS.Timeout[] = [];

  constructor(model: GameModel, view: GameView) {
    this.model = model;
    this.view = view;
    this.bindEvents();

    document.addEventListener('gameReset', () => {
      this.model.isAnimationRunning = true;
      this.clearAllTimeouts();

      this.model.reset();
      this.view.reset();

      setTimeout(() => {
        this.model.isAnimationRunning = false;
      }, 100);
    });
  }

  public init(): void {
    this.view.renderBoard();
    this.view.createKeyboard();
  }

  private bindEvents(): void {
    this.bindUserInputEvents();
    this.bindModelEvents();
  }

  private bindUserInputEvents(): void {
    this.view.on('keydown', (e: KeyboardEvent) => {
      if (this.isInteractionDisabled()) return;
      this.handleKeyInput(e.key);
    });

    this.view.bindKeyboardClick(this.handleKeyboardClick.bind(this));

    this.view.on('reset', (e: Event) => {
      if (e && e.target instanceof HTMLElement) {
        e.target.blur();
      } else {
        const resetButton = document.getElementById('reset');
        if (resetButton) resetButton.blur();
      }

      this.clearAllTimeouts();

      this.model.reset();
      this.view.reset();
    });
  }

  private bindModelEvents(): void {
    this.model.on(GameEvent.STATE_CHANGED, () => {
      const state = this.model.getState();

      if (state.isGameOver) {
        setTimeout(() => this.view.showGameOver(state), 1500);
        return;
      }

      this.view.updateBoard(state.currentAnswer, state.allAnswers.length);
    });

    this.model.on(GameEvent.ANSWER_SUBMITTED, () => {
      const state = this.model.getState();
      const rowIdx = state.allAnswers.length - 1;

      this.view.animateRotateRow(rowIdx);
      this.view.updateCellsColor(state, rowIdx);

      this.scheduleKeyboardUpdate(
        ROTATE_ROW_ANIMATION_DURATION + CELL_ANIMATION_OFFSET * 5
      );
    });

    this.model.on(GameEvent.INVALID_ANSWER, () => {
      this.view.animateShakeRow(this.model.getState());
      this.releaseAnimationLock(300);
    });

    this.model.on(GameEvent.LOCAL_STORAGE_STATE_LOADED, () => {
      this.handleStateLoaded();
    });
  }

  private handleKeyInput(key: string): void {
    if (key === 'Enter') {
      this.model.submitAnswer();
    } else {
      this.model.updateCurrentAnswer(key);
    }
  }

  private handleKeyboardClick(e: MouseEvent): void {
    if (this.isInteractionDisabled()) return;

    const target = e.target as HTMLElement;
    if (!target) return;

    if (target.tagName === 'svg' || target.tagName === 'path') {
      this.model.updateCurrentAnswer('Backspace');
      return;
    }

    if (target.tagName !== 'BUTTON') return;

    const key = target.dataset.key;
    if (!key) return;

    this.handleKeyInput(key);
  }

  private isInteractionDisabled(): boolean {
    return this.model.isAnimationRunning || this.model.getState().isGameOver;
  }

  private scheduleKeyboardUpdate(delay: number): void {
    const timeout = setTimeout(() => {
      this.view.updateKeyboard(this.model.getState());
      this.releaseAnimationLock(0);
    }, delay);
    this.timeouts.push(timeout);
  }

  private releaseAnimationLock(delay: number): void {
    const timeout = setTimeout(() => {
      this.model.isAnimationRunning = false;
    }, delay);
    this.timeouts.push(timeout);
  }

  private handleStateLoaded(): void {
    const state = this.model.getState();
    const answersCount = state.allAnswers.length;

    for (let i = 0; i < answersCount; i++) {
      this.view.updateBoard(state.allAnswers[i], i);

      const animationDelay = 120 * i;
      const timeout = setTimeout(() => {
        this.view.animateRotateRow(i);
        this.view.updateCellsColor(state, i);
      }, animationDelay);
      this.timeouts.push(timeout);
    }

    const totalDelay = ROTATE_ROW_ANIMATION_DURATION * (answersCount + 2);
    const timeout = setTimeout(() => {
      this.view.updateKeyboard(state);
    }, totalDelay);
    this.timeouts.push(timeout);
  }

  private clearAllTimeouts(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
  }
}
