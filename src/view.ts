export class View {
  game: HTMLDivElement = document.querySelector('#game')!;
  keyboard: HTMLDivElement = document.querySelector('#keyboard')!;

  renderBoard(rows: number, cols: number) {
    this.game.innerHTML = '';
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
      }
      this.game.appendChild(row);
    }
  }
  bindKeyBoard(handler: (e: KeyboardEvent) => void) {
    window.addEventListener('keydown', handler);
  }
  bindKeyBoardClick(handler: (e: MouseEvent) => void) {
    this.keyboard.addEventListener('click', handler);
  }
}
