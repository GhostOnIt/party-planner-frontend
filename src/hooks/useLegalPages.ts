import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface LegalPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  updated_at: string;
  updated_by?: {
    id: number;
    name: string;
  };
}

export interface UpdateLegalPageData {
  title?: string;
  content?: string;
  is_published?: boolean;
}

export interface CreateLegalPageData {
  slug: string;
  title: string;
  content: string;
  is_published?: boolean;
}

// Public hook to fetch a legal page by slug
export function useLegalPage(slug: string) {
  return useQuery<LegalPage>({
    queryKey: ['legal-page', slug],
    queryFn: async () => {
      const response = await api.get(`/legal/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

// Admin hooks

// Fetch all legal pages (admin)
export function useAdminLegalPages() {
  return useQuery<LegalPage[]>({
    queryKey: ['admin', 'legal-pages'],
    queryFn: async () => {
      const response = await api.get('/admin/legal-pages');
      return response.data;
    },
  });
}

// Fetch a single legal page by ID (admin)
export function useAdminLegalPage(id: number) {
  return useQuery<LegalPage>({
    queryKey: ['admin', 'legal-page', id],
    queryFn: async () => {
      const response = await api.get(`/admin/legal-pages/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Update a legal page (admin)
export function useUpdateLegalPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateLegalPageData }) => {
      const response = await api.put(`/admin/legal-pages/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'legal-pages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'legal-page', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['legal-page'] });
    },
  });
}

// Create a legal page (admin)
export function useCreateLegalPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLegalPageData) => {
      const response = await api.post('/admin/legal-pages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'legal-pages'] });
    },
  });
}

// Delete a legal page (admin)
export function useDeleteLegalPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/legal-pages/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'legal-pages'] });
    },
  });
}
