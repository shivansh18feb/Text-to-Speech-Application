const BASE_URL = '';

/**
 * Token & Session Management
 */
export function getAuthToken() {
  return localStorage.getItem('tts_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('tts_token', token);
  } else {
    localStorage.removeItem('tts_token');
  }
}

export function getStoredUser() {
  const u = localStorage.getItem('tts_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('tts_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tts_user');
  }
}

export function clearAuthSession() {
  setAuthToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }
}

function getHeaders(isJson = true) {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleApiResponse(res, defaultErrorMsg = 'Request failed') {
  if (res.status === 401) {
    clearAuthSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (data && data.message) {
      const details = data.details ? ` (${data.details.join(', ')})` : '';
      throw new Error(`${data.message}${details}`);
    }
    throw new Error(defaultErrorMsg || `Server returned status ${res.status}`);
  }
  return data;
}

/**
 * Health & Catalog
 */
export async function getHealth() {
  const res = await fetch(`${BASE_URL}/api/health`, { headers: getHeaders() });
  return handleApiResponse(res, 'Health check failed');
}

export async function getLanguages() {
  const res = await fetch(`${BASE_URL}/api/languages`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load languages');
}

export async function getVoices(languageCode = '') {
  const query = languageCode ? `?language=${encodeURIComponent(languageCode)}` : '';
  const res = await fetch(`${BASE_URL}/api/voices${query}`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load voices');
}

/**
 * Speech Synthesis
 */
export async function generateTts({ text, language, voice, speed = 1.0, pitch = 1.0, voiceStyle = 'Standard' }) {
  const res = await fetch(`${BASE_URL}/api/tts`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ text, language, voice, speed, pitch, voiceStyle }),
  });
  return handleApiResponse(res, 'Failed to generate speech');
}

/**
 * Authentication
 */
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleApiResponse(res, 'Registration failed');
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleApiResponse(res, 'Invalid email or password');
}

export async function logoutUser() {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(true),
    });
  } catch (e) {
    // Session cleanup proceeds regardless
  } finally {
    clearAuthSession();
  }
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to retrieve profile');
}

/**
 * Speech History
 */
export async function getHistory() {
  const res = await fetch(`${BASE_URL}/api/history`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load speech history');
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${BASE_URL}/api/history/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleApiResponse(res, 'Failed to delete history item');
}

export async function clearHistory() {
  const res = await fetch(`${BASE_URL}/api/history`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleApiResponse(res, 'Failed to clear history');
}

/**
 * Favorites
 */
export async function getFavorites() {
  const res = await fetch(`${BASE_URL}/api/favorites`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load favorites');
}

export async function addFavorite({ targetType, referenceId, title, metadataJson = '' }) {
  const res = await fetch(`${BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ targetType, referenceId, title, metadataJson }),
  });
  return handleApiResponse(res, 'Failed to add favorite');
}

export async function removeFavorite(id) {
  const res = await fetch(`${BASE_URL}/api/favorites/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleApiResponse(res, 'Failed to remove favorite');
}

export async function checkFavoriteStatus(targetType, referenceId) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/favorites/check?targetType=${encodeURIComponent(targetType)}&referenceId=${encodeURIComponent(referenceId)}`,
      { headers: getHeaders() }
    );
    return await handleApiResponse(res, 'Failed to check favorite status');
  } catch (e) {
    return { isFavorite: false };
  }
}

/**
 * Document Extraction (TXT, PDF, DOCX)
 */
export async function extractDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/files/extract`, {
    method: 'POST',
    headers: getHeaders(false),
    body: formData,
  });
  return handleApiResponse(res, 'Failed to extract text from document');
}

/**
 * AI Text Enhancement
 */
export async function enhanceText({ text, action }) {
  const res = await fetch(`${BASE_URL}/api/ai/enhance`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ text, action }),
  });
  return handleApiResponse(res, 'AI Enhancement failed');
}

/**
 * Analytics (Separated User vs System/Admin)
 */
export async function getUserAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics/me`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to fetch personal analytics');
}

export async function getSystemAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics/system`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to fetch system admin analytics');
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to fetch analytics');
}

export async function getAdminUsers() {
  const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load admin users');
}

export async function getAdminLimits() {
  const res = await fetch(`${BASE_URL}/api/admin/limits`, { headers: getHeaders() });
  return handleApiResponse(res, 'Failed to load system limits');
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ role }),
  });
  return handleApiResponse(res, 'Failed to update user role');
}
