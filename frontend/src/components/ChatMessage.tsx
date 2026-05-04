import { Card } from "@/components/ui/card";
import SourceList from "@/components/SourceList";

type ChatMessageProps = {
    role: "user" | "assistant";
    content: string;
    results?: any[];
    isStreaming?: boolean;
};

export default function ChatMessage({
                                        role,
                                        content,
                                        results,
                                        isStreaming = false,
                                    }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <Card
                className={`max-w-2xl p-4 ${
                    isUser ? "bg-blue-500 text-white" : "bg-muted"
                }`}
            >
                <p className="whitespace-pre-wrap">
                    {content}
                    {!isUser && isStreaming && <span className="animate-pulse">|</span>}
                </p>

                {!isUser && <SourceList results={results} />}
            </Card>
        </div>
    );
}