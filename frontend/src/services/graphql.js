import { getAuthToken, clearAuthSession } from './api';

const GRAPHQL_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/graphql`;

/**
 * Native Fetch GraphQL Client
 */
export async function fetchGraphQl(query, variables = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    clearAuthSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`GraphQL request failed with HTTP ${res.status}`);
  }

  if (result && result.errors && result.errors.length > 0) {
    const errorMsg = result.errors.map((e) => e.message).join(', ');
    throw new Error(`GraphQL Error: ${errorMsg}`);
  }

  return result ? result.data : null;
}

/**
 * GraphQL Queries
 */
export async function getMeGql() {
  const query = `
    query GetMe {
      me {
        id
        name
        email
        role
        createdAt
      }
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.me : null;
}

export async function getLanguagesGql() {
  const query = `
    query GetLanguages {
      languages {
        code
        name
        nativeName
        voices {
          id
          name
          gender
          languageCode
        }
      }
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.languages : [];
}

export async function getVoicesGql(language = '') {
  const query = `
    query GetVoices($language: String) {
      voices(language: $language) {
        id
        name
        gender
        languageCode
      }
    }
  `;
  const data = await fetchGraphQl(query, { language });
  return data ? data.voices : [];
}

export async function getMySpeechHistoryGql(page = 0, size = 20) {
  const query = `
    query GetMySpeechHistory($page: Int, $size: Int) {
      mySpeechHistory(page: $page, size: $size) {
        content {
          id
          text
          language
          voice
          speed
          pitch
          voiceStyle
          audioUrl
          audioSizeBytes
          characterCount
          wordCount
          createdAt
        }
        totalElements
        totalPages
        page
        size
      }
    }
  `;
  const data = await fetchGraphQl(query, { page, size });
  return data ? data.mySpeechHistory : { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 };
}

export async function getSpeechHistoryItemGql(id) {
  const query = `
    query GetSpeechHistoryItem($id: ID!) {
      speechHistoryItem(id: $id) {
        id
        text
        language
        voice
        speed
        pitch
        voiceStyle
        audioUrl
        audioSizeBytes
        characterCount
        wordCount
        createdAt
      }
    }
  `;
  const data = await fetchGraphQl(query, { id });
  return data ? data.speechHistoryItem : null;
}

export async function getMyFavoritesGql() {
  const query = `
    query GetMyFavorites {
      myFavorites {
        id
        targetType
        referenceId
        title
        metadataJson
        createdAt
      }
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.myFavorites : [];
}

export async function checkIsFavoriteGql(targetType, referenceId) {
  const query = `
    query CheckIsFavorite($targetType: String!, $referenceId: String!) {
      isFavorite(targetType: $targetType, referenceId: $referenceId)
    }
  `;
  const data = await fetchGraphQl(query, { targetType, referenceId });
  return data ? data.isFavorite : false;
}

export async function getMyAnalyticsGql() {
  const query = `
    query GetMyAnalytics {
      myAnalytics {
        totalGenerations
        totalCharacters
        totalWords
        totalFavorites
        topLanguage
        topVoice
      }
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.myAnalytics : null;
}

export async function getSystemAnalyticsGql() {
  const query = `
    query GetSystemAnalytics {
      systemAnalytics {
        totalUsers
        totalGenerations
        totalCharactersConverted
        activeProviders
        systemStatus
      }
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.systemAnalytics : null;
}

/**
 * GraphQL Mutations
 */
export async function deleteSpeechHistoryGql(id) {
  const query = `
    mutation DeleteSpeechHistory($id: ID!) {
      deleteSpeechHistory(id: $id)
    }
  `;
  const data = await fetchGraphQl(query, { id });
  return data ? data.deleteSpeechHistory : false;
}

export async function clearSpeechHistoryGql() {
  const query = `
    mutation ClearSpeechHistory {
      clearSpeechHistory
    }
  `;
  const data = await fetchGraphQl(query);
  return data ? data.clearSpeechHistory : false;
}

export async function addFavoriteGql({ targetType, referenceId, title, metadataJson = '' }) {
  const query = `
    mutation AddFavorite($input: FavoriteInput!) {
      addFavorite(input: $input) {
        id
        targetType
        referenceId
        title
        metadataJson
        createdAt
      }
    }
  `;
  const data = await fetchGraphQl(query, { input: { targetType, referenceId, title, metadataJson } });
  return data ? data.addFavorite : null;
}

export async function removeFavoriteGql(id) {
  const query = `
    mutation RemoveFavorite($id: ID!) {
      removeFavorite(id: $id)
    }
  `;
  const data = await fetchGraphQl(query, { id });
  return data ? data.removeFavorite : false;
}
