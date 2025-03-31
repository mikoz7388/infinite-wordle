import { GameState } from '../types';

export class KeyboardView {
  private keyboardElement: HTMLElement;
  private keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
  ];

  constructor(keyboardElement: HTMLElement) {
    this.keyboardElement = keyboardElement;
  }

  public createKeyboard(): void {
    this.keyboardElement.innerHTML = '';

    this.keyboardRows.forEach((row) => {
      const keyboardRow = document.createElement('div');
      keyboardRow.classList.add('keyboard-row');

      row.forEach((key) => {
        const button = document.createElement('button');
        button.classList.add('key');
        button.dataset.key = key;

        if (key === 'Backspace') {
          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
          );
          svg.setAttribute('height', '24');
          svg.setAttribute('width', '24');
          svg.setAttribute('viewBox', '0 0 24 24');

          const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          );
          path.setAttribute(
            'd',
            'M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z'
          );
          path.setAttribute('fill', 'white');

          svg.appendChild(path);
          button.appendChild(svg);
        } else {
          button.textContent = key.toUpperCase();
        }

        keyboardRow.appendChild(button);
      });

      this.keyboardElement.appendChild(keyboardRow);
    });
  }

  public updateKeyboard(state: GameState): void {
    state.keyboardColors.forEach((status, key) => {
      const keyElement = this.keyboardElement.querySelector(
        `[data-key="${key}"]`
      );
      if (!keyElement) return;

      keyElement.classList.remove('correct', 'incorrect', 'misplaced');

      keyElement.classList.add(status);
    });
  }

  public bindKeyboardClick(handler: (e: MouseEvent) => void): void {
    this.keyboardElement.addEventListener('click', handler);
  }

  public reset(): void {
    const keys = this.keyboardElement.querySelectorAll('.key');

    keys.forEach((key) => {
      key.classList.remove('correct', 'misplaced', 'incorrect');

      (key as HTMLElement).style.removeProperty('background-color');

      (key as HTMLElement).style.removeProperty('color');
    });
  }
}
