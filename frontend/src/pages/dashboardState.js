export function normalizeSitesResponse(data) {
  return Array.isArray(data) ? data : [];
}

export function getSitesLoadErrorMessage(error) {
  const status = error?.response?.status;

  if (status === 401) {
    return 'Your session expired. Please log in again to reload your tracked sites.';
  }

  if (status === 404) {
    return 'The sites API was not found. Check that the backend is running and VITE_API_URL points to it.';
  }

  if (error?.request) {
    return 'Could not reach the backend. Check that the API server is running, then reload your sites.';
  }

  return 'Could not load your tracked sites. Please try again.';
}
