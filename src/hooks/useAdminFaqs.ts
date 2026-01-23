import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import type { Faq } from '@/types';

/**
 * Hook to fetch all FAQs (admin only)
 */
export function useAdminFaqs() {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: async (): Promise<Faq[]> => {
      const response = await api.get('/admin/faqs');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'data' in data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    },
  });
}

interface CreateFaqData {
  question: string;
  answer: string;
  order?: number;
  is_active?: boolean;
}

interface UpdateFaqData {
  question?: string;
  answer?: string;
  order?: number;
  is_active?: boolean;
}

/**
 * Hook to create a new FAQ
 */
export function useCreateFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateFaqData): Promise<Faq> => {
      const response = await api.post('/admin/faqs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({
        title: 'FAQ créée',
        description: 'La question fréquente a été créée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de créer la FAQ.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an existing FAQ
 */
export function useUpdateFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFaqData }): Promise<Faq> => {
      const response = await api.put(`/admin/faqs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({
        title: 'FAQ mise à jour',
        description: 'La question fréquente a été mise à jour avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de mettre à jour la FAQ.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a FAQ
 */
export function useDeleteFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/admin/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({
        title: 'FAQ supprimée',
        description: 'La question fréquente a été supprimée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de supprimer la FAQ.',
        variant: 'destructive',
      });
    },
  });
}

