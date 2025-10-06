export interface TelegramBot {
  id: string;
  businessId: string;
  platform: 'telegram';
  botToken: string;
  botUsername?: string;
  status: 'online' | 'offline' | 'error';
  lastActive?: string;
  config: {
    webhookUrl?: string;
    polling: boolean;
    pollingInterval?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotRequest {
  platform: 'telegram';
  botToken: string;
  webhookUrl?: string;
  polling?: boolean;
  pollingInterval?: number;
}

export interface BotControlRequest {
  action: 'start' | 'stop' | 'restart';
}

class MessagingAPI {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  async getBots(platform?: string): Promise<TelegramBot[]> {
    const url = platform
      ? `${this.baseURL}/bots?platform=${platform}`
      : `${this.baseURL}/bots`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bots: ${response.statusText}`);
    }

    return response.json();
  }

  async createBot(data: CreateBotRequest): Promise<TelegramBot> {
    const response = await fetch(`${this.baseURL}/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bot: ${response.statusText}`);
    }

    return response.json();
  }

  async updateBot(botId: string, data: Partial<CreateBotRequest>): Promise<TelegramBot> {
    const response = await fetch(`${this.baseURL}/bots/${botId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update bot: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteBot(botId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/bots/${botId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bot: ${response.statusText}`);
    }
  }

  async controlBot(botId: string, action: 'start' | 'stop' | 'restart'): Promise<void> {
    const response = await fetch(`${this.baseURL}/bots/${botId}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} bot: ${response.statusText}`);
    }
  }

  async getBotLogs(botId: string, limit: number = 100): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/bots/${botId}/logs?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bot logs: ${response.statusText}`);
    }

    return response.json();
  }

  async getBotMessages(botId: string, limit: number = 50): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/bots/${botId}/messages?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bot messages: ${response.statusText}`);
    }

    return response.json();
  }
}

export const messagingAPI = new MessagingAPI();
