import { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner"; // Assure-toi d'avoir un composant Spinner importé
import { Upload, X } from "lucide-react";
import { FileUpload, FileUploadDropzone, FileUploadItem, FileUploadItemDelete, FileUploadItemMetadata, FileUploadItemPreview, FileUploadList, FileUploadTrigger } from "@/components/ui/file-upload";
import { toast } from "sonner";
import axios from "axios";
import ResetChromaButton from "@/components/ResetChromaButton"; // Importer le bouton Reset

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
    const [files, setFiles] = useState<File[]>([]);  // Gère les fichiers sélectionnés
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

    const handleFileReject = (file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        });
    };

    const handleFileUpload = async () => {
        if (files.length === 0) {
            toast("No files selected.", { description: "Please select a file to upload." });
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });
        formData.append('documentId', `doc-${files[0].name}`);
        formData.append('chunkSize', '500');
        formData.append('chunkOverlap', '100');

        try {
            setLoading(true);  // Afficher le spinner
            const result = await axios.post('http://localhost:3000/api/file-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast("File uploaded successfully.");
            console.log(result.data);
        } catch (err) {
            toast.error("File upload failed.");
            console.error(err);
        } finally {
            setLoading(false);  // Masquer le spinner une fois l'upload terminé
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="flex items-center justify-between border-b px-6 py-3">
                {/* Barre de chat avec le bouton Reset à gauche */}
                <div className="flex-grow">
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

            <div className="p-4 flex justify-between items-center">
                {/* Bouton d'upload avec le spinner */}
                <Button onClick={handleFileUpload} disabled={loading}>
                    {loading ? (
                        <Spinner className="animate-spin" size="sm" /> // Affichage du spinner
                    ) : (
                        "Upload File"
                    )}
                </Button>
            </div>

            {/* Section d'upload avec le composant FileUpload */}
            <div className="p-4">
                <FileUpload
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024}
                    value={files}
                    onValueChange={setFiles}
                    onFileReject={handleFileReject}
                    multiple
                >
                    <FileUploadDropzone>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center justify-center rounded-full border p-2.5">
                                <Upload className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Drag & drop files here</p>
                            <p className="text-xs text-muted-foreground">
                                Or click to browse (max 5 files, up to 5MB each)
                            </p>
                        </div>
                        <FileUploadTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2 w-fit">
                                Browse files
                            </Button>
                        </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList>
                        {files.map((file, index) => (
                            <FileUploadItem key={index} value={file}>
                                <FileUploadItemPreview />
                                <FileUploadItemMetadata />
                                <FileUploadItemDelete asChild>
                                    <Button variant="ghost" size="icon" className="size-7">
                                        <X className="size-4" />
                                    </Button>
                                </FileUploadItemDelete>
                            </FileUploadItem>
                        ))}
                    </FileUploadList>
                </FileUpload>
            </div>

            <div style={{ display: "flex", width: "100%" }}>
                <ResetChromaButton />
                <div style={{ flexGrow: 1 }}>
                    <ChatInput onSend={sendMessage} disabled={loading} />
                </div>
            </div>

        </div>
    );
}