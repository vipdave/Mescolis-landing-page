import { useState } from "react";

const T = {
  navy: "#0B1426", dark: "#0f1923", surf: "#141f2e",
  blue: "#1B6EC2", orange: "#F5941E", orangeLt: "#ffa940",
  gray: "#8899aa", sub: "#4a5568"
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
const LOCKERS = [
  { id: 1, code: "MTL-001", name: "Place Ville Marie", addr: "1 Place Ville Marie", city: "Montreal", total: 28, avail: 19 },
  { id: 2, code: "MTL-002", name: "Complexe Desjardins", addr: "150 Ste-Catherine W", city: "Montreal", total: 36, avail: 24 },
  { id: 3, code: "LAV-001", name: "Carrefour Laval", addr: "3003 Boul Le Carrefour", city: "Laval", total: 28, avail: 12 },
  { id: 4, code: "LNG-001", name: "Place Longueuil", addr: "825 Rue St-Laurent O", city: "Longueuil", total: 24, avail: 20 },
  { id: 5, code: "MTL-003", name: "Gare Centrale", addr: "895 De La Gauchetière O", city: "Montreal", total: 36, avail: 8 },
];
const SHIPS = [
  { id: 1, tr: "MC20260215847291", cr: "Purolator", sv: "Express", fr: "Montreal, QC", to: "Toronto, ON", pr: 18.42, st: "Delivered", dt: "Feb 15" },
  { id: 2, tr: "MC20260218392745", cr: "Canada Post", sv: "Xpresspost", fr: "Montreal, QC", to: "Halifax, NS", pr: 15.84, st: "In Transit", dt: "Feb 18" },
  { id: 3, tr: "MC20260219551823", cr: "DHL", sv: "Express", fr: "Laval, QC", to: "New York, NY", pr: 32.56, st: "In Transit", dt: "Feb 19" },
  { id: 4, tr: "MC20260220174936", cr: "UPS", sv: "Standard", fr: "Montreal, QC", to: "Vancouver, BC", pr: 13.26, st: "Label Created", dt: "Feb 20" },
  { id: 5, tr: "MC20260212663148", cr: "FedEx", sv: "Economy", fr: "Montreal, QC", to: "Ottawa, ON", pr: 14.88, st: "Delivered", dt: "Feb 12" },
];
const USERS = [
  { id: "u1", em: "sarah.chen@logistics.ca", nm: "Sarah Chen", co: "QuickShip Logistics", tp: "Business", act: true, jn: "Jan 5", sh: 142, sp: 3847.5 },
  { id: "u2", em: "marc.dubois@gmail.com", nm: "Marc Dubois", co: null, tp: "Consumer", act: true, jn: "Jan 12", sh: 8, sp: 124.8 },
  { id: "u3", em: "ops@greendelivery.com", nm: "Lisa Park", co: "Green Delivery Co", tp: "Business", act: true, jn: "Jan 18", sh: 89, sp: 2156.3 },
  { id: "u4", em: "j.tremblay@hotmail.com", nm: "Jacques Tremblay", co: null, tp: "Consumer", act: false, jn: "Jan 22", sh: 3, sp: 42.6 },
  { id: "u5", em: "warehouse@mtlfullfill.ca", nm: "Amir Hassan", co: "MTL Fulfillment", tp: "Business", act: true, jn: "Feb 1", sh: 267, sp: 6892.1 },
  { id: "u6", em: "natalie.wang@purolator.com", nm: "Natalie Wang", co: "Purolator", tp: "Business", act: true, jn: "Feb 3", sh: 1204, sp: 28450 },
  { id: "u7", em: "pierre@etsy-shop.ca", nm: "Pierre Gagnon", co: "Artisan Pierre", tp: "Business", act: true, jn: "Feb 8", sh: 34, sp: 612.4 },
  { id: "u8", em: "emma.roy@outlook.com", nm: "Emma Roy", co: null, tp: "Consumer", act: true, jn: "Feb 14", sh: 1, sp: 15.84 },
];

/* ─── Components ─── */
function Btn({ children, v = "primary", sm, full, onClick, style: sx }) {
  const map = {
    primary: { background: T.orange, color: "#fff", border: "none", boxShadow: "0 2px 12px rgba(245,148,30,.3)" },
    outline: { background: "transparent", color: T.orange, border: "1.5px solid rgba(255,255,255,.15)" },
  };
  return (<button onClick={onClick} style={{ borderRadius: sm ? 6 : 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: sm ? 12 : 14, padding: sm ? "7px 14px" : "11px 22px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto", transition: "all .3s", ...map[v], ...sx }}>{children}</button>);
}
function Inp({ label, ...p }) {
  return (<div style={{ marginBottom: 14 }}>{label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.45)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>}<input {...p} style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box", ...p.style }} /></div>);
}
function Crd({ children, style: sx }) { return <div style={{ background: T.surf, border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 20, ...sx }}>{children}</div>; }
function Bdg({ children, c = T.blue }) { return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: c, background: c + "20" }}>{children}</span>; }
function StBdg({ s }) { const m = { "Delivered": "#34d399", "In Transit": T.blue, "Label Created": T.orange }; return <Bdg c={m[s] || T.gray}>{s}</Bdg>; }
function SC({ icon, label, value, change }) {
  return (<Crd style={{ flex: 1, minWidth: 150 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 26 }}>{icon}</span>{change && <Bdg c={change > 0 ? "#34d399" : T.orange}>{change > 0 ? "+" : ""}{change}%</Bdg>}</div><div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: M, marginTop: 6 }}>{value}</div><div style={{ fontSize: 12, color: T.gray, marginTop: 3 }}>{label}</div></Crd>);
}

/* ─── SIDEBAR ─── */
function Sidebar({ page, setPage, user, isAdmin, onLogout }) {
  const NI = ({ k, ic, lb }) => (<button onClick={() => setPage(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Outfit',sans-serif", marginBottom: 2, background: page === k ? "rgba(245,148,30,.12)" : "transparent", color: page === k ? T.orange : T.gray }}><span style={{ fontSize: 15 }}>{ic}</span>{lb}</button>);
  return (
    <div style={{ width: 220, minHeight: "100vh", background: T.dark, borderRight: "1px solid rgba(255,255,255,.06)", padding: "18px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", marginBottom: 28 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg," + T.orange + "," + T.orangeLt + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>M</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>MesColis</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "rgba(255,255,255,.04)", borderRadius: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(245,148,30,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.orange }}>{user.fn[0]}</div>
        <div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{user.fn}</div><div style={{ fontSize: 10, color: T.gray }}>{user.role}</div></div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.2)", padding: "0 10px", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Main</div>
        {[["dashboard", "📊", "Dashboard"], ["quote", "💰", "Quote & Ship"], ["shipments", "📦", "Shipments"], ["lockers", "🔐", "Smart Lockers"], ["tracking", "📍", "Track"]].map(([k, i, l]) => (<NI key={k} k={k} ic={i} lb={l} />))}
        {isAdmin && <>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.2)", padding: "0 10px", marginTop: 20, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Admin</div>
          {[["admin", "⚙️", "Admin Panel"], ["admin-users", "👥", "Users DB"]].map(([k, i, l]) => (<NI key={k} k={k} ic={i} lb={l} />))}
        </>}
      </div>
      <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit',sans-serif", background: "transparent", color: "rgba(255,255,255,.3)" }}>🚪 Sign Out</button>
    </div>
  );
}

/* ─── PAGES ─── */
function DashboardPg() {
  const mo = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]; const sd = [32, 48, 41, 67, 58, 73]; const rd = [680, 1120, 940, 1580, 1340, 1820]; const mx = Math.max(...sd); const mr = Math.max(...rd);
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Shipping Dashboard</h2>
    <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}><SC icon="📦" label="Total Shipments" value="319" change={12.4} /><SC icon="🚚" label="In Transit" value="7" /><SC icon="✅" label="Delivered" value="298" change={8.2} /><SC icon="💰" label="Savings" value="$4,280" change={15.6} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
      <Crd><div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>Shipment Volume</div><div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>{mo.map((m, i) => (<div key={m} style={{ flex: 1, textAlign: "center" }}><div style={{ height: (sd[i] / mx) * 100, background: "linear-gradient(180deg," + T.orange + "," + T.orange + "60)", borderRadius: "5px 5px 0 0", minHeight: 6 }} /><div style={{ fontSize: 10, color: T.gray, marginTop: 5 }}>{m}</div></div>))}</div></Crd>
      <Crd><div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>Revenue</div><div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>{mo.map((m, i) => (<div key={m} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 9, color: T.gray, marginBottom: 3 }}>${rd[i]}</div><div style={{ height: (rd[i] / mr) * 90, background: "linear-gradient(180deg," + T.blue + "," + T.blue + "60)", borderRadius: "5px 5px 0 0", minHeight: 6 }} /><div style={{ fontSize: 10, color: T.gray, marginTop: 5 }}>{m}</div></div>))}</div></Crd>
    </div>
    <Crd><div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Recent Shipments</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>{["Tracking", "Carrier", "Route", "Price", "Status", "Date"].map(h => (<th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 600, color: T.gray, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
        <tbody>{SHIPS.map(s => (<tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}><td style={{ padding: 10, fontFamily: M, fontSize: 11, color: T.blue }}>{s.tr}</td><td style={{ padding: 10, color: "#fff" }}>{s.cr} {s.sv}</td><td style={{ padding: 10, color: T.gray }}>{s.fr} → {s.to}</td><td style={{ padding: 10, fontFamily: M, color: "#fff" }}>${s.pr.toFixed(2)}</td><td style={{ padding: 10 }}><StBdg s={s.st} /></td><td style={{ padding: 10, color: T.gray }}>{s.dt}</td></tr>))}</tbody></table></Crd></div>);
}

function QuotePg() {
  const [step, setStep] = useState(0); const [fp, setFp] = useState(""); const [tp, setTp] = useState(""); const [wt, setWt] = useState(""); const [qt, setQt] = useState(null); const [sel, setSel] = useState(null); const [sType, setSType] = useState("Package");
  const getQ = () => { if (!fp || !tp || !wt) return; const w = parseFloat(wt) || 1; setQt(CARRIERS.map(c => ({ ...c, p: +(c.p * w / 2).toFixed(2), lp: +(c.lp * w / 2).toFixed(2) })).sort((a, b) => a.p - b.p)); setStep(1); };
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Quote & Ship</h2>
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>{["Shipment Details", "Choose Carrier", "Review & Pay"].map((s, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: step >= i ? T.orange : T.surf, color: step >= i ? "#fff" : T.gray }}>{i + 1}</div><span style={{ fontSize: 12, fontWeight: 600, color: step >= i ? "#fff" : T.gray }}>{s}</span>{i < 2 && <span style={{ color: T.gray, margin: "0 8px" }}>→</span>}</div>))}</div>
    {step === 0 && <Crd style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>{["Package", "Envelope", "LTL Freight", "Locker-to-Locker"].map(t => (<button key={t} onClick={() => setSType(t)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit',sans-serif", background: sType === t ? T.orange : "rgba(255,255,255,.06)", color: sType === t ? "#fff" : T.gray }}>{t}</button>))}</div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 14px" }}>From</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}><Inp label="Postal Code" placeholder="H2X 1Y4" value={fp} onChange={e => setFp(e.target.value)} /><Inp label="City" placeholder="Montreal" /></div>
      <Inp label="Street Address" placeholder="123 Rue Sainte-Catherine" />
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "10px 0 14px" }}>To</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}><Inp label="Postal Code" placeholder="M5V 2T6" value={tp} onChange={e => setTp(e.target.value)} /><Inp label="City" placeholder="Toronto" /></div>
      <Inp label="Street Address" placeholder="456 Bay Street" />
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "10px 0 14px" }}>Package</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 14px" }}><Inp label="Weight (kg)" placeholder="2.5" value={wt} onChange={e => setWt(e.target.value)} /><Inp label="Length" placeholder="30" /><Inp label="Width" placeholder="20" /><Inp label="Height" placeholder="15" /></div>
      <Btn onClick={getQ} style={{ marginTop: 8 }}>Get Rates →</Btn>
    </Crd>}
    {step === 1 && qt && <div>{qt.map((q, i) => (<div key={i} onClick={() => { setSel(q); setStep(2); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 11, marginBottom: 6, background: T.surf, border: "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 22 }}>{q.l}</span><div><div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>{q.n} — {q.s}</div><div style={{ fontSize: 11, color: T.gray }}>Est. {q.d} day{q.d > 1 ? "s" : ""}</div></div></div><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: T.gray, textDecoration: "line-through" }}>${q.lp.toFixed(2)}</div><div style={{ fontSize: 18, fontWeight: 700, fontFamily: M, color: "#fff" }}>${q.p.toFixed(2)}</div></div><Bdg c="#34d399">Save ${(q.lp - q.p).toFixed(2)}</Bdg></div></div>))}<Btn v="outline" sm onClick={() => setStep(0)} style={{ marginTop: 12 }}>← Back</Btn></div>}
    {step === 2 && sel && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Crd><h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>Summary</h3>{[["Carrier", sel.n + " — " + sel.s], ["Delivery", sel.d + " day" + (sel.d > 1 ? "s" : "")]].map(([k, v]) => (<div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13 }}><span style={{ color: T.gray }}>{k}</span><span style={{ color: "#fff", fontWeight: 600 }}>{v}</span></div>))}<div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}><span style={{ color: T.gray, fontSize: 13 }}>List Price</span><span style={{ fontSize: 13, textDecoration: "line-through", color: T.gray }}>${sel.lp.toFixed(2)}</span></div><div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}><span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>Savings</span><span style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>-${(sel.lp - sel.p).toFixed(2)}</span></div><div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0" }}><span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Total</span><span style={{ fontSize: 22, fontWeight: 700, fontFamily: M, color: T.orange }}>${sel.p.toFixed(2)}</span></div></Crd>
      <Crd><h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>💳 Payment</h3><Inp label="Card Number" placeholder="4242 4242 4242 4242" /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}><Inp label="Expiry" placeholder="MM/YY" /><Inp label="CVC" placeholder="123" /></div><div style={{ padding: 12, background: "rgba(27,110,194,.12)", borderRadius: 10, marginBottom: 16, fontSize: 12, color: T.blue }}>🔒 Secured by Stripe. PCI-DSS compliant.</div><Btn full onClick={() => setStep(3)}>Pay ${sel.p.toFixed(2)} CAD →</Btn></Crd>
    </div>}
    {step === 3 && <Crd style={{ textAlign: "center", padding: 48 }}><div style={{ fontSize: 48, marginBottom: 16 }}>✅</div><h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Shipment Created!</h3><p style={{ color: T.gray, fontSize: 14, marginBottom: 20 }}>Label generated and ready to print.</p><div style={{ display: "inline-block", padding: "10px 20px", background: T.surf, border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, fontFamily: M, fontSize: 16, color: T.blue, marginBottom: 20 }}>MC20260220{Math.floor(Math.random() * 900000 + 100000)}</div><div><Btn sm onClick={() => { setStep(0); setQt(null); setSel(null); }}>Ship Another →</Btn></div></Crd>}
  </div>);
}

function ShipmentsPg() {
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>My Shipments</h2><div style={{ display: "grid", gap: 10 }}>{SHIPS.map(s => (<Crd key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div><div><div style={{ fontFamily: M, fontSize: 11, color: T.blue, marginBottom: 2 }}>{s.tr}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.cr} — {s.sv}</div><div style={{ fontSize: 12, color: T.gray }}>{s.fr} → {s.to}</div></div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 700, fontFamily: M, color: "#fff", marginBottom: 4 }}>${s.pr.toFixed(2)}</div><StBdg s={s.st} /><div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>{s.dt}</div></div></Crd>))}</div></div>);
}

function LockersPg() {
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Smart Locker Network</h2><p style={{ color: T.gray, fontSize: 13, margin: "0 0 20px" }}>Montreal, Laval & Longueuil</p><div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}><SC icon="🔐" label="Active Lockers" value={LOCKERS.length} /><SC icon="📦" label="Available" value={LOCKERS.reduce((a, l) => a + l.avail, 0)} /></div><div style={{ display: "grid", gap: 10 }}>{LOCKERS.map(l => { const pct = Math.round(((l.total - l.avail) / l.total) * 100); return (<Crd key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(245,148,30,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔐</div><div><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{l.name}</div><div style={{ fontSize: 12, color: T.gray }}>{l.addr}, {l.city}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: M, marginTop: 2 }}>{l.code}</div></div></div><div style={{ textAlign: "right", minWidth: 130 }}><div style={{ fontSize: 12, color: T.gray, marginBottom: 6 }}>{l.avail}/{l.total} available</div><div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: pct + "%", background: pct > 80 ? T.orange : pct > 50 ? "#ECC94B" : "#34d399" }} /></div><div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{pct}% utilized</div></div></Crd>); })}</div></div>);
}

function TrackingPg() {
  const [tn, setTn] = useState(""); const [res, setRes] = useState(null);
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Track Shipment</h2><Crd style={{ maxWidth: 600 }}><div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><Inp placeholder="MC20260215847291" value={tn} onChange={e => setTn(e.target.value)} /></div><Btn onClick={() => setRes(SHIPS.find(x => x.tr === tn) || "nf")} style={{ marginBottom: 14 }}>Track</Btn></div>
    {res === "nf" && <div style={{ padding: 14, background: "rgba(245,148,30,.1)", borderRadius: 10, color: T.orange, fontSize: 13 }}>Not found.</div>}
    {res && res !== "nf" && <div style={{ marginTop: 20 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{res.cr} — {res.sv}</div><div style={{ fontSize: 12, color: T.gray }}>{res.fr} → {res.to}</div></div><StBdg s={res.st} /></div><div style={{ borderLeft: "2px solid rgba(255,255,255,.08)", paddingLeft: 20, marginLeft: 10 }}>{[{ t: "11:55 PM", d: res.dt, s: res.st }, { t: "08:45 AM", d: "Feb 16", s: "Departed Facility" }, { t: "07:00 AM", d: "Feb 16", s: "Received at Facility" }, { t: "03:20 PM", d: "Feb 15", s: "Label Created" }].map((e, i) => (<div key={i} style={{ marginBottom: 16, position: "relative" }}><div style={{ position: "absolute", left: -27, top: 2, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? T.blue : T.surf, border: "2px solid " + (i === 0 ? T.blue : "rgba(255,255,255,.1)") }} /><div style={{ fontSize: 12, color: T.gray }}>{e.t} · {e.d}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{e.s}</div></div>))}</div></div>}
  </Crd></div>);
}

function AdminPg() {
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Admin Dashboard</h2><p style={{ color: T.gray, fontSize: 13, margin: "0 0 20px" }}>Platform overview</p>
    <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}><SC icon="👥" label="Total Users" value={USERS.length} change={24} /><SC icon="🏢" label="Business" value={USERS.filter(u => u.tp === "Business").length} /><SC icon="📦" label="Shipments" value="1,748" change={18} /><SC icon="💰" label="Revenue (MTD)" value="$42,141" change={32} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Crd><div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Revenue by Segment</div>{[["B2B Carriers", 18200, T.orange], ["POS Walk-Up", 12400, T.blue], ["B2C", 7800, "#34d399"], ["C2C", 3741, "#a78bfa"]].map(([l, v, c]) => (<div key={l} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: T.gray }}>{l}</span><span style={{ fontFamily: M, color: "#fff" }}>${v.toLocaleString()}</span></div><div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.06)" }}><div style={{ height: "100%", borderRadius: 3, width: (v / 18200) * 100 + "%", background: c }} /></div></div>))}</Crd>
      <Crd><div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Top Clients</div>{USERS.filter(u => u.tp === "Business").sort((a, b) => b.sp - a.sp).slice(0, 4).map(u => (<div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}><div><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{u.nm}</div><div style={{ fontSize: 11, color: T.gray }}>{u.co}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontFamily: M, fontWeight: 600, color: "#fff" }}>${u.sp.toLocaleString()}</div><div style={{ fontSize: 10, color: T.gray }}>{u.sh} shipments</div></div></div>))}</Crd>
    </div></div>);
}

function AdminUsersPg() {
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState("All");
  const filtered = USERS.filter(u => { if (filter !== "All" && u.tp !== filter) return false; if (search) { const q = search.toLowerCase(); if (!u.nm.toLowerCase().includes(q) && !u.em.toLowerCase().includes(q) && !(u.co || "").toLowerCase().includes(q)) return false; } return true; });
  return (<div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Users Database</h2>
    <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}><div style={{ flex: 1 }}><Inp placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} /></div><div style={{ display: "flex", gap: 4 }}>{["All", "Business", "Consumer"].map(f => (<button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit',sans-serif", background: filter === f ? T.orange : "rgba(255,255,255,.06)", color: filter === f ? "#fff" : T.gray }}>{f}</button>))}</div></div>
    <Crd style={{ padding: 0, overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>{["User", "Email", "Type", "Shipments", "Spent", "Joined", "Status"].map(h => (<th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 10, fontWeight: 600, color: T.gray, textTransform: "uppercase", background: "rgba(255,255,255,.03)" }}>{h}</th>))}</tr></thead>
      <tbody>{filtered.map(u => (<tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}><td style={{ padding: "12px 14px" }}><div style={{ fontWeight: 600, color: "#fff" }}>{u.nm}</div>{u.co && <div style={{ fontSize: 11, color: T.gray }}>{u.co}</div>}</td><td style={{ padding: "12px 14px", color: T.gray }}>{u.em}</td><td style={{ padding: "12px 14px" }}><Bdg c={u.tp === "Business" ? T.blue : T.orange}>{u.tp}</Bdg></td><td style={{ padding: "12px 14px", fontFamily: M, color: "#fff" }}>{u.sh}</td><td style={{ padding: "12px 14px", fontFamily: M, color: "#fff" }}>${u.sp.toLocaleString()}</td><td style={{ padding: "12px 14px", color: T.gray }}>{u.jn}</td><td style={{ padding: "12px 14px" }}><Bdg c={u.act ? "#34d399" : T.orange}>{u.act ? "Active" : "Inactive"}</Bdg></td></tr>))}</tbody></table></Crd>
    <div style={{ marginTop: 14, fontSize: 12, color: T.gray }}>Showing {filtered.length} of {USERS.length}</div></div>);
}

/* ─── MAIN ─── */
export default function DashboardApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const isAdmin = user.role === "Admin";
  return (
    <div style={{ display: "flex", fontFamily: "'Outfit',sans-serif", background: T.navy, color: "#fff", minHeight: "100vh" }}>
      <Sidebar page={page} setPage={setPage} user={user} isAdmin={isAdmin} onLogout={onLogout} />
      <div style={{ flex: 1, padding: 28, overflowY: "auto", maxHeight: "100vh" }}>
        {page === "dashboard" && <DashboardPg />}
        {page === "quote" && <QuotePg />}
        {page === "shipments" && <ShipmentsPg />}
        {page === "lockers" && <LockersPg />}
        {page === "tracking" && <TrackingPg />}
        {page === "admin" && <AdminPg />}
        {page === "admin-users" && <AdminUsersPg />}
        {page === "admin-lockers" && <LockersPg />}
      </div>
    </div>
  );
}
