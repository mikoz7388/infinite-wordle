import { GameModel } from '../models/GameModel';
import { GameView } from '../views/GameView';
import { GameEvent } from '../types';
import { ROTATE_ROW_ANIMATION_DURATION, ROWS } from '../constants';

export class GameController {
  private model: GameModel;
  private view: GameView;

  constructor(model: GameModel, view: GameView) {
    this.model = model;
    this.view = view;
    this.bindEvents();
  }

  /**
   * Initialize the application
   */
  public init(): void {
    this.view.renderBoard();
    this.view.createKeyboard();
  }

  /**
   * Bind all event handlers between model and view
   */
  private bindEvents(): void {
    this.bindUserInputEvents();
    this.bindModelEvents();
  }

  /**
   * Handle user input events from the view
   */
  private bindUserInputEvents(): void {
    // Handle keyboard input
    this.view.on('keypress', (e: KeyboardEvent) => {
      if (this.isInteractionDisabled()) return;
      this.handleKeyInput(e.key);
    });

    // Handle on-screen keyboard clicks
    this.view.bindKeyboardClick(this.handleKeyboardClick.bind(this));

    // Handle game reset
    this.view.on('reset', () => {
      console.log('to jest racja');
      this.model.reset();
      this.view.reset();
    });
  }

  /**
   * Handle events emitted by the model
   */
  private bindModelEvents(): void {
    // Handle state changes
    this.model.on(GameEvent.STATE_CHANGED, () => {
      const state = this.model.getState();

      if (state.isGameOver) {
        setTimeout(() => this.view.showGameOver(state), 1500);
        return;
      }

      this.view.updateBoard(state.currentAnswer, state.allAnswers.length);
    });

    // Handle submitted answers
    this.model.on(GameEvent.ANSWER_SUBMITTED, () => {
      const state = this.model.getState();
      const rowIdx = state.allAnswers.length - 1;

      this.view.animateRotateRow(rowIdx);
      this.view.updateCellsColor(state, rowIdx);

      this.scheduleKeyboardUpdate(ROTATE_ROW_ANIMATION_DURATION * ROWS);
    });

    // Handle invalid answers
    this.model.on(GameEvent.INVALID_ANSWER, () => {
      this.view.animateShakeRow(this.model.getState());
      this.releaseAnimationLock(300);
    });

    // Handle loading from local storage
    this.model.on(GameEvent.LOCAL_STORAGE_STATE_LOADED, () => {
      this.handleStateLoaded();
    });
  }

  /**
   * Process keyboard input from any source
   */
  private handleKeyInput(key: string): void {
    if (key === 'Enter') {
      this.model.submitAnswer();
    } else {
      this.model.updateCurrentAnswer(key);
    }
  }

  /**
   * Handle clicks on the on-screen keyboard
   */
  private handleKeyboardClick(e: MouseEvent): void {
    if (this.isInteractionDisabled()) return;

    const target = e.target as HTMLElement;
    if (!target) return;

    // Handle SVG backspace icon
    if (target.tagName === 'svg' || target.tagName === 'path') {
      this.model.updateCurrentAnswer('Backspace');
      return;
    }

    // Handle regular buttons
    if (target.tagName !== 'BUTTON') return;

    const key = target.dataset.key;
    if (!key) return;

    this.handleKeyInput(key);
  }

  /**
   * Check if user interaction should be blocked
   */
  private isInteractionDisabled(): boolean {
    return this.model.isAnimationRunning || this.model.getState().isGameOver;
  }

  /**
   * Schedule keyboard update after animation completes
   */
  private scheduleKeyboardUpdate(delay: number): void {
    setTimeout(() => {
      this.view.updateKeyboard(this.model.getState());
      this.releaseAnimationLock(0);
    }, delay);
  }

  /**
   * Release animation lock after specified delay
   */
  private releaseAnimationLock(delay: number): void {
    setTimeout(() => {
      this.model.isAnimationRunning = false;
    }, delay);
  }

  /**
   * Handle state loaded from local storage
   */
  private handleStateLoaded(): void {
    const state = this.model.getState();
    const answersCount = state.allAnswers.length;

    // Animate each row sequentially
    for (let i = 0; i < answersCount; i++) {
      this.view.updateBoard(state.allAnswers[i], i);

      const animationDelay = 120 * i;
      setTimeout(() => {
        this.view.animateRotateRow(i);
        this.view.updateCellsColor(state, i);
      }, animationDelay);
    }

    // Update keyboard once all animations are complete
    const totalDelay = ROTATE_ROW_ANIMATION_DURATION * (answersCount + 2);
    setTimeout(() => {
      this.view.updateKeyboard(state);
    }, totalDelay);
  }
}
