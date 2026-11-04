import { apiFetch } from './api';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  formattedDate: string;
}

export interface GuestbookResponse {
  entries: GuestbookEntry[];
  visitorCount: number;
}

export interface VisitResponse {
  visitorCount: number;
}

export interface SubmitResponse {
  success: boolean;
  entry: GuestbookEntry;
}

// Get all guestbook entries and current visitor count
export async function getGuestbookEntries(): Promise<GuestbookResponse> {
  const response = await apiFetch('/api/guestbook', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch guestbook entries');
  }

  return response.json();
}

// Record a visit and get updated visitor count
let visitRequest: Promise<VisitResponse> | undefined;
export function recordVisit(): Promise<VisitResponse> {
  if (!visitRequest) {
    visitRequest = apiFetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'visit' }),
    }).then(response => response.json()).catch(error => { visitRequest = undefined; throw error; });
  }
  return visitRequest;
}

// Submit a new guestbook entry
export async function submitGuestbookEntry(
  name: string,
  message: string
): Promise<SubmitResponse> {
  const response = await apiFetch('/api/guestbook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit entry');
  }

  return response.json();
}
