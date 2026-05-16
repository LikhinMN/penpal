export function createTrigger(onTrigger: (context: string) => void): (e: Event) => void {
  let debounceTimer: number | null = null;
  let currentAbortController: AbortController | null = null;
  let lastFireTime = 0;

  return (e: Event) => {
    const now = Date.now();
    if (now - lastFireTime < 50) {
      return;
    }
    lastFireTime = now;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      const composeEl = e.target as HTMLElement;
      const fullText = (composeEl.innerText ?? '').trim();

      // Word count check
      const sentences = fullText.split(/[.?!]/);
      const currentSentence = sentences[sentences.length - 1].trim();
      const wordCount = currentSentence.split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 4) {
        return;
      }

      // Abort previous request and create a new controller
      if (currentAbortController) {
        currentAbortController.abort();
        console.log('[Penpal] Previous trigger aborted');
      }
      currentAbortController = new AbortController();

      // Extract context and fire trigger
      const subjectEl = document.querySelector('input[aria-label="Subject"]') as HTMLInputElement | null;
      const subject = subjectEl?.value?.trim() ?? '';
      const body = fullText.slice(-300);
      const context = subject ? `Subject: ${subject}\n\nEmail body so far: ${body}` : body;
      onTrigger(context);

    }, 500);
  };
}
