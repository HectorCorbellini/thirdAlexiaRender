import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MapPin, Phone, ExternalLink, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Business, Message } from "@/types";
import { dataAlexiaAPI } from "@/services/api";

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy ALEXIA, tu asistente de WhatsApp. ¿En qué puedo ayudarte hoy?",
      sender: "alexia",
      timestamp: new Date(Date.now() - 60000)
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Get ALEXIA response from API
    const getAlexiaResponse = async () => {
      try {
        const response = await dataAlexiaAPI.search(userMessage.content);
        const { message, businesses } = response.data;

        const alexiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: message,
          sender: "alexia",
          timestamp: new Date(),
          type: businesses && businesses.length > 0 ? "business_result" : "text",
          businesses: businesses || [],
        };
        setMessages(prev => [...prev, alexiaResponse]);
      } catch (error) {
        console.error("Failed to get response from ALEXIA API", error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.",
          sender: "alexia",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    };

    getAlexiaResponse();
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b bg-whatsapp text-white">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-bold">A</span>
              </div>
              <div>
                <CardTitle className="text-lg">ALEXIA</CardTitle>
                <p className="text-sm opacity-90">AI Assistant • En línea</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.sender === "user"
                      ? "bg-whatsapp text-white"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.businesses && (
                    <div className="mt-3 space-y-3">
                      {message.businesses.map((business) => (
                        <div key={business.id} className="bg-background rounded p-3 border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-foreground">{business.name}</h4>
                                {business.sponsored && (
                                  <Badge variant="warning" className="text-xs">Patrocinado</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                  {business.rating}
                                </div>
                                <span>•</span>
                                <span>{business.distance}</span>
                                <span>•</span>
                                <span>{business.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">{business.address}</p>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              Llamar
                            </Button>
                            <Button size="sm" variant="whatsapp" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              Mapa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setInputValue("¿Dónde puedo comer hamburguesas cerca?")}
            >
              Buscar hamburguesas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setInputValue("Pizza italiana abierta después de las 10 pm")}
            >
              Pizza tarde noche
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setInputValue("Comparto mi ubicación")}
            >
              Compartir ubicación
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Response Time</span>
              <Badge variant="success">1.2s</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Data Source</span>
              <Badge variant="info">data_alexia</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Results Found</span>
              <Badge>2</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}