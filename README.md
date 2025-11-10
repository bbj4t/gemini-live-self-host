# AI Voice Chat

This application allows you to have real-time, voice-based conversations with powerful AI models. It can connect directly to Google's Gemini API for a seamless experience or be configured to use your own self-hosted LLM and TTS services via a secure Supabase proxy.

---

## Developer Setup and Installation

This section guides you through setting up the project for local development and configuring the self-hosted backend.

### Prerequisites

*   **Node.js & npm:** Required to run the local development server and install dependencies.
*   **A Supabase Account:** Required for chat history and for using the Self-Hosted mode. [Create one here](https://supabase.com/).
*   **Supabase CLI:** Required for deploying the backend Edge Functions. [Installation instructions](https://supabase.com/docs/guides/cli).
*   **Google Gemini API Key:** Required for the default `Gemini` mode. This should be configured as an environment variable in your deployment environment.

### Local Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:** This project uses a simple static server. You can use any one you prefer.
    ```bash
    # Example using `http-server`
    npm install -g http-server
    ```

3.  **Run the application:**
    ```bash
    http-server .
    ```
    The application will now be running on a local port (e.g., `http://localhost:8080`).

### Core Dependencies

*   **Frontend:**
    *   **React:** For building the user interface.
    *   **TailwindCSS:** For styling the application.
    *   **@google/genai:** The official Google Gemini API client for JavaScript.
    *   **@supabase/supabase-js:** The official Supabase client for interacting with the backend.
*   **Backend (Edge Functions):**
    *   **Deno:** The runtime for Supabase Edge Functions.
    *   **Supabase CLI:** For managing and deploying the functions.

---

## Self-Hosted Mode Configuration

Follow these steps to connect the app to your own LLM and TTS endpoints using Supabase for secure proxying and data storage.

#### Step 1: Create a Supabase Project

If you haven't already, create a new project in your [Supabase Dashboard](https://app.supabase.com/).

#### Step 2: Configure the Supabase CLI

Link your local project to your Supabase project. This will ask you to log in.

```bash
# Install the CLI if you haven't already
npm install -g supabase

# Log in to your Supabase account
supabase login

# Link your project (get the project ref from your Supabase project's URL)
supabase link --project-ref <your-project-ref>
```

#### Step 3: Set Supabase Secrets

Your LLM and TTS credentials should not be exposed on the frontend. The `llm-proxy` Edge Function reads them from your project's secrets.

1.  Go to your Supabase Project Dashboard.
2.  Navigate to **Settings** -> **Secrets**.
3.  Add the following secrets:
    *   `LLM_ENDPOINT`: The URL of your LLM service.
    *   `LLM_API_CRED`: The API key or Authorization header for your LLM service (e.g., `Bearer sk-xxxxxxxx`).
    *   `TTS_ENDPOINT`: The URL of your Text-to-Speech service.
    *   `TTS_API_CRED`: The API key for your TTS service.

> **Note on Flexibility:** The `llm-proxy` function is designed to work with a variety of backend services without code changes. It automatically parses the JSON response from your LLM endpoint by looking for text in common properties (`response`, `text`, `completion`, or standard OpenAI formats like `choices[0].message.content`). For TTS services, it looks for base64 audio data in `audioContent`, `audio`, or `data`. This allows you to easily switch between different self-hosted models.

#### Step 4: Deploy Edge Functions

Deploy the functions located in the `supabase/functions` directory.

```bash
# Deploy the secure proxy for LLM and TTS calls
supabase functions deploy llm-proxy

# Deploy the function for Retrieval-Augmented Generation (optional)
supabase functions deploy vector-search
```

#### Step 5: (Optional) Set up RAG with Vector Search

To enable the app to answer questions using your own documents (RAG):

1.  Set up a table in your Supabase database with the `pgvector` extension enabled.
2.  Populate the table with your document embeddings.
3.  The project includes a template `vector-search` function (`supabase/functions/vector-search/index.ts`) that is correctly configured for CORS and returns mock data. To enable RAG, you must **edit this file to implement your own logic**: generate an embedding for the user's query and perform a similarity search against your database.

#### Step 6: Configure The App UI

1.  Run the application and click the **Settings** icon.
2.  Switch the **Service Mode** to **Self-Hosted**.
3.  Enter your **Supabase URL** and **Supabase Anon Key** (found in your Supabase project's API settings).
4.  (Optional) If your LLM endpoint requires a specific model name in the payload, enter it in the **LLM Model Name** field.
5.  Click **Save**. The app is now configured to use your self-hosted backend.

---

## Application User Guide

### 1. The Main Interface

The interface is designed for simplicity and focus:

*   **Transcript View:** The central part of the screen where your conversation with the AI is displayed. Your messages appear on the right, and the AI's responses appear on the left.
*   **Status Indicator:** A small indicator above the main button that tells you the app's current state (e.g., "Listening...", "Thinking...", "Error").
*   **Control Button:** The large circular button at the bottom is your primary control.
*   **Settings Icon:** Located at the top-right, this opens the settings panel to configure the application.

### 2. How to Use the App

1.  **Start a Conversation:** Press the large **Microphone** button. The status will change to "Connecting..." and then "Listening...".
2.  **Speak:** Once the status is "Listening...", you can start talking. The app will transcribe your speech in real-time.
3.  **Listen for a Response:** When you finish speaking, the AI will process your request and respond with voice audio.
4.  **End the Conversation:** Press the **Stop** button at any time to end the session.

### 3. The Settings Panel

Clicking the gear icon opens the Settings modal, where you can customize the backend that powers your chat experience.

#### Service Mode

*   **A) Gemini Mode (Default):** Provides a seamless, out-of-the-box experience by connecting directly to Google's powerful Gemini Live API. Best for users who want a high-quality, plug-and-play voice chat experience.

*   **B) Self-Hosted Mode:** For advanced users who want to connect the app to their own custom LLMs and Text-to-Speech (TTS) services. Best for developers who need to use proprietary models, control their data, or integrate with their own knowledge bases.

#### Supabase Backend Configuration

This section is crucial for enabling chat history and for using the Self-Hosted mode.

*   **Supabase URL & Anon Key:** Enter the URL and public `anon` key from your Supabase project's API settings.
*   **Functionality:**
    *   **Chat History:** When configured, your conversations are automatically saved and loaded for your session.
    *   **Secure Proxy (Self-Hosted Mode):** Your self-hosted endpoints are called via a secure Supabase Edge Function (`llm-proxy`), protecting your API credentials.