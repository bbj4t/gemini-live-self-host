# AI Voice Chat: User Guide

Welcome to AI Voice Chat! This application allows you to have real-time, voice-based conversations with powerful AI models. This guide will walk you through its features, settings, and different modes of operation.

---

## 1. The Main Interface

The interface is designed for simplicity and focus:

*   **Transcript View:** The central part of the screen where your conversation with the AI is displayed. Your messages appear on the right, and the AI's responses appear on the left.
*   **Status Indicator:** A small indicator above the main button that tells you the app's current state (e.g., "Listening...", "Thinking...", "Error").
*   **Control Button:** The large circular button at the bottom is your primary control. It changes based on the app's state:
    *   <img src="https://fonts.gstatic.com/s/i/materialicons/mic/v14/24px.svg" alt="Microphone Icon" style="vertical-align: middle; display: inline-block; width: 20px; height: 20px; filter: invert(1);"> **Microphone:** The app is idle. Press it to start the conversation.
    *   <img src="https://fonts.gstatic.com/s/i/materialicons/stop/v14/24px.svg" alt="Stop Icon" style="vertical-align: middle; display: inline-block; width: 20px; height: 20px; filter: invert(1);"> **Stop:** The app is actively listening. Press it to end the conversation.
    *   <img src="https://fonts.gstatic.com/s/i/materialicons/sync/v13/24px.svg" alt="Spinner Icon" style="vertical-align: middle; display: inline-block; width: 20px; height: 20px; filter: invert(1);"> **Spinner:** The app is connecting or processing a response. The button will be disabled during this time.
*   **Settings Icon (<img src="https://fonts.gstatic.com/s/i/materialicons/settings/v15/24px.svg" alt="Settings Icon" style="vertical-align: middle; display: inline-block; width: 20px; height: 20px; filter: invert(1);">):** Located at the top-right, this opens the settings panel to configure the application.

---

## 2. How to Use the App

1.  **Start a Conversation:** Press the large **Microphone** button. The status will change to "Connecting..." and then "Listening...".
2.  **Speak:** Once the status is "Listening...", you can start talking. The app will transcribe your speech in real-time.
3.  **Listen for a Response:** When you finish speaking, the AI will process your request (the status will show "Thinking...") and respond with voice audio.
4.  **End the Conversation:** Press the **Stop** button at any time to end the session.

---

## 3. The Settings Panel

Clicking the gear icon opens the Settings modal, where you can customize the backend that powers your chat experience.

### Service Mode

This is the most important setting. It lets you choose between two distinct backends:

#### A) Gemini Mode (Default)

This mode provides a seamless, out-of-the-box experience by connecting directly to Google's powerful Gemini Live API.

*   **Features:** Extremely low-latency, real-time audio and text streaming for both your input and the AI's response.
*   **Best For:** Users who want a high-quality, plug-and-play voice chat experience without any complex setup.
*   **Requirements:** None for the end-user, as long as the application has been deployed with a valid Gemini API Key.

#### B) Self-Hosted Mode

This mode is for advanced users who want to connect the app to their own custom LLMs and Text-to-Speech (TTS) services. It uses your own backend infrastructure, proxied securely through Supabase Edge Functions.

*   **Features:**
    *   **Bring Your Own LLM:** Connect to any LLM service (like OpenAI, Anthropic, or a locally hosted model).
    *   **Retrieval-Augmented Generation (RAG):** If configured, the app can search your own documents (stored in a Supabase vector database) to provide answers with specific context.
*   **Best For:** Developers and businesses who need to use proprietary models, control their data, or integrate with their own knowledge bases.
*   **Requirements:**
    1.  **Supabase Project:** You must have a Supabase project set up.
    2.  **LLM Model Name (Optional):** If your LLM endpoint needs a specific model identifier (e.g., `openai/gpt-4o`), you can enter it here.
    3.  **Supabase Configuration (see below):** You must configure Supabase URL and Key, and deploy the required Edge Functions.

### Supabase Backend Configuration

This section is crucial for enabling chat history and for using the Self-Hosted mode.

*   **Supabase URL & Anon Key:** Enter the URL and public `anon` key from your Supabase project's API settings.
*   **Functionality:**
    *   **Chat History:** When configured, your conversations are automatically saved and loaded for your session, regardless of which Service Mode you are in.
    *   **Secure Proxy (Self-Hosted Mode):** Your self-hosted LLM and TTS endpoints are not called directly from the browser. Instead, the app calls a Supabase Edge Function (`llm-proxy`), which securely forwards the request from the backend. This protects your API credentials.

---

## 4. Setting Up Self-Hosted Mode: A Technical Overview

To use the Self-Hosted mode, you need to configure your Supabase project:

1.  **Deploy Edge Functions:** Deploy the provided Supabase Edge Functions (`llm-proxy` and `vector-search`) to your project.
2.  **Set Supabase Secrets:** In your Supabase project settings (under `Settings` > `Secrets`), you must set the following environment variables. The `llm-proxy` function will use these to call your services.
    *   `LLM_ENDPOINT`: The URL of your LLM service.
    *   `LLM_API_CRED`: The API key or Authorization header for your LLM service (e.g., `Bearer sk-xxxxxxxx`).
    *   `TTS_ENDPOINT`: The URL of your Text-to-Speech service.
    *   `TTS_API_CRED`: The API key for your TTS service.
3.  **Enable RAG (Optional):** To use RAG, you must set up a vector database in Supabase and populate it with your document embeddings. The `vector-search` function is designed to query this database.

Once your Supabase backend is configured and you've entered the URL/Key in the app's settings, you can switch to "Self-Hosted" mode and start chatting with your own AI.
