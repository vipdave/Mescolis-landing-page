import { useState } from "react";

const T = {
  navy: "#0B1426", blue: "#1B6EC2", blueDk: "#114d8a",
  orange: "#F5941E", orangeLt: "#ffa940",
  off: "#f0f4f8", gray: "#8899aa", txt: "#2a3545", sub: "#4a5568"
};
const M = "'JetBrains Mono', monospace";

const CARRIERS = [
  { n: "Purolator", s: "Express", p: 18.42, lp: 30.7, d: 1, l: "🟣" },
  { n: "Canada Post", s: "Xpresspost", p: 15.84, lp: 26.4, d: 2, l: "🔴" },
  { n: "DHL", s: "Express", p: 22.56, lp: 37.6, d: 2, l: "🟡" },
  { n: "UPS", s: "Standard", p: 13.26, lp: 22.1, d: 5, l: "🟤" },
  { n: "FedEx", s: "Economy", p: 14.88, lp: 24.8, d: 4, l: "🟠" },
  { n: "Purolator", s: "Ground", p: 11.94, lp: 19.9, d: 4, l: "🟣" },
  { n: "Canada Post", s: "Regular", p: 9.54, lp: 15.9, d: 7, l: "🔴" },
  { n: "FedEx", s: "Priority", p: 24.3, lp: 40.5, d: 1, l: "🟠" },
];

function Btn({ children, v = "primary", sm, full, onClick, style: sx }) {
  const map = {
    primary: { background: T.orange, color: "#fff", border: "none", boxShadow: "0 2px 12px rgba(245,148,30,.3)" },
    outline: { background: "transparent", color: T.blue, border: "1.5px solid " + T.blue },
    ghost: { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.3)" },
  };
  return (
    <button onClick={onClick} style={{
      borderRadius: sm ? 6 : 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif",
      fontWeight: 600, fontSize: sm ? 12 : 14, padding: sm ? "7px 14px" : "11px 22px",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 8, width: full ? "100%" : "auto", transition: "all .3s", ...map[v], ...sx
    }}>{children}</button>
  );
}

function Inp({ label, ...p }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.gray, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>}
      <input {...p} style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 10, color: T.txt, fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box", ...p.style }} />
    </div>
  );
}

function Sec({ tag, title, sub, children, bg }) {
  return (
    <section style={{ padding: "5rem 0", background: bg || "transparent" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: T.orange, marginBottom: 10 }}>{tag}</div>
          <h2 style={{ fontSize: "clamp(2rem,3.5vw,2.6rem)", fontWeight: 800, color: T.navy, lineHeight: 1.15, marginBottom: 12 }}>{title}</h2>
          {sub && <p style={{ fontSize: "1rem", color: T.gray, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function LockerVisual() {
  const leds = ["g", "o", "g", "g", "o", "g", "b", "g", "b"];
  const floats = [
    { cls: "fc f1", pos: { top: "8%", left: "-8%" }, bg: "#d1fae5", ic: "✓", t: "Parcel Delivered", s: "Locker #A-07 · Montreal" },
    { cls: "fc f3", pos: { top: "50%", left: "-12%" }, bg: "#ffedd5", ic: "🔔", t: "Pickup Ready", s: "SMS + Email sent" },
    { cls: "fc f2", pos: { bottom: "10%", right: "-5%" }, bg: "#dbeafe", ic: "📦", t: "Return Initiated", s: "Cross-border · Zonos" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {floats.map((f) => (
        <div key={f.cls} className={f.cls} style={{ position: "absolute", ...f.pos, background: "#fff", borderRadius: 12, padding: "12px 16px", boxShadow: "0 12px 40px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 10, zIndex: 3 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{f.ic}</div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: "#1a2a3d" }}>{f.t}</div><div style={{ fontSize: 10, color: T.gray }}>{f.s}</div></div>
        </div>
      ))}
      <div style={{ width: 280, background: "linear-gradient(180deg,#1e3a5f,#142a45)", borderRadius: 12, padding: 14, boxShadow: "0 30px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05)", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", padding: 8, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.orange, fontWeight: 700 }}>MesColis Smart Locker</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
          {leds.map((c, i) => (
            <div key={i} style={{ aspectRatio: "1", background: "linear-gradient(135deg,#0f2236,#1a3350)", borderRadius: 6, border: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className={"led " + c} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 44, height: 44, background: "#0f2236", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </div>
          <div style={{ flex: 1, background: "#0a1a2e", borderRadius: 6, padding: "7px 10px", border: "1px solid rgba(255,255,255,.04)" }}>
            <div style={{ fontSize: 9, color: T.orange, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>● Ready for pickup</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Scan QR or enter PIN</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HOME ─── */
function HomePage({ onNav }) {
  const [fp, setFp] = useState(""); const [tp, setTp] = useState(""); const [wt, setWt] = useState("");
  const [qt, setQt] = useState(null); const [st, setSt] = useState("Package");
  const getQ = () => { if (!fp || !tp || !wt) return; const w = parseFloat(wt) || 1; setQt(CARRIERS.map(c => ({ ...c, p: +(c.p * w / 2).toFixed(2), lp: +(c.lp * w / 2).toFixed(2) })).sort((a, b) => a.p - b.p)); };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#fff", color: T.txt }}>
      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, background: "rgba(255,255,255,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,.06)", boxShadow: "0 1px 20px rgba(0,0,0,.05)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg," + T.orange + "," + T.orangeLt + ")", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>M</span></div>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>MesColis.ca</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {["B2B", "B2C", "C2C", "POS Walk-Up", "Pricing"].map(l => (<span key={l} style={{ fontSize: 14, fontWeight: 500, color: T.sub, cursor: "pointer" }}>{l}</span>))}
            <div style={{ display: "flex", background: "rgba(0,0,0,.05)", borderRadius: 6, overflow: "hidden" }}>
              <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, border: "none", background: T.blue, color: "#fff", borderRadius: 4, cursor: "pointer" }}>EN</button>
              <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, border: "none", background: "transparent", color: T.gray, cursor: "pointer" }}>FR</button>
            </div>
            <Btn v="outline" sm onClick={() => onNav("login")}>Log In</Btn>
            <Btn sm onClick={() => onNav("register")}>Get Started</Btn>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", background: "linear-gradient(135deg," + T.navy + " 0%,#0a2e54 40%,#0e3b6e 100%)", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 64 }}>
        <div className="hero-grid" />
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 800, height: 800, background: "radial-gradient(circle,rgba(245,148,30,.08),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative", zIndex: 2, width: "100%" }}>
          <div style={{ padding: "3rem 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,148,30,.12)", border: "1px solid rgba(245,148,30,.2)", color: T.orangeLt, padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, marginBottom: 24, animation: "fu .6s ease .2s both" }}>
              <span style={{ width: 6, height: 6, background: T.orange, borderRadius: "50%", animation: "blink 2s ease-in-out infinite", display: "inline-block" }} />Now Launching in Quebec
            </div>
            <h1 style={{ fontSize: "clamp(2.8rem,5vw,4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 24, animation: "fu .6s ease .35s both" }}>
              Canada's First<br /><span style={{ background: "linear-gradient(135deg," + T.orange + ",#ffcc4d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart B2B Locker</span><br />Network
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,.65)", maxWidth: 480, marginBottom: 32, animation: "fu .6s ease .5s both" }}>Open, carrier-agnostic smart locker network with integrated POS terminals. Walk up, pay, drop off — no app required. Works with DHL, Purolator, Canada Post, UPS, and FedEx.</p>
            <div style={{ display: "flex", gap: 16, animation: "fu .6s ease .65s both" }}>
              <Btn onClick={() => onNav("register")}>Start Free Pilot →</Btn>
              <Btn v="ghost">See How It Works</Btn>
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.08)", animation: "fu .6s ease .8s both" }}>
              {[["99%", "First-attempt delivery"], ["40%", "Lower last-mile cost"], ["$12.8B", "Canadian market (TAM)"]].map(([n, l]) => (
                <div key={n}><div style={{ fontSize: 28, fontWeight: 800, color: T.orange, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 4 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ animation: "fu .8s ease .4s both" }}><LockerVisual /></div>
        </div>
      </section>

      {/* LOGO BAR */}
      <div style={{ padding: "2.5rem 0", borderBottom: "1px solid rgba(0,0,0,.05)", background: T.off }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: T.gray, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, marginBottom: 18 }}>Trusted by leading carriers & platforms</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 50, opacity: 0.35 }}>
            {["ShipTime", "DHL", "Zonos", "Purolator", "Canada Post", "UPS"].map(n => (<span key={n} style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: T.txt }}>{n}</span>))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <Sec tag="How It Works" title="Ship smarter in 4 simple steps" sub="From label creation to locker pickup — our platform handles the entire delivery flow.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: 44, left: "12%", right: "12%", height: 2, background: "linear-gradient(90deg," + T.orange + "," + T.blue + "," + T.orange + ")", opacity: 0.15 }} />
          {[["1", "Connect via API or Walk Up", "Integrate via REST API or use our POS terminal — no app needed."], ["2", "Generate Shipment", "Create labels, compare rates across carriers, assign locker destinations."], ["3", "Drop at Locker", "Courier or sender drops at nearest smart locker. Pay via tap, Apple Pay, or Interac."], ["4", "Pickup 24/7", "Recipient gets bilingual SMS + email (FR/EN) with QR code or PIN."]].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 20px", background: "linear-gradient(135deg," + T.blue + "," + T.blueDk + ")", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", boxShadow: "0 8px 24px rgba(27,110,194,.25)" }}>{num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.gray, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* FEATURES */}
      <Sec tag="Platform Features" title="Everything for modern last-mile logistics" sub="Built for couriers, 3PLs, and e-commerce businesses." bg={T.off}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {[["🌐", "#dbeafe", "Carrier-Agnostic", "Works with DHL, Purolator, Canada Post, UPS, FedEx — and any carrier via open API."], ["📦", "#d1fae5", "Walk-Up POS Terminal", "No app needed. 10.1\" touchscreen with tap payment, Apple Pay, Google Pay, and Interac."], ["🌍", "#ffedd5", "Cross-Border Ready", "Zonos-powered duties, taxes, and landed cost for US-Canada e-commerce."], ["🔌", "#e0e7ff", "Open REST API", "Integrates with ShipTime, Shopify, WooCommerce, and any 3PL or e-commerce system."], ["🇨🇦", "#fce7f3", "Bilingual (FR/EN)", "Native French and English across app, POS screens, SMS, and email notifications."], ["📊", "#fef3c7", "IoT-Enabled Lockers", "Real-time monitoring via AWS IoT Core. 4G LTE + Wi-Fi with offline queuing."]].map(([ic, bg, t, d]) => (
            <div key={t} className="fcard" style={{ background: "#fff", borderRadius: 16, padding: "2rem 1.8rem", border: "1px solid rgba(0,0,0,.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18, background: bg }}>{ic}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 10 }}>{t}</h3>
              <p style={{ fontSize: 14, color: T.gray, lineHeight: 1.65 }}>{d}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* QUOTE */}
      <section style={{ padding: "5rem 0" }}><div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: T.orange, marginBottom: 10 }}>Shipping Rates</div>
          <h2 style={{ fontSize: "clamp(2rem,3.5vw,2.6rem)", fontWeight: 800, color: T.navy }}>Compare rates. Save up to 70%.</h2>
        </div>
        <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,.06)", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {["Package", "Envelope", "LTL Freight", "Locker-to-Locker"].map(t => (<button key={t} onClick={() => setSt(t)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", background: st === t ? T.orange : T.off, color: st === t ? "#fff" : T.sub }}>{t}</button>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, alignItems: "end" }}>
            <Inp label="From" placeholder="H2X 1Y4" value={fp} onChange={e => setFp(e.target.value)} />
            <Inp label="To" placeholder="M5V 2T6" value={tp} onChange={e => setTp(e.target.value)} />
            <Inp label="Weight (kg)" placeholder="2.5" type="number" value={wt} onChange={e => setWt(e.target.value)} />
            <Btn onClick={getQ} style={{ marginBottom: 14, height: 44 }}>Get Quote</Btn>
          </div>
          {qt && <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 14 }}>{qt.length} options — save up to {Math.round((1 - qt[0].p / qt[0].lp) * 100)}%</div>
            {qt.map((q, i) => (<div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, marginBottom: 6, background: i === 0 ? "rgba(245,148,30,.08)" : T.off, border: i === 0 ? "1px solid rgba(245,148,30,.25)" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 22 }}>{q.l}</span><div><div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{q.n} — {q.s}</div><div style={{ fontSize: 12, color: T.gray }}>{q.d} day{q.d > 1 ? "s" : ""}</div></div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: T.gray, textDecoration: "line-through" }}>${q.lp.toFixed(2)}</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: M, color: i === 0 ? T.orange : T.navy }}>${q.p.toFixed(2)}</div></div><Btn sm onClick={() => onNav("register")}>{i === 0 ? "Best Rate →" : "Select"}</Btn></div>
            </div>))}
          </div>}
        </div>
      </div></section>

      {/* CTA */}
      <section style={{ padding: "5rem 0", background: "linear-gradient(135deg," + T.navy + ",#0a2e54,#0e3b6e)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: 600, height: 600, background: "radial-gradient(circle,rgba(245,148,30,.1),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", padding: "0 2rem" }}>
          <h2 style={{ fontSize: "clamp(2rem,4vw,2.6rem)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>Ready to modernize your last-mile?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginBottom: 32 }}>Join our Quebec pilot. 50 smart lockers deploying across Montreal, Laval, and Longueuil. 90-day free trial for enterprise clients.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}><Btn onClick={() => onNav("register")}>Start Free Pilot →</Btn><Btn v="ghost">Contact Sales</Btn></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: T.navy, color: "rgba(255,255,255,.5)", padding: "4rem 0 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg," + T.orange + "," + T.orangeLt + ")", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>M</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>MesColis.ca</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>Quebec-based technology company building Canada's first open, carrier-agnostic smart locker network. Bilingual. Purpose-built for Canada.</p>
            </div>
            {[{ t: "Product", l: ["B2B Lockers", "B2C Delivery", "C2C Shipping", "POS Walk-Up", "API Docs"] }, { t: "Company", l: ["About", "Careers", "Blog", "Contact"] }, { t: "Legal", l: ["Privacy", "Terms", "Bill 96"] }].map(c => (
              <div key={c.t}><h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginBottom: 16 }}>{c.t}</h4>{c.l.map(l => (<a key={l} href="/#" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.55)", textDecoration: "none", marginBottom: 10 }}>{l}</a>))}</div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>© 2026 MesColis Inc.</span><span>pilot@mescolis.ca</span></div>
        </div>
      </footer>
    </div>
  );
}

/* ─── LOGIN ─── */
function LoginPage({ onNav, onLogin }) {
  const [em, setEm] = useState(""); const [pw, setPw] = useState(""); const [ad, setAd] = useState(false);
  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "linear-gradient(135deg," + T.navy + ",#0a2e54)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 400, background: "#fff", borderRadius: 16, padding: 36, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg," + T.orange + "," + T.orangeLt + ")", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 14 }}>M</div>
          <h2 style={{ color: T.navy, fontSize: 22, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: T.gray, fontSize: 13 }}>Sign in to MesColis</p>
        </div>
        <Inp label="Email" type="email" placeholder="you@company.ca" value={em} onChange={e => setEm(e.target.value)} />
        <Inp label="Password" type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, cursor: "pointer", fontSize: 13, color: T.gray }}><input type="checkbox" checked={ad} onChange={e => setAd(e.target.checked)} /> Sign in as Admin</label>
        <Btn full onClick={() => { if (em && pw) onLogin(em, ad); }}>Sign In</Btn>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: T.gray }}>No account? <span onClick={() => onNav("register")} style={{ color: T.blue, cursor: "pointer", fontWeight: 600 }}>Sign Up</span></p>
        <p style={{ textAlign: "center", marginTop: 10 }}><span onClick={() => onNav("landing")} style={{ fontSize: 12, color: T.gray, cursor: "pointer" }}>← Back to home</span></p>
      </div>
    </div>
  );
}

/* ─── REGISTER ─── */
function RegisterPage({ onNav, onLogin }) {
  const [fm, setFm] = useState({ fn: "", ln: "", em: "", pw: "", co: "", at: "Business" });
  const u = (k, v) => setFm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "linear-gradient(135deg," + T.navy + ",#0a2e54)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 16, padding: 36, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg," + T.orange + "," + T.orangeLt + ")", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 14 }}>M</div>
          <h2 style={{ color: T.navy, fontSize: 22, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: T.gray, fontSize: 13 }}>Start your free pilot</p>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 18, justifyContent: "center" }}>
          {["Business", "Consumer"].map(t => (<button key={t} onClick={() => u("at", t)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", background: fm.at === t ? T.orange : T.off, color: fm.at === t ? "#fff" : T.sub }}>{t}</button>))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}><Inp label="First Name" value={fm.fn} onChange={e => u("fn", e.target.value)} /><Inp label="Last Name" value={fm.ln} onChange={e => u("ln", e.target.value)} /></div>
        <Inp label="Email" type="email" placeholder="you@company.ca" value={fm.em} onChange={e => u("em", e.target.value)} />
        {fm.at === "Business" && <Inp label="Company" value={fm.co} onChange={e => u("co", e.target.value)} />}
        <Inp label="Password" type="password" placeholder="Min 8 characters" value={fm.pw} onChange={e => u("pw", e.target.value)} />
        <Btn full onClick={() => { if (fm.em && fm.pw) onLogin(fm.em, false); }}>Create Account</Btn>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: T.gray }}>Have an account? <span onClick={() => onNav("login")} style={{ color: T.blue, cursor: "pointer", fontWeight: 600 }}>Sign In</span></p>
      </div>
    </div>
  );
}

/* ─── ROUTER ─── */
export default function LandingPage({ page, onNav, onLogin }) {
  if (page === "login") return <LoginPage onNav={onNav} onLogin={onLogin} />;
  if (page === "register") return <RegisterPage onNav={onNav} onLogin={onLogin} />;
  return <HomePage onNav={onNav} />;
}
