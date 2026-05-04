const API_URL = "http://localhost:3000/api";

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function askRag(question: string, token: string) {
    const res = await fetch(`${API_URL}/rag/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "RAG request failed");
    }

    return data;
}

export async function register(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Register failed");
    }

    return data;
}