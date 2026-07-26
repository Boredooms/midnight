import { Buffer } from 'buffer';

(window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

export const CONTRACT_ADDRESS = '0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5dd5b';
