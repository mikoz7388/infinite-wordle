import './style.css';
import { GameModel } from './models/GameModel';
import { GameView } from './views/GameView';
import { GameController } from './controllers/GameController';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.querySelector<HTMLDivElement>('#app');
  if (!appElement) {
    console.error('App element not found');
    return;
  }

  // Initialize our components
  const model = new GameModel('wordle');
  const view = new GameView(appElement);
  const controller = new GameController(model, view);

  // Start the application
  controller.init();
});
