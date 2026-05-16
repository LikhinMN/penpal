export function showGhost(composeEl: HTMLElement, suggestion: string): void {
  removeGhost(composeEl);
  if (suggestion === '') {
    return;
  }

  const span = document.createElement('span');
  span.className = 'penpal-ghost';
  span.setAttribute('data-penpal', 'ghost');
  span.textContent = suggestion;
  span.contentEditable = 'false';
  span.style.cssText = `
  color: #9aa0a6;
  pointer-events: none;
  user-select: none;
`;

  composeEl.appendChild(span);
}

export function removeGhost(composeEl: HTMLElement): void {
  const existing = composeEl.querySelector('[data-penpal="ghost"]');
  if (existing) {
    existing.remove();
  }
}

export function getGhostText(composeEl: HTMLElement): string {
  const existing = composeEl.querySelector('[data-penpal="ghost"]');
  return existing?.textContent ?? '';
}

