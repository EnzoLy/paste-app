import { createClient } from '@/lib/supabase/client';
import { isExpired } from '@/lib/expiration';

/**
 * Type for paste data
 */
export type PasteData = {
  id: string;
  encrypted_content: string;
  language: string;
  created_at: string;
  expires_at: string | null;
};

/**
 * Generate a cryptographically secure short ID for pastes
 * Uses base62 encoding (A-Z, a-z, 0-9) for URL-safe IDs
 * 10 characters = 62^10 = ~839 quadrillion combinations
 */
function generateId(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;

  // Generate cryptographically secure random bytes
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  // Convert to base62
  let id = '';
  for (let i = 0; i < length; i++) {
    id += charset[randomBytes[i] % charset.length];
  }

  return id;
}

/**
 * Client-side function to create a new paste
 */
export async function createPaste(data: {
  encrypted_content: string;
  language: string;
  expires_at: string | null;
}) {
  try {
    // Validate content size (max 1MB)
    const byteSize = new Blob([data.encrypted_content]).size;
    if (byteSize > 1024 * 1024) {
      return {
        success: false,
        error: 'Content exceeds maximum size of 1MB'
      };
    }

    const supabase = createClient();
    const id = generateId();

    const { error } = await supabase
      .from('pastes')
      .insert({
        id,
        encrypted_content: data.encrypted_content,
        language: data.language,
        expires_at: data.expires_at
      });

    if (error) {
      console.error('Error creating paste:', error);
      return {
        success: false,
        error: 'Failed to create paste'
      };
    }

    return {
      success: true,
      id
    };
  } catch (error) {
    console.error('Error in createPaste:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Client-side function to get a paste by ID
 */
export async function getPaste(id: string) {
  try {
    const supabase = createClient();

    const { data: paste, error } = await supabase
      .from('pastes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !paste) {
      return {
        success: false,
        error: 'Paste not found',
        notFound: true
      };
    }

    // Check if expired
    if (paste.expires_at && isExpired(paste.expires_at)) {
      // Delete expired paste
      await supabase.from('pastes').delete().eq('id', id);

      return {
        success: false,
        error: 'Paste has expired',
        expired: true
      };
    }

    return {
      success: true,
      paste: {
        id: paste.id,
        encrypted_content: paste.encrypted_content,
        language: paste.language,
        created_at: paste.created_at,
        expires_at: paste.expires_at
      }
    };
  } catch (error) {
    console.error('Error in getPaste:', error);
    return {
      success: false,
      error: 'Failed to retrieve paste'
    };
  }
}
