export type CellState = 'empty' | 'tbd' | 'correct' | 'incorrect' | 'misplaced';

export type GameState = {
  isGameOver: boolean;
  currentAnswer: string;
  correctAnswer: string;
  allAnswers: string[];
  keyboardColors: Map<string, CellState>;
};

export enum GameEvent {
  STATE_CHANGED = 'state-changed',
  ANSWER_SUBMITTED = 'answer-submitted',
  INVALID_ANSWER = 'invalid-answer',
  GAME_OVER = 'game-over',
  LOCAL_STORAGE_STATE_LOADED = 'local-storage-state-loaded',
}
