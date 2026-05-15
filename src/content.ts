import { detectComposeBox } from './compose-detector';
import {createTrigger} from "./trigger";

detectComposeBox((composeEl) => {
  console.log('[Penpal] Compose box detected');

  const handleInput = createTrigger((context:any) => {
    console.log('[Penpal] TRIGGER FIRED');
    console.log('[Penpal] Context:', context);
  });

  composeEl.addEventListener('input', handleInput);
  composeEl.addEventListener('keyup', handleInput);
});
