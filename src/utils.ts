export function clearAnimation(element: HTMLElement, animationName: string) {
  if (element.style.animationName === animationName) {
    element.style.animationName = '';
    element.style.animationDuration = '';
    element.style.animationTimingFunction = '';
  }
}
