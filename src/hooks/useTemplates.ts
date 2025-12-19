import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import type { EventTemplate, EventType } from '@/types';

interface TemplatesResponse {
  templates: EventTemplate[];
  grouped: Record<EventType, EventTemplate[]>;
}

interface TemplatesByTypeResponse {
  templates: EventTemplate[];
  themes: string[];
}

// Get all active templates
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async (): Promise<TemplatesResponse> => {
      const response = await api.get('/templates');
      return response.data;
    },
  });
}

// Get templates filtered by event type
export function useTemplatesByType(type: EventType | undefined) {
  return useQuery({
    queryKey: ['templates', 'type', type],
    queryFn: async (): Promise<TemplatesByTypeResponse> => {
      const response = await api.get(`/templates/type/${type}`);
      return response.data;
    },
    enabled: !!type,
  });
}

// Get a single template
export function useTemplate(templateId: number | undefined) {
  return useQuery({
    queryKey: ['templates', templateId],
    queryFn: async (): Promise<EventTemplate> => {
      const response = await api.get(`/templates/${templateId}`);
      return response.data;
    },
    enabled: !!templateId,
  });
}

// Get template preview
export function useTemplatePreview(templateId: number | undefined) {
  return useQuery({
    queryKey: ['templates', templateId, 'preview'],
    queryFn: async () => {
      const response = await api.get(`/templates/${templateId}/preview`);
      return response.data;
    },
    enabled: !!templateId,
  });
}

// Get suggested themes for an event type
export function useThemesByType(type: EventType | undefined) {
  return useQuery({
    queryKey: ['templates', 'themes', type],
    queryFn: async (): Promise<{ themes: string[] }> => {
      const response = await api.get(`/templates/themes/${type}`);
      return response.data;
    },
    enabled: !!type,
  });
}
