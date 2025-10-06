import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Bot, MessageSquare, Plus, Settings, Trash2, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TelegramBot {
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

interface BotFormData {
  botToken: string;
  webhookUrl?: string;
  polling: boolean;
  pollingInterval: number;
}

export default function MessagingIntegrations() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<TelegramBot | null>(null);
  const [formData, setFormData] = useState<BotFormData>({
    botToken: '',
    webhookUrl: '',
    polling: true,
    pollingInterval: 30000,
  });

  // Load bots on component mount
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/bots?platform=telegram');
      const data = await response.json();
      
      // Transform backend data to match frontend interface
      const transformedBots = data.map((bot: any) => ({
        ...bot,
        status: bot.status.toLowerCase() as 'online' | 'offline' | 'error'
      }));
      
      setBots(transformedBots);
    } catch (err) {
      setError('Failed to load Telegram bots');
      console.error('Error loading bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: 'telegram', 
          botToken: formData.botToken,
          webhookUrl: formData.webhookUrl,
          polling: formData.polling,
          pollingInterval: formData.pollingInterval
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bot');
      }

      const newBot = await response.json();
      
      // Transform status to lowercase
      newBot.status = newBot.status.toLowerCase();
      
      setBots([...bots, newBot]);
      setIsDialogOpen(false);
      resetForm();
      
      // Reload bots to get fresh data
      await loadBots();
    } catch (err) {
      setError('Failed to create Telegram bot');
      console.error('Error creating bot:', err);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bots/${botId}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }

      setBots(bots.filter(bot => bot.id !== botId));
    } catch (err) {
      setError('Failed to delete Telegram bot');
      console.error('Error deleting bot:', err);
    }
  };

  const handleControlBot = async (botId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`http://localhost:3001/api/bots/${botId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} bot`);
      }

      // Reload bots to get updated status
      await loadBots();
    } catch (err) {
      setError(`Failed to ${action} Telegram bot`);
      console.error(`Error ${action}ing bot:`, err);
    }
  };

  const resetForm = () => {
    setFormData({
      botToken: '',
      webhookUrl: '',
      polling: true,
      pollingInterval: 30000,
    });
    setEditingBot(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'default',
      offline: 'secondary',
      error: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messaging Integrations</h1>
          <p className="text-muted-foreground">
            Manage your business's messaging bots across different platforms
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Telegram Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Telegram Bot</DialogTitle>
              <DialogDescription>
                Configure a new Telegram bot for your business
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  value={formData.botToken}
                  onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                  placeholder="Enter your Telegram bot token"
                />
              </div>

              <div>
                <Label htmlFor="polling">Connection Method</Label>
                <Select
                  value={formData.polling.toString()}
                  onValueChange={(value) => setFormData({ ...formData, polling: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Polling (Recommended)</SelectItem>
                    <SelectItem value="false">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.polling && (
                <div>
                  <Label htmlFor="pollingInterval">Polling Interval (ms)</Label>
                  <Input
                    id="pollingInterval"
                    type="number"
                    value={formData.pollingInterval}
                    onChange={(e) => setFormData({ ...formData, pollingInterval: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {!formData.polling && (
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/api/telegram/webhook"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBot} disabled={!formData.botToken}>
                  Add Bot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="telegram" className="space-y-4">
        <TabsList>
          <TabsTrigger value="telegram">Telegram Bots</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="other">Other Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="telegram" className="space-y-4">
          {bots.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Telegram Bots</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by adding your first Telegram bot to manage conversations and automate responses.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bots.map((bot) => (
                <Card key={bot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(bot.status)}
                        <div>
                          <CardTitle className="text-lg">@{bot.botUsername || 'Unknown Bot'}</CardTitle>
                          <CardDescription>
                            Token: {bot.botToken.substring(0, 20)}...
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(bot.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Last active: {bot.lastActive ? new Date(bot.lastActive).toLocaleString() : 'Never'}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleControlBot(bot.id, bot.status === 'online' ? 'stop' : 'start')}
                        >
                          {bot.status === 'online' ? 'Stop' : 'Start'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleControlBot(bot.id, 'restart')}
                          disabled={bot.status !== 'online'}
                        >
                          Restart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingBot(bot);
                            setFormData({
                              botToken: bot.botToken,
                              webhookUrl: bot.config.webhookUrl || '',
                              polling: bot.config.polling,
                              pollingInterval: bot.config.pollingInterval || 30000,
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBot(bot.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
              <p className="text-muted-foreground text-center">
                WhatsApp Business API integration coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Bot className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Other Platforms</h3>
              <p className="text-muted-foreground text-center">
                Support for Discord, Slack, and other platforms coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
