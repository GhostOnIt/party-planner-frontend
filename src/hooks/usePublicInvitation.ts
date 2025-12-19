import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '@/api/client';
import type { RsvpResponseFormData, RsvpStatus } from '@/types';

// Response type for invitation details
export interface InvitationDetails {
  guest: {
    id: number;
    name: string;
    email?: string | null;
    rsvp_status: RsvpStatus;
    plus_one?: boolean;
    plus_one_name?: string | null;
    dietary_restrictions?: string | null;
    invitation_sent_at?: string | null;
  };
  event: {
    id: number;
    title: string;
    type?: string;
    date: string;
    time?: string | null;
    location?: string | null;
    description?: string | null;
    theme?: string | null;
  };
  // Support both field names from backend
  has_responded?: boolean;
  already_responded?: boolean;
  can_respond?: boolean;
}

// Response type for RSVP submission
export interface RsvpSubmitResponse {
  message: string;
  guest: {
    id: number;
    name: string;
    rsvp_status: RsvpStatus;
    plus_one: boolean;
    plus_one_name: string | null;
    dietary_restrictions: string | null;
  };
}

// Fetch invitation details by token
export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async (): Promise<InvitationDetails> => {
      const response = await publicApi.get(`/invitations/${token}`);
      return response.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Submit RSVP response
export function useSubmitRsvp(token: string) {
  return useMutation({
    mutationFn: async (data: RsvpResponseFormData): Promise<RsvpSubmitResponse> => {
      const response = await publicApi.post(`/invitations/${token}/respond`, data);
      return response.data;
    },
  });
}
