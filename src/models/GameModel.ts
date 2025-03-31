import { GameState, GameEvent } from '../types';
import { StorageService } from '../services/StorageService';
import { words } from '../words';
import { EventEmitter, EventMap } from '../utils/eventEmitter';

interface GameEvents extends EventMap {
  keypress: KeyboardEvent;
  reset: void;
  [GameEvent.STATE_CHANGED]: void;
  [GameEvent.ANSWER_SUBMITTED]: void;
  [GameEvent.INVALID_ANSWER]: void;
  [GameEvent.LOCAL_STORAGE_STATE_LOADED]: void;
}

export class GameModel extends EventEmitter<GameEvents> {
  private state: GameState;
  private storageService: StorageService;
  public isAnimationRunning = false;

  constructor(storageKey: string) {
    super();
    this.storageService = new StorageService(storageKey);

    // Initialize default state
    this.state = {
      isGameOver: false,
      correctAnswer: this.generateRandomAnswer(),
      currentAnswer: '',
      allAnswers: [],
      keyboardColors: new Map(),
    };

    // Load from storage if available
    const storedState = this.storageService.loadState();
    if (storedState) {
      this.syncState(storedState);
    }
  }

  private generateRandomAnswer(): string {
    return words[Math.floor(Math.random() * words.length)];
  }

  public syncState({
    allAnswers,
    correctAnswer,
  }: Pick<GameState, 'allAnswers' | 'correctAnswer'>): void {
    this.state.allAnswers = allAnswers;
    this.state.correctAnswer = correctAnswer;

    for (const answer of allAnswers) {
      this.state.keyboardColors = this.updateScreenKeyboardColors(
        answer,
        correctAnswer
      );
    }

    setTimeout(() => this.emit(GameEvent.LOCAL_STORAGE_STATE_LOADED), 0);
  }

  public getState(): GameState {
    return structuredClone(this.state);
  }

  public updateCurrentAnswer(key: string): void {
    const regex = /[a-z]/i;
    const stateClone = structuredClone(this.state);

    switch (key) {
      case 'Backspace':
        stateClone.currentAnswer = stateClone.currentAnswer.slice(0, -1);
        break;
      default:
        if (key.length > 1) return;
        if (regex.test(key)) {
          if (stateClone.currentAnswer.length < 5)
            stateClone.currentAnswer += key.toLowerCase();
        }
    }

    this.saveState(stateClone);
  }

  public submitAnswer(): void {
    if (this.isAnimationRunning) return;
    this.isAnimationRunning = true;

    const stateClone = structuredClone(this.state);

    if (!this.isCurrentAnswerValid()) {
      this.emit(GameEvent.INVALID_ANSWER);
      return;
    }

    stateClone.keyboardColors = this.updateScreenKeyboardColors(
      stateClone.currentAnswer,
      stateClone.correctAnswer
    );

    stateClone.allAnswers.push(stateClone.currentAnswer);

    stateClone.isGameOver = this.checkGameOver(stateClone);
    stateClone.currentAnswer = '';

    this.saveState(stateClone);
    this.emit(GameEvent.ANSWER_SUBMITTED);
  }

  private checkGameOver(state: GameState): boolean {
    const lastAnswer = state.allAnswers[state.allAnswers.length - 1];
    if (lastAnswer === state.correctAnswer || state.allAnswers.length >= 6) {
      return true;
    }
    return false;
  }

  private isCurrentAnswerValid(): boolean {
    const { currentAnswer } = this.state;
    if (currentAnswer.length !== 5) return false;
    return words.includes(currentAnswer);
  }

  private updateScreenKeyboardColors(
    currentAnswer: string,
    correctAnswer: string
  ) {
    const keyboardColors = new Map(this.state.keyboardColors);

    for (let i = 0; i < currentAnswer.length; i++) {
      const char = currentAnswer[i];

      if (char === correctAnswer[i] || keyboardColors.get(char) === 'correct') {
        keyboardColors.set(char, 'correct');
        continue;
      }

      if (
        correctAnswer.includes(char) &&
        keyboardColors.get(char) !== 'correct'
      ) {
        keyboardColors.set(char, 'misplaced');
        continue;
      } else {
        keyboardColors.set(char, 'incorrect');
      }
    }

    return keyboardColors;
  }

  public saveState(state: GameState): void {
    this.state = state;
    this.storageService.saveState({
      allAnswers: state.allAnswers,
      correctAnswer: state.correctAnswer,
    });
    this.emit(GameEvent.STATE_CHANGED);
  }

  public reset(): void {
    this.state = {
      isGameOver: false,
      correctAnswer: this.generateRandomAnswer(),
      currentAnswer: '',
      allAnswers: [],
      keyboardColors: new Map(),
    };

    this.storageService.saveState({
      allAnswers: this.state.allAnswers,
      correctAnswer: this.state.correctAnswer,
    });

    this.emit(GameEvent.STATE_CHANGED);
  }
}
