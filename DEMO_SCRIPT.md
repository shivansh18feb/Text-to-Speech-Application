# Complete Project Demonstration Script (34 Steps)

Follow this step-by-step demonstration script to present every feature of the Text-to-Speech Application.

---

### Step 1: Open Application
- Open browser and navigate to `http://localhost:5173`.
- Point out the clean UI, navigation bar, and green "Backend Active" status badge.

### Step 2: Register New User
- Click "Sign In / Register" in the top right.
- Toggle to "Sign Up", enter `Jane Doe`, `jane@tts.com`, password `Jane@123`, and click "Create Account".

### Step 3: Login
- Demonstrate login (or click "One-Click Test Account: 👤 Demo User" which autofills `demo@tts.com` / `Demo@123`).
- Notice the user profile badge appears with user initials and name.

### Step 4: Enter Text
- In the Synthesizer tab, type or paste a custom sentence in the text area.

### Step 5: Character Count
- Point to the live Character counter updating dynamically on every keystroke.

### Step 6: Word Count
- Point to the Word counter updating in real time.

### Step 7: Select Language
- Select "Hindi" or "Spanish" or "English (United States)" from the Language dropdown.
- Click "Try sample" to automatically load a natural native phrase for that language.

### Step 8: Select Voice
- Notice the Voice dropdown immediately updates with accents and gender options matching the selected language.

### Step 9: Configure Speaking Speed
- In the Voice Customization panel, adjust the Speed slider from `1.0x` to `1.2x`.

### Step 10: Configure Pitch
- Adjust the Pitch slider from `1.0x` to `1.1x`.

### Step 11: Configure Volume
- Show the Volume slider on the customization bar and on the player.

### Step 12: Configure Voice Style
- Select a voice style (e.g. "Cheerful" or "Professional").

### Step 13: Generate Speech
- Click the prominent "Generate Speech" button.
- Observe the loading state ("Generating Speech...").

### Step 14: Play Audio
- The Generated Audio card smoothly animates into view. Click the blue Play button.
- Hear the synthesized natural voice audio play through your speakers.

### Step 15: Pause Audio
- Click the Pause button; playback halts instantly.

### Step 16: Seek Audio
- Drag the timeline seekbar slider to skip forward or backward in the audio.

### Step 17: Adjust Volume & Mute
- Drag the player volume slider or click the Mute icon to mute/unmute.

### Step 18: Download Audio
- Click the green "Download Audio" button.
- Verify a clean `.mp3` file downloads immediately to your browser's download folder.

### Step 19: Clear Text
- Click the "Clear" button above the text area; the text area resets and counters return to 0.

### Step 20: Upload TXT Document
- Switch to the "File to Speech" tab. Click the upload box and select a `.txt` file.

### Step 21: Upload PDF Document
- Select a `.pdf` file to test PDF text parsing via Apache PDFBox.

### Step 22: Upload DOCX Document
- Select a Word `.docx` file to test Microsoft Word text parsing via Apache POI.

### Step 23: Extract Text
- Observe the extracted content appear immediately in the document preview with character/word totals.

### Step 24: Modify Extracted Text
- Edit or delete sentences inside the extracted text preview area.
- Click "Load into Speech Synthesizer" — it smoothly transitions back to the Synthesizer tab with the text populated.

### Step 25: AI Text Enhancement
- Switch to the "AI Optimizer" tab.
- Click "Conversational Speech", "Smart Summarization", or "Grammar & Punctuation".
- Click "Run", and view the before-and-after comparison.

### Step 26: Generate Enhanced Speech
- Click "Use in Speech Synthesizer" and generate natural speech from the AI-optimized text.

### Step 27: Speech History
- Switch to the "History" tab.
- Show past audio syntheses recorded in the database.
- Click the Play button to replay past audio, or the Download icon to redownload.

### Step 28: Favorites
- Switch to the "Favorites" tab.
- Demonstrate bookmarking a voice or speech generation, and retrieving it instantly.

### Step 29: Admin Dashboard
- Log in as the Admin account (`admin@tts.com` / `Admin@123`).
- Switch to "Analytics & Admin". Show the registered user accounts table and privilege toggling.

### Step 30: System Analytics
- Highlight the 4 metrics cards (Total Generations, Total Characters, Registered Users, Uptime).
- Review the Most-Used Languages and Most-Used Voices distribution bars.

### Step 31: Error Handling
- Attempt to generate speech with empty text or with over 2500 characters.
- Observe the friendly error banner in the UI without crashing the application.

### Step 32: Explain Architecture
- Walk through the decoupled React frontend, Spring Boot backend REST APIs, and modular service layer.

### Step 33: Explain Security
- Explain Spring Security with stateless JWT, BCrypt password hashing, token-bucket rate limiting (HTTP 429), and server-side secret protection.

### Step 34: Explain Deployment
- Show `docker-compose.yml` and `Dockerfile` enabling instant containerized deployment across AWS, Render, and Vercel.
