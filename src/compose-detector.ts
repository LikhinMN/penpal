const COMPOSE_BODY_SELECTOR = 'div[aria-label="Message Body"][contenteditable="true"]';
const COMPOSE_SUBJECT_SELECTOR = 'input[aria-label="Subject"]';

function findComposeBody(node: Element): HTMLElement | null {
  if (node instanceof HTMLElement && node.matches(COMPOSE_BODY_SELECTOR)) {
    return node;
  }

  const body = node.querySelector(COMPOSE_BODY_SELECTOR);
  if (body instanceof HTMLElement) {
    return body;
  }

  if (node.matches(COMPOSE_SUBJECT_SELECTOR)) {
    const dialog = node.closest('div[role="dialog"]');
    if (dialog instanceof HTMLElement) {
      const dialogBody = dialog.querySelector(COMPOSE_BODY_SELECTOR);
      if (dialogBody instanceof HTMLElement) {
        return dialogBody;
      }
    }
  }

  const subject = node.querySelector(COMPOSE_SUBJECT_SELECTOR);
  if (subject instanceof HTMLElement) {
    const dialog = subject.closest('div[role="dialog"]');
    if (dialog instanceof HTMLElement) {
      const dialogBody = dialog.querySelector(COMPOSE_BODY_SELECTOR);
      if (dialogBody instanceof HTMLElement) {
        return dialogBody;
      }
    }
  }

  return null;
}

export function detectComposeBox(callback: (el: HTMLElement) => void): void {
  const seen = new WeakSet<Element>();

  const emit = (element: HTMLElement | null): void => {
    if (element === null || seen.has(element)) {
      return;
    }

    seen.add(element);
    callback(element);
  };

  const initialBody = document.querySelector(COMPOSE_BODY_SELECTOR);
  if (initialBody instanceof HTMLElement) {
    emit(initialBody);
  } else {
    const initialSubject = document.querySelector(COMPOSE_SUBJECT_SELECTOR);
    if (initialSubject instanceof HTMLElement) {
      emit(findComposeBody(initialSubject));
    }
  }

  if (!document.body) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (!(addedNode instanceof Element)) {
          continue;
        }

        emit(findComposeBody(addedNode));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}