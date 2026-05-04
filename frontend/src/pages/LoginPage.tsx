import { useState } from "react";
import { login } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type LoginPageProps = {
    onLogin: (token: string) => void;
    onGoToRegister: () => void;
};

export default function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        try {
            const data = await login(email, password);

            const token = data.access_token || data.token;

            if (!token) {
                throw new Error("No token returned by backend");
            }

            localStorage.setItem("token", token);
            onLogin(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-md p-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">ForgeRAG</h1>
                    <p className="text-sm text-muted-foreground">
                        Login to access your RAG assistant
                    </p>
                </div>

                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button className="w-full" onClick={handleLogin}>
                    Login
                </Button>
                <Button variant="ghost" className="w-full" onClick={onGoToRegister}>
                    No account? Create one
                </Button>
            </Card>
        </div>
    );
}