import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [documentId, setDocumentId] = useState('doc-pdf-1');
    const [chunkSize, setChunkSize] = useState(500);
    const [chunkOverlap, setChunkOverlap] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        setFile(selectedFile);
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentId', documentId);
        formData.append('chunkSize', chunkSize.toString());
        formData.append('chunkOverlap', chunkOverlap.toString());

        try {
            setIsLoading(true);
            const result = await axios.post('http://localhost:3000/file-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse('File uploaded successfully');
            console.log(result.data);
        } catch (err) {
            setError('File upload failed');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="file" className="block">
                    Choose a file to upload:
                </Label>
                <Input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="mt-2"
                />
            </div>

            <div className="flex items-center space-x-4">
                <Label htmlFor="documentId" className="block">Document ID</Label>
                <Input
                    id="documentId"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-1/3"
                />
            </div>

            <div className="flex items-center space-x-4">
                <Label htmlFor="chunkSize" className="block">Chunk Size</Label>
                <Input
                    type="number"
                    id="chunkSize"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-1/3"
                />
            </div>

            <div className="flex items-center space-x-4">
                <Label htmlFor="chunkOverlap" className="block">Chunk Overlap</Label>
                <Input
                    type="number"
                    id="chunkOverlap"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    className="w-1/3"
                />
            </div>

            <div className="flex items-center space-x-4">
                <Button onClick={handleFileUpload} disabled={isLoading}>
                    {isLoading ? (
                        <Spinner size="sm" className="text-white" />
                    ) : (
                        'Upload File'
                    )}
                </Button>
            </div>

            {error && <Alert variant="destructive" className="mt-4">{error}</Alert>}
            {response && <Alert variant="success" className="mt-4">{response}</Alert>}
        </div>
    );
};

export default FileUpload;