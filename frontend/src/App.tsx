import { useState } from "react";
import ChatPage from "@/pages/ChatPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LandingPage from "@/pages/LandingPage";
import AppBackground from "@/components/layout/AppBackground";

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [authMode, setAuthMode] = useState<"landing" | "login" | "register">(
      "landing"
  );

  const handleAuth = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthMode("landing");
  };

  if (token) {
    return (
        <div className="min-h-screen bg-white text-slate-950">
          <ChatPage token={token} onLogout={handleLogout} />
        </div>
    );
  }

  if (authMode === "landing") {
    return (
        <AppBackground>
          <LandingPage
              onGoToLogin={() => setAuthMode("login")}
              onGoToRegister={() => setAuthMode("register")}
          />
        </AppBackground>
    );
  }

  if (authMode === "register") {
    return (
        <AppBackground>
          <RegisterPage
              onRegister={handleAuth}
              onGoToLogin={() => setAuthMode("login")}
          />
        </AppBackground>
    );
  }

  return (
      <AppBackground>
        <LoginPage
            onLogin={handleAuth}
            onGoToRegister={() => setAuthMode("register")}
        />
      </AppBackground>
  );
}

export default App;