import { useState } from "react";
import ChatPage from "@/pages/ChatPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuth = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthMode("login");
  };

  if (!token && authMode === "register") {
    return (
        <RegisterPage
            onRegister={handleAuth}
            onGoToLogin={() => setAuthMode("login")}
        />
    );
  }

  if (!token) {
    return (
        <LoginPage
            onLogin={handleAuth}
            onGoToRegister={() => setAuthMode("register")}
        />
    );
  }

  return <ChatPage token={token} onLogout={handleLogout} />;
}

export default App;