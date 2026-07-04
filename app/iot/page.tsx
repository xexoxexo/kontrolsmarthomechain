"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import styles from "./iot.module.css";

export default function IoTControl() {
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [iotStatus, setIotStatus] = useState<"OFF" | "ON">("OFF");

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isConnecting, router]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); 
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio context error:", e);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    playBeep(); // Bunyi futuristik kecil sebelum AI membaca
    
    // Memberikan jeda sebelum membaca agar suara beep terdengar jelas
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Bahasa Indonesia
      utterance.pitch = 1.2;    // Sedikit lebih tinggi (suara AI)
      utterance.rate = 1.0;     // Kecepatan normal
      window.speechSynthesis.speak(utterance);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    const cmd = userMsg.toLowerCase();
    if (cmd === "plase on" || cmd === "please on") {
      setIotStatus("ON");
    } else if (cmd === "plase off" || cmd === "please off") {
      setIotStatus("OFF");
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      
      if (data.text) {
        setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
        speak(data.text);
      }
    } catch (error) {
      console.error(error);
      const errMsg = "Terjadi kesalahan saat menghubungi sistem pusat.";
      setMessages((prev) => [...prev, { role: "ai", text: errMsg }]);
      speak(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isConnecting || !isConnected) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', color: '#fff', backgroundColor: '#090d16' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Menghubungkan ke Wallet...</p>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Harap tunggu sebentar.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>&larr; Kembali ke Dashboard</Link>
        <h1 className={styles.title}>IoT Command Center</h1>
        <div className={`${styles.statusBadge} ${iotStatus === "ON" ? styles.on : styles.off}`}>
          STATUS SISTEM: {iotStatus}
        </div>
      </header>

      <main className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <p>Menunggu instruksi...</p>
              <p>Ketik <strong>&quot;plase on&quot;</strong> untuk MENGHIDUPKAN perangkat IOT.</p>
              <p>Ketik <strong>&quot;plase off&quot;</strong> untuk MEMATIKAN perangkat IOT.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.messageWrapper} ${msg.role === "user" ? styles.user : styles.ai}`}>
              <div className={styles.messageBubble}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.messageWrapper} ${styles.ai}`}>
              <div className={styles.messageBubble}>Response...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Masukkan perintah (misal: plase on)..."
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading || !input.trim()}>
            Kirim
          </button>
        </form>
      </main>
    </div>
  );
}
