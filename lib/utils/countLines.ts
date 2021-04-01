function countLines(el: HTMLElement): number {
  if (!el) return -1;
  // Get total height of the content
  const divHeight = el.offsetHeight;

  // object.style.lineHeight, returns
  // the lineHeight property
  // height of one line
  const lineHeight = parseInt(window.getComputedStyle(el).getPropertyValue('line-height'));

  const lines = divHeight / lineHeight;
  return lines;
}

export default countLines;
