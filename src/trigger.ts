export let currentAbortController: AbortController | null = null;

export function createTrigger(onTrigger: (context: string) => void): (e: Event) => void {
  let debounceTimer: number | null = null;

  return (e: Event) => {
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
      const context = fullText.slice(-300);
      onTrigger(context);

    }, 500);
  };
}
