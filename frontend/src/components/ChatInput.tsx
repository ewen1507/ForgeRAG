import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatInputProps = {
    onSend: (message: string) => void;
    disabled?: boolean;
};

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
    const [input, setInput] = useState("");

    const handleSend = () => {
        const value = input.trim();

        if (!value || disabled) return;

        onSend(value);
        setInput("");
    };

    return (
        <div className="flex gap-2 border-t p-4">
            <Input
                placeholder="Ask something..."
                value={input}
                disabled={disabled}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend();
                    }
                }}
            />

            <Button onClick={handleSend} disabled={disabled}>
                Send
            </Button>
        </div>
    );
}