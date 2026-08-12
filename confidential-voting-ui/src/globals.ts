import { Buffer } from 'buffer';

(window as unknown as { Buffer: typeof Buffer; process: object }).Buffer = Buffer;
(window as unknown as { process: object }).process = { env: {} };

export const formatContractAddress = (address: string): string => {
  let cleaned = address.trim();
  if (cleaned.startsWith('0x') || cleaned.startsWith('0X')) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.length > 64) {
    cleaned = cleaned.slice(0, 64);
  }
  return cleaned.toLowerCase();
};

/** Default demo contract address — configurable via VITE_CONTRACT_ADDRESS env var */
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ??
  '79bda166f07754080384f07744c742033cabff15f3ba428433e25d413cf2bb8b';
