import { detectComposeBox } from './compose-detector';

detectComposeBox((composeEl) => {
  console.log('[Penpal] Compose box detected:', composeEl);
  composeEl.addEventListener('input', () => {
    console.log('[Penpal] User typed:', composeEl.textContent);
  });
});
