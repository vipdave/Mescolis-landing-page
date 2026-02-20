import { useState } from "react";
import LandingPage from "./Landing";
import DashboardApp from "./Dashboard";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', sans-serif; }
  @keyframes fu { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fy { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 6px rgba(52,211,153,.5); } 50% { box-shadow: 0 0 14px rgba(52,211,153,.8); } }
  .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px); background-size: 60px 60px; }
  .fc { animation: fy 4s ease-in-out infinite; } .fc.f2 { animation-delay: 1s; } .fc.f3 { animation-delay: 2s; }
  .led { width: 6px; height: 6px; border-radius: 50%; }
  .led.g { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,.6); animation: glow 3s ease-in-out infinite; }
  .led.o { background: #F5941E; box-shadow: 0 0 8px rgba(245,148,30,.6); }
  .led.b { background: #1B6EC2; box-shadow: 0 0 8px rgba(27,110,194,.6); }
  .fcard { transition: all 0.4s; position: relative; overflow: hidden; }
  .fcard::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #1B6EC2, #F5941E); opacity: 0; transition: opacity 0.3s; }
  .fcard:hover::before { opacity: 1; }
  .fcard:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,.12); }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing");

  const handleLogin = (email, isAdmin) => {
    setUser({
      fn: isAdmin ? "Admin" : email.split("@")[0],
      email: email,
      role: isAdmin ? "Admin" : "Business"
    });
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("landing");
  };

  const handleNav = (p) => setPage(p);

  return (
    <>
      <style>{CSS}</style>
      {!user ? (
        <LandingPage
          page={page}
          onNav={handleNav}
          onLogin={handleLogin}
        />
      ) : (
        <DashboardApp
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
