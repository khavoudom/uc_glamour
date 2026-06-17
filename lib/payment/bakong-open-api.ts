import 'server-only';

import axios from 'axios';
import QRCode from 'qrcode';
import { BakongKHQR, IndividualInfo, MerchantInfo, khqrData } from 'bakong-khqr';
import { logger } from '@/lib/logger';

const log = logger('payment/bakong-open-api');

type BakongCurrency = 'USD' | 'KHR';

export interface CreateBakongKHQRPaymentParams {
  orderId: number;
  amount: number;
  currency?: BakongCurrency;
  customerPhone?: string;
  expiresInMinutes?: number;
}

export interface BakongKHQRPaymentResponse {
  qrString: string;
  qrImage: string;
  md5: string;
  amount: number;
  currency: BakongCurrency;
}

export interface BakongOpenAPIConfig {
  baseUrl: string;
  token: string;
  accountId: string;
  merchantName: string;
  merchantCity: string;
  merchantType: 'individual' | 'merchant';
  merchantId: string;
  acquiringBank: string;
  configured: boolean;
}

export interface BakongTransactionData {
  hash?: string;
  fromAccountId?: string;
  toAccountId?: string;
  currency?: string;
  amount?: number | string;
  description?: string;
  createdDateMs?: number;
}

export interface BakongTransactionCheckResult {
  paid: boolean;
  responseCode?: number;
  errorCode?: number;
  message?: string;
  transaction?: BakongTransactionData;
}

interface BakongSDKResponse {
  status?: {
    code?: number;
    errorCode?: number | null;
    message?: string | null;
  };
  data?: {
    qr?: string;
    md5?: string;
  };
}

interface BakongOpenAPIResponse {
  responseCode?: number;
  errorCode?: number;
  responseMessage?: string;
  message?: string;
  data?: BakongTransactionData;
}

interface BakongAccountCheckResponse {
  responseCode?: number;
  responseMessage?: string;
  errorCode?: number;
}

export class BakongOpenAPIError extends Error {
  httpStatus?: number;
  apiCode?: number;

  constructor(message: string, options?: { httpStatus?: number; apiCode?: number }) {
    super(message);
    this.name = 'BakongOpenAPIError';
    this.httpStatus = options?.httpStatus;
    this.apiCode = options?.apiCode;
  }
}

export function getBakongOpenAPIConfig(): BakongOpenAPIConfig {
  const baseUrl =
    process.env.BAKONG_OPEN_API_BASE_URL?.replace(/\/$/, '') ?? 'https://api-bakong.nbc.gov.kh';
  const token = process.env.BAKONG_OPEN_API_TOKEN || '';
  const accountId = process.env.BAKONG_KHQR_ACCOUNT_ID || '';
  const merchantName = process.env.BAKONG_KHQR_MERCHANT_NAME || 'Glamour Shop';
  const merchantCity = process.env.BAKONG_KHQR_MERCHANT_CITY || 'Phnom Penh';
  const merchantType =
    process.env.BAKONG_KHQR_MERCHANT_TYPE === 'merchant' ? 'merchant' : 'individual';
  const merchantId = process.env.BAKONG_KHQR_MERCHANT_ID || '';
  const acquiringBank = process.env.BAKONG_KHQR_ACQUIRING_BANK || '';

  const configured =
    !!accountId && !!token && (merchantType === 'individual' || (!!merchantId && !!acquiringBank));

  log.debug('Config resolved', {
    baseUrl,
    token: token ? '***redacted***' : '(missing)',
    accountId: accountId || '(missing)',
    merchantName,
    merchantCity,
    merchantType,
    merchantId: merchantId || '(missing)',
    acquiringBank: acquiringBank || '(missing)',
    configured,
  });

  return {
    baseUrl,
    token,
    accountId,
    merchantName,
    merchantCity,
    merchantType,
    merchantId,
    acquiringBank,
    configured,
  };
}

function toBakongCurrency(currency: BakongCurrency): number {
  return currency === 'USD' ? khqrData.currency.usd : khqrData.currency.khr;
}

function assertSuccessfulKHQRResponse(response: BakongSDKResponse): asserts response is {
  status: { code: number; errorCode: null; message: null };
  data: { qr: string; md5: string };
} {
  if (response.status?.code !== 0 || !response.data?.qr || !response.data?.md5) {
    const details = response.status?.message ?? response.status?.errorCode ?? 'Unknown SDK error';
    throw new BakongOpenAPIError(`Bakong KHQR generation failed: ${details}`);
  }
}

export async function checkBakongAccountExists(accountId?: string): Promise<boolean> {
  const config = getBakongOpenAPIConfig();
  const resolvedAccountId = accountId ?? config.accountId;

  if (!resolvedAccountId) {
    throw new BakongOpenAPIError('Bakong account ID is not configured.');
  }

  try {
    const res = await axios.post<BakongAccountCheckResponse>(
      `${config.baseUrl}/v1/check_account_exist`,
      { accountId: resolvedAccountId },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15_000,
      },
    );

    if (res.data.responseCode === 0) {
      return true;
    }

    if (res.data.errorCode === 11) {
      return false;
    }

    throw new BakongOpenAPIError(
      res.data.responseMessage ?? `Bakong account check failed with code ${res.data.errorCode}`,
      { apiCode: res.data.errorCode ?? res.data.responseCode },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as BakongAccountCheckResponse | undefined;
      throw new BakongOpenAPIError(
        responseData?.responseMessage ?? error.message ?? 'Bakong account check failed',
        {
          httpStatus: error.response?.status,
          apiCode: responseData?.errorCode ?? responseData?.responseCode,
        },
      );
    }

    throw error;
  }
}

export async function createBakongKHQRPayment(
  params: CreateBakongKHQRPaymentParams,
): Promise<BakongKHQRPaymentResponse> {
  const config = getBakongOpenAPIConfig();
  if (!config.configured) {
    throw new BakongOpenAPIError(
      config.merchantType === 'merchant'
        ? 'Bakong Open API is not configured. Set BAKONG_OPEN_API_TOKEN, BAKONG_KHQR_ACCOUNT_ID, BAKONG_KHQR_MERCHANT_ID, and BAKONG_KHQR_ACQUIRING_BANK.'
        : 'Bakong Open API is not configured. Set BAKONG_OPEN_API_TOKEN and BAKONG_KHQR_ACCOUNT_ID.',
    );
  }

  const currency = params.currency ?? 'USD';
  const amount = Number(params.amount.toFixed(currency === 'USD' ? 2 : 0));
  const expiresInMinutes = params.expiresInMinutes ?? 10;
  const optionalData = {
    currency: toBakongCurrency(currency),
    amount,
    billNumber: params.orderId.toString(),
    mobileNumber: params.customerPhone?.replace(/[\s\-+]/g, ''),
    storeLabel: config.merchantName,
    terminalLabel: 'Web checkout',
    expirationTimestamp: Date.now() + expiresInMinutes * 60 * 1000,
    merchantCategoryCode: '5999',
  };

  const khqr = new BakongKHQR();
  const response =
    config.merchantType === 'merchant'
      ? (khqr.generateMerchant(
          new MerchantInfo(
            config.accountId,
            config.merchantName,
            config.merchantCity,
            config.merchantId,
            config.acquiringBank,
            optionalData,
          ),
        ) as BakongSDKResponse)
      : (khqr.generateIndividual(
          new IndividualInfo(
            config.accountId,
            config.merchantName,
            config.merchantCity,
            optionalData,
          ),
        ) as BakongSDKResponse);

  assertSuccessfulKHQRResponse(response);

  const qrImage = await QRCode.toDataURL(response.data.qr, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
  });

  return {
    qrString: response.data.qr,
    qrImage,
    md5: response.data.md5,
    amount,
    currency,
  };
}

export async function checkBakongTransactionByMd5(
  md5: string,
): Promise<BakongTransactionCheckResult> {
  const config = getBakongOpenAPIConfig();
  if (!config.configured) {
    throw new BakongOpenAPIError('Bakong Open API is not configured.');
  }

  try {
    const res = await axios.post<BakongOpenAPIResponse>(
      `${config.baseUrl}/v1/check_transaction_by_md5`,
      { md5 },
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
      },
    );

    const responseCode = res.data.responseCode;
    const transaction = res.data.data;
    return {
      paid: responseCode === 0 && !!transaction,
      responseCode,
      errorCode: res.data.errorCode,
      message: res.data.responseMessage ?? res.data.message,
      transaction,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as BakongOpenAPIResponse | undefined;
      const message =
        responseData?.responseMessage ??
        responseData?.message ??
        error.message ??
        'Bakong transaction check failed';

      log.error('Transaction check failed', {
        httpStatus: error.response?.status,
        apiCode: responseData?.errorCode ?? responseData?.responseCode,
        response: responseData,
      });

      throw new BakongOpenAPIError(message, {
        httpStatus: error.response?.status,
        apiCode: responseData?.errorCode ?? responseData?.responseCode,
      });
    }

    throw error;
  }
}
