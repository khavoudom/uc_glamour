declare module 'bakong-khqr' {
  export const khqrData: {
    currency: {
      usd: number;
      khr: number;
    };
    merchantType: {
      merchant: string;
      individual: string;
    };
  };

  export class IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      optional?: Record<string, unknown>,
    );
  }

  export class MerchantInfo extends IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      merchantID: string,
      acquiringBank: string,
      optional?: Record<string, unknown>,
    );
  }

  export class BakongKHQR {
    generateIndividual(individualInfo: IndividualInfo): unknown;
    generateMerchant(merchantInfo: MerchantInfo): unknown;
    static verify(khqrString: string): { isValid: boolean };
    static decode(khqrString: string): unknown;
    static decodeNonKhqr(khqrString: string): unknown;
    static generateDeepLink(url: string, qr: string, sourceInfo?: unknown): Promise<unknown>;
    static checkBakongAccount(url: string, bakongID: string): Promise<unknown>;
  }
}
