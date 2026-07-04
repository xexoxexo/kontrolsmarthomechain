"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import styles from "./page.module.css";

const Logo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0Z" fill="#E8F1FA" />
    <path d="M15 12C15 12 10 16 10 22C10 25.314 12.686 28 16 28C19.314 28 22 25.314 22 22C22 16 15 12 15 12Z" fill="#3B82F6" />
    <path d="M26 18C26 18 23 20 23 24C23 26.209 24.791 28 27 28C29.209 28 31 26.209 31 24C31 20 26 18 26 18Z" fill="#3B82F6" />
  </svg>
);

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/iot');
    }
  }, [isConnected, router]);

  const handleEnter = () => {
    if (isConnected) {
      router.push('/iot');
    } else {
      alert("Silahkan klik 'Connect Wallet' di kanan atas terlebih dahulu untuk masuk!");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        <div className={styles.walletContainer}>
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.centerIcon}>
          <Logo size={48} />
        </div>

        <h1 className={styles.title}>
          Kendalikan <strong>Smart Home</strong> Anda dengan Kekuatan AI
        </h1>

        <p className={styles.subtitle}>
          Sistem IoT interaktif berbasis Gemini AI. Nyalakan dan matikan lampu rumah Anda dari mana saja dengan kendali suara pintar dan keamanan blockchain.
        </p>

        <div className={styles.actions}>
          <button
            onClick={handleEnter}
            className={styles.primaryButton}
            style={{ opacity: isConnected ? 1 : 0.6 }}
          >
            Masuk
          </button>
        </div>
      </main>
    </div>
  );
}
