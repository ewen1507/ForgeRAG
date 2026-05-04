import { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
    role: "user" | "assistant";
    content: string;
    results?: any[];
    isStreaming?: boolean;
};

type ChatPageProps = {
    token: string;
    onLogout: () => void;
};

export default function ChatPage({ token, onLogout }: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const sendMessage = (question: string) => {
        setMessages((prev) => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: "", isStreaming: true },
        ]);

        setLoading(true);

        const eventSource = new EventSource(
            `http://localhost:3000/api/rag/stream?question=${encodeURIComponent(
                question,
            )}`,
        );

        let currentText = "";

        eventSource.onmessage = (event) => {
            if (event.data === "[DONE]") {
                eventSource.close();
                setLoading(false);

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        isStreaming: false,
                    };
                    return updated;
                });

                return;
            }

            currentText += event.data;

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: currentText,
                    isStreaming: true,
                };
                return updated;
            });
        };

        eventSource.onerror = () => {
            eventSource.close();
            setLoading(false);

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Error while streaming the answer.",
                    isStreaming: false,
                };
                return updated;
            });
        };
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="flex items-center justify-between border-b px-6 py-3">
                <div>
                    <h1 className="text-lg font-semibold">ForgeRAG</h1>
                    <p className="text-sm text-muted-foreground">
                        Your secured RAG assistant
                    </p>
                </div>

                <Button variant="outline" onClick={onLogout}>
                    Logout
                </Button>
            </header>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            role={message.role}
                            content={message.content}
                            results={message.results}
                            isStreaming={message.isStreaming}
                        />
                    ))}

                    {loading && messages[messages.length - 1]?.content === "" && (
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                    )}

                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
    );
}