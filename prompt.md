**Context:**
I have an existing Next.js 15 (App Router) project called `neona.ai`. It uses TypeScript, NextAuth for Google authentication (`app/api/auth/[...nextauth]/route.ts`), and Gemini for parsing natural language into Google Tasks/Events (`app/api/parse/route.ts` and `app/api/schedule/route.ts`). 

I want to completely replace the current frontend UI with a new, highly optimized, mobile-first "native app" UI that mimics the dark-themed Google Gemini app.

**Your Goal:**
Refactor my existing frontend (specifically focusing on replacing/updating components like `components/scheduler-chat.tsx`, `components/chat-shell.tsx`, or `app/page.tsx`) to implement the new UI architecture. 


@neona-ai.html

Please execute this implementation step-by-step:

### Step 1: Global Styles & CSS Variables
Update `app/globals.css` to include the new CSS variables and base styles required for the dark theme. 
- Add these root variables:
  `--bg-base: #000000; --bg-gradient: radial-gradient(circle at center 120%, #17233b 0%, #000000 60%); --surface: #131314; --surface-variant: #1e1f22; --surface-hover: #282a2d; --text-primary: #e3e3e3; --text-secondary: #c4c7c5; --text-muted: #8e918f; --accent-blue: #a8c7fa; --star-grad: linear-gradient(135deg, #4285f4, #9b72cb, #d96570, #fbbc04);`
- Ensure the `body` and `html` have `height: 100%; width: 100%; overflow: hidden; overscroll-behavior-y: none;` applied to prevent native browser bouncing.
- Make sure Google Material Symbols are imported in `app/layout.tsx`.

### Step 2: Component Breakdown & State Management
Convert the monolithic HTML/vanilla JS UI into modular React components using `useState` and `useEffect`. Create or update a main container component (e.g., `components/scheduler-chat.tsx`).
- **State needed:**
  - `const [isSidebarOpen, setIsSidebarOpen] = useState(false)`
  - `const [isSettingsOpen, setIsSettingsOpen] = useState(false)`
  - `const [messages, setMessages] = useState([])`
  - `const [inputValue, setInputValue] = useState('')`
  - `const [isLoading, setIsLoading] = useState(false)`
- **UI Sections to convert to React:**
  - **Header:** Contains hamburger menu, Model Selector dropdown, and history icon.
  - **Sidebar Drawer:** Sliding drawer for navigation, wrapping it with an overlay that closes on click.
  - **Settings Bottom Sheet:** A sliding bottom sheet for toggles (Sync to Calendar, Sync to Tasks, Advanced Parsing).
  - **Greeting Area:** The animated Magic Star and "Hi [Name], let's get into it" text. (Hide this when `messages.length > 0`).

### Step 3: NextAuth Integration (The Auth Modal)
Replace the fake initial "Sign In" popup with actual NextAuth logic.
- Use `useSession()` from `next-auth/react`.
- If the user is unauthenticated (`status === 'unauthenticated'`), show the `AuthModal` component over the screen.
- The "Sign in with Google" button should trigger `signIn('google')`.
- Pull the user's First Name from the session to dynamically update the Greeting text ("Hi {session.user.name.split(' ')[0]}...").

### Step 4: Chat Interface & Input
- Build the `ChatHistory` component to render the array of `messages`.
- Render user bubbles differently from AI bubbles (AI bubbles have transparent backgrounds, user bubbles use `--surface-variant`).
- Build the bottom `InputPill` component. 
- Implement dynamic icon switching: If `inputValue.length > 0`, show the Send icon; otherwise, show the Mic icon.

### Step 5: API Connection (Replacing Fake Timeouts)
Wire up the `handleSend` function to the actual backend logic:
1. Append the user's message to the state.
2. Set `isLoading = true` (which triggers the CSS bouncing dot typing indicator).
3. Make a `fetch('/api/parse', { method: 'POST', body: JSON.stringify({ prompt: inputValue }) })` request.
4. Set `isLoading = false`.
5. Take the parsed JSON response from the API and render it inside a custom `TaskCard` component within the AI's message bubble. The `TaskCard` should have "Confirm & Add" buttons that trigger `/api/schedule`.

**Design Requirements for React/Tailwind:**
- Translate the custom CSS classes (like `.surface-variant`, `.msg-bubble`, `.sidebar`, etc.) into Tailwind CSS utility classes where possible, or keep them as clean CSS Modules to perfectly preserve the native-app look.
- Ensure the `z-index` stacking context is correct: Main App (1) < Sidebar Overlay (99) < Sidebar (100) < Settings Sheet (150) < Auth Modal (200).

@LogicDraft