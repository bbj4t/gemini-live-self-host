import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TranscriptTurn } from '../types';

// This file manages the Supabase client and interactions.

let supabase: SupabaseClient | null = null;

/**
 * Initializes the Supabase client.
 * @param url - The Supabase project URL.
 * @param key - The Supabase anon key.
 * @returns The initialized Supabase client or null if config is missing.
 */
export const initSupabase = (url: string, key: string): SupabaseClient | null => {
    if (url && key) {
        try {
            supabase = createClient(url, key);
        } catch (error) {
            console.error("Error initializing Supabase client:", error);
            supabase = null;
        }
    } else {
        supabase = null;
    }
    return supabase;
};

/**
 * Performs a vector search against a Supabase Edge Function to get context for RAG.
 * @param query - The user's query text.
 * @returns A string containing the retrieved context, or an empty string on failure.
 */
export const performRagSearch = async (query: string): Promise<string> => {
    if (!supabase) return '';
    try {
        const { data, error } = await supabase.functions.invoke('vector-search', {
            body: { query },
        });

        if (error) throw error;
        if (!data || !Array.isArray(data)) return '';

        // Assuming the function returns an array of objects with a 'content' property
        const contextText = data.map((d: any) => d.content).join('\n---\n');
        return contextText;
    } catch (error) {
        console.error('Error performing RAG search:', error);
        return ''; // Return empty string on error to not break the flow
    }
};

/**
 * Saves a completed chat turn to the 'chat_history' table.
 * @param sessionId - The ID of the current chat session.
 * @param turn - An object containing the user and model text.
 */
export const saveChatTurn = async (sessionId: string, turn: { user: string; model: string }) => {
    if (!supabase || !turn.user || !turn.model) return;
    try {
        const { error } = await supabase
            .from('chat_history')
            .insert({
                session_id: sessionId,
                user_text: turn.user,
                model_text: turn.model,
            });
        if (error) throw error;
    } catch (error) {
        console.error('Error saving chat turn:', error);
    }
};

/**
 * Retrieves the chat history for a given session from Supabase.
 * @param sessionId - The ID of the chat session to retrieve.
 * @returns An array of TranscriptTurn objects.
 */
export const getChatHistory = async (sessionId: string): Promise<TranscriptTurn[]> => {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('id, user_text, model_text')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            user: item.user_text,
            model: item.model_text
        }));

    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
};