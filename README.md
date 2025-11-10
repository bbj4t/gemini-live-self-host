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

Follow these steps to connect the app to your own LLM and TTS endpoints using Supabase for secure proxying and data storage. The backend is now split into two dedicated proxy functions for better modularity.

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

Your LLM and TTS credentials should not be exposed on the frontend. The proxy Edge Functions read them from your project's secrets.

1.  Go to your Supabase Project Dashboard.
2.  Navigate to **Settings** -> **Secrets**.
3.  Add the following secrets:
    *   `LLM_ENDPOINT`: The URL of your Language Model service.
    *   `LLM_API_CRED`: The API key or Authorization header for your LLM service (e.g., `Bearer sk-xxxxxxxx`).
    *   `TTS_ENDPOINT`: The URL of your Text-to-Speech service.
    *   `TTS_API_CRED`: The API key or Authorization header for your TTS service.

> **Note on Flexibility:** The proxy functions are designed to work with a variety of backend services without code changes. `llm-proxy` automatically parses JSON responses by looking for text in common properties (`response`, `text`, `completion`, or standard OpenAI formats). `tts-proxy` looks for base64 audio data in `audioContent`, `audio`, or `data`.

#### Step 4: Deploy Edge Functions

Deploy all the functions located in the `supabase/functions` directory.

```bash
# Deploy the secure proxy for LLM calls
supabase functions deploy llm-proxy

# Deploy the secure proxy for TTS calls
supabase functions deploy tts-proxy

# Deploy the function for Retrieval-Augmented Generation (optional)
supabase functions deploy vector-search

# Deploy the function for testing the connection from the UI
supabase functions deploy test-connection
```

#### Step 5: (Optional) Set up RAG with Vector Search

To enable the app to answer questions using your own documents (RAG):

1.  Set up a table in your Supabase database with the `pgvector` extension enabled.
2.  Populate the table with your document embeddings.
3.  The project includes a template `vector-search` function (`supabase/functions/vector-search/index.ts`) that returns mock data. To enable RAG, you must **edit this file to implement your own logic**: generate an embedding for the user's query and perform a similarity search against your database.

#### Step 6: Configure The App UI

1.  Run the application and click the **Settings** icon.
2.  Switch the **Service Mode** to **Self-Hosted** (or keep as Gemini).
3.  Enter your **Supabase URL** and **Supabase Anon Key** (found in your Supabase project's API settings).
4.  Click the **Test Connection** button. You should see a "Connection successful!" message. If not, follow the troubleshooting steps below.
5.  (Optional) If your LLM endpoint requires a specific model name in the payload, enter it in the **LLM Model Name** field.
6.  Click **Save**. The app is now configured to use your Supabase backend.

---

## Troubleshooting

### Error: "Failed to send a request to the Edge Function" or Connection Test Fails

This is a common error when the browser cannot communicate with your Supabase backend. Here’s how to fix it:

1.  **Use the In-App Tester:** The most important first step is to use the **"Test Connection"** button in the app's Settings panel. This provides specific feedback on what might be wrong. Read the error message carefully—it's designed to guide you to the solution.

2.  **Common Causes for Failed Connections:**
    *   **Incorrect URL or Anon Key:** Double-check that the **Supabase URL** and **Supabase Anon Key** you entered in the app's Settings panel *exactly* match the values in your Supabase project's **API Settings** (`Settings` -> `API`). A small typo here is the most common cause of this error.
    *   **Functions Not Deployed:** The test button might report that the `test-connection` function was not found. If this happens, it means you need to deploy it. Run the command from Step 4:
        ```bash
        supabase functions deploy test-connection
        ```
        It's a good idea to deploy all functions at once to be sure. Check the deployment status for `llm-proxy`, `tts-proxy`, `vector-search`, and `test-connection`.

3.  **Verify Function Deployment:** If the tester is still failing, you can manually check that your functions are deployed and healthy. Run this command in your terminal:
    ```bash
    supabase functions list
    ```
    You should see all four functions listed with a `published` status. If not, re-run the `supabase functions deploy <function-name>` command for any that are missing.

4.  **Check Function Logs:** For more advanced debugging, look for errors happening inside the function itself. For example, if your self-hosted LLM calls are failing, check the logs for that specific proxy:
    ```bash
    # Check the logs for the LLM proxy while using the app
    supabase functions logs --project-ref <your-project-ref> llm-proxy
    ```
    This will show you logs in real-time. Try using the app to trigger the function and watch for any error messages in the logs (e.g., "LLM_ENDPOINT is not set").

---

## Application User Guide

### 1. The Main Interface

The interface is designed for simplicity and focus:

*   **Transcript View:** The central part of the screen where your conversation with the AI is displayed.
*   **Status Indicator:** A small indicator above the main button that tells you the app's current state (e.g., "Listening...", "Thinking...", "Error").
*   **Control Button:** The large circular button at the bottom is your primary control.
*   **Settings Icon:** Located at the top-right, this opens the settings panel to configure the application.

### 2. How to Use the App

1.  **Start a Conversation:** Press the large **Microphone** button.
2.  **Speak:** Once the status is "Listening...", you can start talking.
3.  **Listen for a Response:** When you finish speaking, the AI will process your request and respond with voice audio.
4.  **End the Conversation:** Press the **Stop** button at any time.

### 3. The Settings Panel

Clicking the gear icon opens the Settings modal, where you can customize the backend that powers your chat experience.

#### Service Mode

*   **A) Gemini Mode (Default):** Connects directly to Google's Gemini Live API. Best for a high-quality, plug-and-play voice chat experience. In this mode, you can select from several different voices for the AI's responses.

*   **B) Self-Hosted Mode:** For advanced users who want to connect the app to their own custom LLMs and Text-to-Speech (TTS) services.

#### Supabase Backend Configuration

This section is crucial for enabling chat history and for using the Self-Hosted mode.

*   **Supabase URL & Anon Key:** Enter the URL and public `anon` key from your Supabase project's API settings.
*   **Functionality:**
    *   **Chat History:** When configured, your conversations are automatically saved and loaded for your session.
    *   **Secure Proxies (Self-Hosted Mode):** Your self-hosted endpoints are called via secure Supabase Edge Functions (`llm-proxy`, `tts-proxy`), protecting your API credentials.