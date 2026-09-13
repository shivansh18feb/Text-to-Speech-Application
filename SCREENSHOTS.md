# Screenshot Checklist & UI Verification Guide

This document outlines the visual verification checkpoints and screenshot documentation for all 15 application views.

---

## Screenshot Checklist

| # | Screen / State | Description | Location / Trigger | Verified |
|---|---|---|---|:---:|
| 1 | **Home / Main View** | Clean modern header with backend status indicator, title, and tab navigation bar. | Root `/` (Synthesizer Tab) | ✅ |
| 2 | **Text Input Area** | Character counter, word counter, 2500 max character indicator, "Try sample" and "Clear" buttons. | Synthesizer Tab | ✅ |
| 3 | **Language Selection** | Dropdown with 10 global languages (English, Hindi, Gujarati, Marathi, Spanish, etc.) with native scripts. | Synthesizer Tab | ✅ |
| 4 | **Voice Selection & Customizer** | Voice dropdown with gender badges, speaking speed (0.5x-2.0x), pitch (0.5x-1.5x), and voice style selectors. | Synthesizer Tab | ✅ |
| 5 | **Generated Audio Player** | Dark-themed player with Play/Pause, seek timeline, timestamps, volume slider, mute toggle, and speed selectors. | After clicking "Generate Speech" | ✅ |
| 6 | **Download Audio Button** | High-visibility green "Download Audio" button with download confirmation state. | Below Audio Player | ✅ |
| 7 | **User Login Modal** | Modal with email, password, one-click demo credentials ("Demo User" / "Admin User"), and validation alerts. | Click "Sign In / Register" in Header | ✅ |
| 8 | **User Registration Modal** | Account creation form with name, email, and password validation. | Auth Modal -> "Sign Up" toggle | ✅ |
| 9 | **Speech History Tab** | Chronological table of previous syntheses with direct playback, redownload, favorite, and delete buttons. | "History" Tab | ✅ |
| 10 | **Favorites Tab** | Bookmarked voice cards and starred audio clips with one-click "Use Voice" or "Play Audio". | "Favorites" Tab | ✅ |
| 11 | **Document Extractor (File Upload)** | Drag-and-drop box for `.txt`, `.pdf`, and `.docx` files, extracted text editor, and "Load into Synthesizer" button. | "File to Speech" Tab | ✅ |
| 12 | **AI Text Enhancement Tab** | Multi-mode optimization (Conversational, Grammar, Summarize, Rewrite) with original vs. enhanced comparison. | "AI Optimizer" Tab | ✅ |
| 13 | **Admin Dashboard** | System limits overview, registered user management table, and user role toggle buttons. | "Analytics & Admin" Tab (Admin user) | ✅ |
| 14 | **Analytics Dashboard** | Live statistical metrics (Total Generations, Characters Converted, Uptime) and language/voice popularity bars. | "Analytics & Admin" Tab | ✅ |
| 15 | **Mobile / Responsive Layout** | Responsive layout across mobile viewports, wrap-around controls, and touch-friendly buttons. | Responsive test (max-width: 640px) | ✅ |
