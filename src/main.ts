import './style.css'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>wordle</h1>
    <div id="game"></div>
    <div id="keyboard"></div>
  </div>
`

