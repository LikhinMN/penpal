import { detectComposeBox } from './compose-detector';
import { createTrigger } from './trigger';
import { showGhost, removeGhost } from './ghost';

detectComposeBox((composeEl) => {
  console.log('[Penpal] Compose box detected');

  const handleInput = createTrigger(async (context: string) => {
    console.log('[Penpal] TRIGGER FIRED, fetching suggestion...');

    // remove ghost before reading context to avoid polluting API call
    removeGhost(composeEl);

    if (!chrome.runtime?.id) {
      return;
    }

    let response: { suggestion?: string } | undefined;
    try {
      response = await chrome.runtime.sendMessage({
        type: 'GET_SUGGESTION',
        context,
      });
    } catch (error) {
      console.log('[Penpal] sendMessage failed', error);
      return;
    }

    if (response?.suggestion) {
      console.log('[Penpal] Suggestion:', response.suggestion);
      showGhost(composeEl, response.suggestion);
    }
  });

  composeEl.addEventListener('input', handleInput);

  // remove ghost whenever user types
  composeEl.addEventListener('keydown', (e: KeyboardEvent) => {
    const ghost = composeEl.querySelector('[data-penpal="ghost"]');

    if (!ghost) return; // no suggestion active, don't interfere

    if (e.key === 'Tab') {
      // accept suggestion
      e.preventDefault();
      e.stopPropagation();

      const suggestionText = ghost.textContent ?? '';
      ghost.remove();

      const textNode = document.createTextNode(suggestionText);
      composeEl.appendChild(textNode);

      composeEl.focus();

      const range = document.createRange();
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      console.log('[Penpal] Suggestion accepted');
      return;
    }

    if (e.key === 'Escape') {
      // dismiss suggestion
      e.preventDefault();
      ghost.remove();
      console.log('[Penpal] Suggestion dismissed');
      return;
    }

    // any other key — clear ghost, let user keep typing
    ghost.remove();
  });
});
