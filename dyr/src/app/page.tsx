"use client";

import { useState, useEffect, useCallback } from "react";

interface Diario {
  nombre: string;
  url: string;
  dominio: string;
}

const DIARIOS: Diario[] = [
  { nombre: "Clarín", url: "https://www.clarin.com", dominio: "www.clarin.com" },
  { nombre: "La Nación", url: "https://www.lanacion.com.ar", dominio: "www.lanacion.com.ar" },
  { nombre: "Infobae", url: "https://www.infobae.com", dominio: "www.infobae.com" },
  { nombre: "Página/12", url: "https://www.pagina12.com.ar", dominio: "www.pagina12.com.ar" },
  { nombre: "Ámbito Financiero", url: "https://www.ambito.com", dominio: "www.ambito.com" },
  { nombre: "Perfil", url: "https://www.perfil.com", dominio: "www.perfil.com" },
  { nombre: "Crónica", url: "https://www.cronica.com.ar", dominio: "www.cronica.com.ar" },
  { nombre: "El Destape", url: "https://www.eldestapeweb.com", dominio: "www.eldestapeweb.com" },
  { nombre: "La Voz (Córdoba)", url: "https://www.lavoz.com.ar", dominio: "www.lavoz.com.ar" },
  { nombre: "El Día (La Plata)", url: "https://www.eldia.com", dominio: "www.eldia.com" },
  { nombre: "Los Andes (Mendoza)", url: "https://www.losandes.com.ar", dominio: "www.losandes.com.ar" },
  { nombre: "La Capital (Rosario)", url: "https://www.lacapital.com.ar", dominio: "www.lacapital.com.ar" },
  { nombre: "Diario Popular", url: "https://www.diariopopular.com.ar", dominio: "www.diariopopular.com.ar" },
  { nombre: "Télam", url: "https://www.telam.com.ar", dominio: "www.telam.com.ar" },
];

function GrillaDiarios({ onSelect }: { onSelect: (d: Diario) => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDF6E3", color: "#1A1A1A" }}>
      <header className="py-6 px-4 text-center border-b-2 border-[#1A1A1A]">
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "48px", fontWeight: "bold", lineHeight: 1.1 }}>
          D&amp;R
        </h1>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", marginTop: "4px" }}>
          El puesto de diarios no cerr&oacute;. Se mud&oacute;.
        </p>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIARIOS.map((diario) => (
            <button
              key={diario.dominio}
              onClick={() => onSelect(diario)}
              className="flex items-center gap-4 w-full text-left border-2 border-[#1A1A1A] px-5 py-4 cursor-pointer"
              style={{
                backgroundColor: "#FDF6E3",
                minHeight: "90px",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${diario.dominio}&sz=64`}
                alt=""
                width={48}
                height={48}
                style={{ flexShrink: 0 }}
              />
              <span>{diario.nombre}</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="py-4 text-center border-t-2 border-[#1A1A1A]" style={{ fontSize: "14px" }}>
        Buenos Aires &middot; 2026
      </footer>
    </div>
  );
}

function Lector({ diario, onBack }: { diario: Diario; onBack: () => void }) {
  const [blocked, setBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setBlocked(true);
  }, []);

  useEffect(() => {
    // Timeout fallback: if iframe hasn't loaded in 5 seconds, assume blocked
    const timer = setTimeout(() => {
      if (!loaded) {
        setBlocked(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#FDF6E3", color: "#1A1A1A" }}>
      <header
        className="flex items-center border-b-2 border-[#1A1A1A] px-3 py-0"
        style={{ minHeight: "64px", flexShrink: 0 }}
      >
        <button
          onClick={onBack}
          className="border-2 border-[#1A1A1A] px-4 py-3 font-bold cursor-pointer"
          style={{
            backgroundColor: "#1A1A1A",
            color: "#FDF6E3",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          &larr; Volver a D&amp;R
        </button>
        <span
          className="flex-1 text-center font-bold truncate px-3"
          style={{ fontSize: "20px" }}
        >
          {diario.nombre}
        </span>
      </header>

      {blocked ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>
            Este diario no permite lectura integrada
          </p>
          <a
            href={diario.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-[#1A1A1A] px-6 py-4 font-bold"
            style={{
              backgroundColor: "#1A1A1A",
              color: "#FDF6E3",
              fontSize: "22px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Abrir en el navegador
          </a>
        </div>
      ) : (
        <iframe
          src={diario.url}
          title={diario.nombre}
          onLoad={handleLoad}
          onError={handleError}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<Diario | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (selected) {
    return <Lector diario={selected} onBack={() => setSelected(null)} />;
  }

  return <GrillaDiarios onSelect={setSelected} />;
}
