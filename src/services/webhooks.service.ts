import { api } from './api';

export interface WebhookEvent {
  id: string;
  description: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  secret?: string; // Only populated on creation
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: string;
  statusCode: number | null;
  responseBody: string | null;
  duration: number;
  attemptNumber: number;
  deliveredAt: string;
}

export interface PaginatedDeliveries {
  data: WebhookDelivery[];
  nextCursor: string | null;
}

export const webhooksService = {
  getEvents: async (): Promise<WebhookEvent[]> => {
    const { data } = await api.get('/webhooks/events');
    return data;
  },

  getWebhooks: async (): Promise<WebhookSubscription[]> => {
    const { data } = await api.get('/webhooks');
    return data;
  },

  getWebhook: async (id: string): Promise<WebhookSubscription> => {
    const { data } = await api.get(`/webhooks/${id}`);
    return data;
  },

  createWebhook: async (url: string, events: string[]): Promise<WebhookSubscription> => {
    const { data } = await api.post('/webhooks', { url, events });
    return data;
  },

  deactivateWebhook: async (id: string): Promise<WebhookSubscription> => {
    const { data } = await api.patch(`/webhooks/${id}/deactivate`);
    return data;
  },

  testWebhook: async (id: string): Promise<void> => {
    await api.post(`/webhooks/${id}/test`);
  },

  getDeliveries: async (id: string, cursor?: string): Promise<PaginatedDeliveries> => {
    const params = cursor ? { cursor } : {};
    const { data } = await api.get(`/webhooks/${id}/deliveries`, { params });
    return data;
  },
};
