import { useState } from "react";
import { register } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type RegisterPageProps = {
    onRegister: (token: string) => void;
    onGoToLogin: () => void;
};

export default function RegisterPage({
                                         onRegister,
                                         onGoToLogin,
                                     }: RegisterPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = await register(email, password);
            const token = data.access_token || data.token || data.accessToken;

            if (!token) {
                throw new Error("No token returned by backend");
            }

            localStorage.setItem("token", token);
            onRegister(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Register failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Create account</h1>
                    <p className="text-sm text-muted-foreground">
                        Start using ForgeRAG
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

                <Input
                    placeholder="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button className="w-full" onClick={handleRegister} disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </Button>

                <Button variant="ghost" className="w-full" onClick={onGoToLogin}>
                    Already have an account? Login
                </Button>
            </Card>
        </div>
    );
}