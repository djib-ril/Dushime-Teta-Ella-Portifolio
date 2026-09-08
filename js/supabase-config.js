// Supabase Cloud Configuration
// Connected to Teta-Ella-Portfolio Supabase Project

const SUPABASE_CONFIG = {
  url: 'https://ftexodwszedfkivebsgd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXhvZHdzemVkZmtpdmVic2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NzUyMzMsImV4cCI6MjEwNDQ1MTIzM30.IdJRgNk3u4Xh2zXg5qXHuOTUnw4LkAMYcay3r-fCCZI'
};

// Global helper to retrieve active Supabase Client
function getSupabaseClient() {
  const url = (typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_project_url') : null) || SUPABASE_CONFIG.url;
  const anonKey = (typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null) || SUPABASE_CONFIG.anonKey;

  const isPlaceholder = !url || !anonKey || 
                        url === 'YOUR_PROJECT_URL' || 
                        anonKey === 'YOUR_ANON_KEY' || 
                        !url.startsWith('http');

  if (isPlaceholder) {
    return null;
  }

  try {
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      if (!window.__supabaseInstance) {
        window.__supabaseInstance = window.supabase.createClient(url, anonKey, {
          auth: { persistSession: false }
        });
      }
      return window.__supabaseInstance;
    }
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
  return null;
}

function isSupabaseConfigured() {
  const url = (typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_project_url') : null) || SUPABASE_CONFIG.url;
  const anonKey = (typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null) || SUPABASE_CONFIG.anonKey;
  return url && anonKey && url !== 'YOUR_PROJECT_URL' && anonKey !== 'YOUR_ANON_KEY' && url.startsWith('http');
}

function saveSupabaseCredentials(url, anonKey) {
  if (typeof localStorage !== 'undefined') {
    if (url) localStorage.setItem('supabase_project_url', url.trim());
    if (anonKey) localStorage.setItem('supabase_anon_key', anonKey.trim());
  }
  if (typeof window !== 'undefined') {
    window.__supabaseInstance = null; // reset instance
  }
}

const rootScope = typeof window !== 'undefined' ? window : global;
rootScope.SUPABASE_CONFIG = SUPABASE_CONFIG;
rootScope.getSupabaseClient = getSupabaseClient;
rootScope.isSupabaseConfigured = isSupabaseConfigured;
rootScope.saveSupabaseCredentials = saveSupabaseCredentials;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_CONFIG,
    getSupabaseClient,
    isSupabaseConfigured,
    saveSupabaseCredentials
  };
}
