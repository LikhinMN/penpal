# Penpal 🖋️

**Penpal** is a lightweight Chrome Extension that serves as an AI-powered writing companion for Gmail. It listens to user typing in Gmail, triggers autocomplete suggestions using Google's Gemini API, and displays them as inline "ghost text" that can be accepted or dismissed with simple keystrokes.

---

## Features

- 🕵️ **Smart Compose Detection**: Uses a `MutationObserver` to automatically detect when a compose box is opened or active in Gmail.
- 👻 **Inline Autocomplete (Ghost Text)**: Renders suggestions directly inside the active compose element as grayed-out placeholder text.
- ⚡ **Seamless Interactions**:
  - Press `Tab` to accept the suggestion.
  - Press `Escape` to dismiss the suggestion.
  - Keep typing to automatically discard it.
- 🧠 **Context-Aware Recommendations**: Passes the subject line (if available) along with the last 300 characters of the email body to provide relevant autocomplete suggestions.
- 🚦 **Intelligent Rate-Limiting & Debouncing**:
  - Debounces key inputs by **800ms** to wait until the user pauses.
  - Requires the current sentence to have at least **4 words** before querying suggestions.
  - Imposes a minimum **3-second delay** between suggestions to conserve API rate limits.
  - Aborts outstanding suggestions if the user starts typing again before they resolve.
- ⚙️ **Gemini 2.5 Flash Powered**: Utilizes the highly optimized `gemini-2.5-flash` model via Google's Gemini API for low-latency autocomplete suggestions.

---

## File Structure & Architecture

The project consists of a content script running on the Gmail webpage and a service worker running in the background.

```
penpal/
├── manifest.json         # Extension manifest (v3), defining permissions and content scripts
├── package.json          # Node dependencies and build scripts
├── vite.config.ts        # Vite configuration to build ESM content and background scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Local environment file containing the Gemini API Key
└── src/                  # Source files (TypeScript)
    ├── background.ts     # Service worker listening for GET_SUGGESTION messages
    ├── content.ts        # Content script injected into Gmail; orchestrates compose-detection and triggers
    ├── compose-detector.ts # Watches the DOM for Gmail compose boxes
    ├── trigger.ts        # Implements debouncing, rate-limiting, and context formatting
    ├── ghost.ts          # Creates and manages the inline ghost text suggestions in the DOM
    └── gemma.ts          # Integrates with the Gemini API (system prompt, retry logic, and output sanitizing)
```

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) and npm installed.
- A Google Gemini API Key. You can get one from Google AI Studio.

### 1. Clone & Configure Environment
1. Clone or copy the project files to your local environment.
2. In the root directory, create a `.env` file (if not already present) and insert your Gemini API Key:
   ```env
   VITE_GEMMA_API_KEY=your_actual_gemini_api_key
   ```

### 2. Install Dependencies
Run the following command in the project root to install the TypeScript and Vite dev dependencies:
```bash
npm install
```

### 3. Build the Project
Compile the TypeScript code using Vite:
```bash
npm run build
```
This command compiles the files in `src/` and outputs the bundled scripts into the `dist/` directory as `content.js` and `background.js`.

### 4. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the root directory of the `penpal` project (the folder containing `manifest.json`).

---

## How It Works Under the Hood

1. **Detection**: [compose-detector.ts](src/compose-detector.ts) runs a `MutationObserver` on the body of the document. Whenever a new Gmail compose window matches `div[aria-label="Message Body"][contenteditable="true"]`, it invokes a callback.
2. **Interaction Hook**: [content.ts](src/content.ts) attaches listeners to the compose area. As the user inputs text, the trigger debouncer in [trigger.ts](src/trigger.ts) monitors the input.
3. **Checking Constraints**: Once the input crosses 4 words in the current sentence and the user pauses typing for 800ms, the trigger extracts the email context (including subject and recent body text).
4. **API Call**: The content script sends a message to the background script ([background.ts](src/background.ts)), which forwards it to the Gemini API ([gemma.ts](src/gemma.ts)) using the `gemini-2.5-flash` model.
5. **Suggestion Rendering**: When the API returns a prediction, [ghost.ts](src/ghost.ts) appends a non-editable `span` inside the compose editor. The suggestion is styled in light gray (`#9aa0a6`) and has mouse events disabled.
6. **Accept/Dismiss**: A `keydown` listener in [content.ts](src/content.ts) intercepts `Tab` to accept the suggestion (removing the ghost and appending it as a standard text node) or `Escape` to discard it. Any other character keystroke removes the suggestion so the user can continue typing uninterrupted.
