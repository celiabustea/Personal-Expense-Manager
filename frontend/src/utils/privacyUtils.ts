export function getAiDataUsageConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('aiDataUsageConsent');
  return consent ? JSON.parse(consent) : false;
}
