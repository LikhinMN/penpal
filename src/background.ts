import { getSuggestion } from './gemma';

console.log('[Penpal] background worker running');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SUGGESTION') {
    getSuggestion(message.context, new AbortController().signal)
      .then((suggestion) => sendResponse({ suggestion }))
      .catch(() => sendResponse({ suggestion: '' }));
    return true; // keeps message channel open for async response
  }

  return false;
});
