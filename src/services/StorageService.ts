import { GameState } from '../types';

export class StorageService {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  public saveState(
    state: Pick<GameState, 'allAnswers' | 'correctAnswer'>
  ): void {
    window.localStorage.setItem(this.key, JSON.stringify(state));
  }

  public loadState(): Pick<GameState, 'allAnswers' | 'correctAnswer'> | null {
    const item = window.localStorage.getItem(this.key);
    if (!item) return null;
    return JSON.parse(item);
  }

  public clearState(): void {
    window.localStorage.removeItem(this.key);
  }
}
