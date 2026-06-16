'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import axios from 'axios';
import { ChevronLeft, CreditCard, QrCode, Truck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { createOrderAndRedirect } from '@/app/actions/orders';
import type { CreateOrderInput } from '@/app/actions/orders';

interface ShippingServiceOption {
  id: number;
  name: string;
  price: string;
  estimatedDelivery: string;
  isActive: boolean;
}

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const emptyForm: ShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

function validateForm(data: ShippingForm): Partial<Record<keyof ShippingForm, string>> {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};
  if (!data.fullName.trim() || data.fullName.trim().length < 2)
    errors.fullName = 'Name is required';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Valid email required';
  if (!data.phone.trim() || data.phone.trim().length < 6) errors.phone = 'Phone number required';
  if (!data.address.trim() || data.address.trim().length < 5) errors.address = 'Address required';
  if (!data.city.trim() || data.city.trim().length < 2) errors.city = 'City required';
  if (!data.state.trim() || data.state.trim().length < 2) errors.state = 'State required';
  if (!data.zip.trim() || data.zip.trim().length < 3) errors.zip = 'ZIP code required';
  if (!data.country.trim() || data.country.trim().length < 2) errors.country = 'Country required';
  return errors;
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-text">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-sm border px-3 py-[10px] text-[13px] font-sans text-text outline-none transition-[border-color] duration-150 ${
          error ? 'border-danger' : 'border-border-md'
        }`}
      />
      {error && <p className="mt-[2px] text-[11px] text-danger">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const {
    cart,
    subtotal,
    shippingCost,
    couponDiscount,
    activeCoupon,
    clearCart,
    selectedShippingServiceId: shippingServiceId,
    setSelectedShippingService,
  } = useStore();

  // All hooks must be before any early returns
  const [shipping, setShipping] = useState<ShippingForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingForm, boolean>>>({});
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'khqr' | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [khqrLoading, setKhqrLoading] = useState(false);
  const [khqrError, setKhqrError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [khqrOrderId, setKhqrOrderId] = useState<number | null>(null);
  const [, setIsSubmitting] = useState(false);
  const [orderError] = useState<string | null>(null);
  const [statusChecking, setStatusChecking] = useState(false);
  const [shippingServices, setShippingServices] = useState<ShippingServiceOption[]>([]);

  useEffect(() => {
    fetch('/api/shipping-services')
      .then((r) => r.json())
      .then((data) => setShippingServices(data))
      .catch(() => {});
  }, []);

  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingCost);

  const formErrors = useMemo(() => validateForm(shipping), [shipping]);

  const isFormValid = useMemo(
    () => Object.keys(formErrors).length === 0 && Object.values(shipping).every((v) => v.trim()),
    [formErrors, shipping],
  );

  const handleBlur = useCallback(
    (field: keyof ShippingForm) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors(validateForm(shipping));
    },
    [shipping],
  );

  const updateField = useCallback((field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Build order items payload
  const orderItemsPayload = useMemo(
    () =>
      cart.map((item) => ({
        productId: parseInt(item.productId, 10),
        productName: item.name,
        emoji: item.emoji,
        shade: item.shade,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    [cart],
  );

  // Build the base order input (shared by PayPal + KHQR)
  const buildOrderInput = useCallback(
    (paymentId?: string): CreateOrderInput => ({
      items: orderItemsPayload,
      subtotal,
      shippingCost,
      couponDiscount,
      total: grandTotal,
      paymentMethod: selectedMethod as 'paypal' | 'khqr',
      shippingInfo: {
        fullName: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
      },
      paymentId,
      shippingServiceId,
    }),
    [
      orderItemsPayload,
      subtotal,
      shippingCost,
      couponDiscount,
      grandTotal,
      selectedMethod,
      shipping,
      shippingServiceId,
    ],
  );

  const handleInitiateKHQR = useCallback(async () => {
    if (!isFormValid || khqrLoading) return;
    setKhqrLoading(true);
    setKhqrError(null);
    setQrImage(null);

    try {
      const res = await axios.post('/api/khqr/create-payment', {
        items: orderItemsPayload,
        subtotal,
        shippingCost,
        couponDiscount,
        total: grandTotal,
        shippingInfo: {
          fullName: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          country: shipping.country,
        },
        shippingServiceId,
      });

      setQrImage(res.data.qrImage);
      setKhqrOrderId(res.data.orderId);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : 'Failed to generate QR code';
      setKhqrError(message);
    } finally {
      setKhqrLoading(false);
    }
  }, [
    isFormValid,
    khqrLoading,
    orderItemsPayload,
    subtotal,
    shippingCost,
    couponDiscount,
    grandTotal,
    shipping,
    shippingServiceId,
  ]);

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!khqrOrderId || statusChecking) return;
    setStatusChecking(true);
    setKhqrError(null);

    try {
      const res = await axios.get(`/api/khqr/status?orderId=${khqrOrderId}`);
      const data = res.data;

      console.log('[KHQR] Status check response:', JSON.stringify(data, null, 2));

      if (data.isPaid) {
        clearCart();
        router.push(`/checkout/confirmation/${khqrOrderId}`);
      } else if (data.paymentStatus === 'Failed') {
        setKhqrError('Payment was not successful. Please try again.');
        setQrImage(null);
        setKhqrOrderId(null);
      } else if (data.error) {
        setKhqrError(`Unable to check payment: ${data.error}. Please try again.`);
      }
      // Payment still pending — silently wait for next poll
    } catch (err) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : 'Failed to check payment status';
      setKhqrError(message);
    } finally {
      setStatusChecking(false);
    }
  }, [khqrOrderId, statusChecking, clearCart, router]);

  // Dev mode: press "/" key to instantly mark as paid and go to success page
  useEffect(() => {
    if (!qrImage || !khqrOrderId) return;
    const handler = async (e: KeyboardEvent) => {
      if (e.key === '/' && qrImage && khqrOrderId) {
        e.preventDefault();
        try {
          await axios.post('/api/khqr/dev-mark-paid', { orderId: khqrOrderId });
        } catch {
          // Dev shortcut — best-effort notification
        }
        clearCart();
        router.push(`/checkout/confirmation/${khqrOrderId}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [qrImage, khqrOrderId, clearCart, router]);

  // Auto-poll: silently check payment status every 5 seconds
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const isPollingRef = useRef(false);
  const POLL_TIMEOUT_SECONDS = 300; // 5 minutes max

  useEffect(() => {
    if (qrImage && khqrOrderId) {
      pollCountRef.current = 0;
      console.log('[KHQR] Starting auto-poll for order', khqrOrderId);

      pollingRef.current = setInterval(async () => {
        pollCountRef.current += 1;
        if (pollCountRef.current * 5 >= POLL_TIMEOUT_SECONDS) {
          console.log('[KHQR] Polling timed out after 5 minutes for order', khqrOrderId);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }
        if (isPollingRef.current) return;
        isPollingRef.current = true;
        try {
          const res = await axios.get(`/api/khqr/status?orderId=${khqrOrderId}`);
          const data = res.data;
          if (data.isPaid) {
            clearCart();
            router.push(`/checkout/confirmation/${khqrOrderId}`);
          }
        } catch {
          // silently ignore poll errors
        } finally {
          isPollingRef.current = false;
        }
      }, 5000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [qrImage, khqrOrderId, clearCart, router]);

  // PayPal callbacks
  const handleCreatePayPalOrder = useCallback(async (): Promise<string> => {
    const res = await axios.post('/api/paypal/create-order', { amount: grandTotal });
    return res.data.orderId;
  }, [grandTotal]);

  const handlePayPalApprove = useCallback(
    async (data: { orderID: string }) => {
      setIsSubmitting(true);
      setPaypalError(null);

      try {
        const captureRes = await axios.post('/api/paypal/capture-order', { orderId: data.orderID });
        const captureData = captureRes.data;

        if (captureData.status !== 'COMPLETED') {
          throw new Error(captureData.error || 'Payment capture failed');
        }

        clearCart();
        await createOrderAndRedirect(buildOrderInput(data.orderID));
      } catch (err) {
        setPaypalError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
        setIsSubmitting(false);
      }
    },
    [buildOrderInput, clearCart],
  );

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-5">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // --- Empty cart ---
  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-5">
        <div className="max-w-[400px] rounded-lg border border-border bg-white p-10 text-center">
          <span className="text-5xl" aria-hidden="true">
            🛒
          </span>
          <p className="mt-3 mb-1 text-sm font-medium text-text">Your cart is empty</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 cursor-pointer rounded-full bg-pink px-6 py-[10px] text-[13px] font-medium font-sans text-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[960px] px-7 py-10">
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="mb-5 flex cursor-pointer items-center gap-1 border-none bg-none p-0 text-xs text-muted font-sans"
        >
          <ChevronLeft size={14} />
          Continue Shopping
        </button>

        <div className="mb-7 flex items-center gap-[10px]">
          <h1 className="font-heading m-0 text-[28px] font-normal text-text">Checkout</h1>
          <Lock size={14} className="text-muted" />
          <span className="text-[11px] text-muted">Secure checkout</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[1fr_360px] items-start gap-7">
          {/* ============= LEFT COLUMN ============= */}
          <div className="flex flex-col gap-6">
            {/* ── Shipping Information ── */}
            <section className="rounded-lg border border-border bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Truck size={18} className="text-pink" />
                <h2 className="m-0 text-base font-medium text-text">Shipping Information</h2>
              </div>

              <div className="flex flex-col gap-[14px]">
                <InputField
                  label="Full Name"
                  value={shipping.fullName}
                  onChange={(v) => updateField('fullName', v)}
                  error={touched.fullName ? errors.fullName : undefined}
                  placeholder="John Doe"
                  onBlur={() => handleBlur('fullName')}
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Email"
                    type="email"
                    value={shipping.email}
                    onChange={(v) => updateField('email', v)}
                    error={touched.email ? errors.email : undefined}
                    placeholder="john@example.com"
                    onBlur={() => handleBlur('email')}
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(v) => updateField('phone', v)}
                    error={touched.phone ? errors.phone : undefined}
                    placeholder="+855 12 345 678"
                    onBlur={() => handleBlur('phone')}
                  />
                </div>
                <InputField
                  label="Address"
                  value={shipping.address}
                  onChange={(v) => updateField('address', v)}
                  error={touched.address ? errors.address : undefined}
                  placeholder="123 Main Street"
                  onBlur={() => handleBlur('address')}
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="City"
                    value={shipping.city}
                    onChange={(v) => updateField('city', v)}
                    error={touched.city ? errors.city : undefined}
                    placeholder="Phnom Penh"
                    onBlur={() => handleBlur('city')}
                  />
                  <InputField
                    label="State"
                    value={shipping.state}
                    onChange={(v) => updateField('state', v)}
                    error={touched.state ? errors.state : undefined}
                    placeholder="Phnom Penh"
                    onBlur={() => handleBlur('state')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="ZIP Code"
                    value={shipping.zip}
                    onChange={(v) => updateField('zip', v)}
                    error={touched.zip ? errors.zip : undefined}
                    placeholder="12000"
                    onBlur={() => handleBlur('zip')}
                  />
                  <InputField
                    label="Country"
                    value={shipping.country}
                    onChange={(v) => updateField('country', v)}
                    error={touched.country ? errors.country : undefined}
                    placeholder="Cambodia"
                    onBlur={() => handleBlur('country')}
                  />
                </div>
              </div>
            </section>

            {/* ── Shipping Method ── */}
            {shippingServices.length > 0 && (
              <section className="rounded-lg border border-border bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Truck size={18} className="text-pink" />
                  <h2 className="m-0 text-base font-medium text-text">Shipping Method</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {shippingServices.map((svc) => {
                    const price = Number(svc.price);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setSelectedShippingService(svc.id, price)}
                        className={`flex w-full cursor-pointer items-center gap-[14px] rounded-md bg-white p-4 text-left font-sans ${
                          shippingServiceId === svc.id
                            ? 'border-[1.5px] border-pink'
                            : 'border border-border'
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full transition-[border] duration-150 ${
                            shippingServiceId === svc.id
                              ? 'border-[5px] border-pink'
                              : 'border-[1.5px] border-hint'
                          }`}
                        />
                        <div>
                          <div className="text-[13px] font-medium text-text">{svc.name}</div>
                          <div className="text-[11px] text-muted">
                            {price === 0 ? 'Free' : `$${price.toFixed(2)}`} &middot;{' '}
                            {svc.estimatedDelivery}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Payment Method ── */}
            <section className="rounded-lg border border-border bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-pink" />
                <h2 className="m-0 text-base font-medium text-text">Payment Method</h2>
              </div>

              <div className="flex flex-col gap-3">
                {/* PayPal Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  className={`flex w-full cursor-pointer items-center gap-[14px] rounded-md bg-white p-4 text-left font-sans ${
                    selectedMethod === 'paypal'
                      ? 'border-[1.5px] border-pink'
                      : 'border border-border'
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full transition-[border] duration-150 ${
                      selectedMethod === 'paypal'
                        ? 'border-[5px] border-pink'
                        : 'border-[1.5px] border-hint'
                    }`}
                  />
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                    <rect width="24" height="24" rx="4" fill="#003087" />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="Arial"
                    >
                      P
                    </text>
                  </svg>
                  <div>
                    <div className="text-[13px] font-medium text-text">PayPal</div>
                    <div className="text-[11px] text-muted">Pay with your PayPal account</div>
                  </div>
                </button>

                {/* Bakong KHQR Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('khqr')}
                  className={`flex w-full cursor-pointer items-center gap-[14px] rounded-md bg-white p-4 text-left font-sans ${
                    selectedMethod === 'khqr'
                      ? 'border-[1.5px] border-pink'
                      : 'border border-border'
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full transition-[border] duration-150 ${
                      selectedMethod === 'khqr'
                        ? 'border-[5px] border-pink'
                        : 'border-[1.5px] border-hint'
                    }`}
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#1a237e]">
                    <QrCode size={18} color="white" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-text">Bakong KHQR</div>
                    <div className="text-[11px] text-muted">Scan with any Bakong member app</div>
                  </div>
                </button>
              </div>

              {/* ── Payment Area (shown when method selected + form valid) ── */}
              {selectedMethod && isFormValid && (
                <div className="mt-5 border-t border-border pt-5">
                  {selectedMethod === 'paypal' && (
                    <div>
                      {paypalClientId ? (
                        <PayPalScriptProvider
                          options={{
                            clientId: paypalClientId,
                            currency: 'USD',
                            intent: 'capture',
                          }}
                        >
                          <PayPalButtons
                            createOrder={handleCreatePayPalOrder}
                            onApprove={handlePayPalApprove}
                            onCancel={() => {
                              // user closed the popup — do nothing
                            }}
                            onError={(err) => {
                              const paypalErr = err as { message?: string } | undefined;
                              if (
                                paypalErr?.message?.includes('Detected popup close') ||
                                paypalErr?.message?.includes('popup')
                              ) {
                                return; // user closed the popup — do nothing
                              }
                              console.error('PayPal error:', err);
                              setPaypalError('Payment failed. Please try again.');
                            }}
                            style={{ layout: 'vertical', shape: 'rect', height: 45 }}
                          />
                        </PayPalScriptProvider>
                      ) : (
                        <div className="rounded-sm border border-border bg-gold-lt p-4 text-xs text-text">
                          <div className="mb-1 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-gold" />
                            <span className="font-medium">PayPal Unavailable</span>
                          </div>
                          <p className="m-0 text-muted">
                            PayPal is not configured yet. Please choose another payment method or
                            contact support.
                          </p>
                        </div>
                      )}
                      {paypalError && (
                        <div className="mt-3 flex items-center gap-1.5 rounded-sm bg-[rgba(163,32,32,0.08)] p-[10px] text-xs text-danger">
                          <AlertCircle size={14} />
                          {paypalError}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod === 'khqr' && (
                    <div className="text-center">
                      {!qrImage && !khqrLoading && (
                        <>
                          <p className="mb-4 text-[13px] text-muted">Pay with Bakong KHQR</p>
                          <button
                            type="button"
                            onClick={handleInitiateKHQR}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-pink p-[13px] text-[13px] font-medium font-sans text-white"
                          >
                            <QrCode size={16} />
                            Pay with Bakong KHQR - ${grandTotal.toFixed(2)}
                          </button>
                        </>
                      )}

                      {khqrLoading && (
                        <div className="flex items-center justify-center gap-2 p-10 text-muted">
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-[13px]">Generating payment QR code...</span>
                        </div>
                      )}

                      {qrImage && (
                        <>
                          <div className="inline-block rounded-md border border-border bg-white p-3">
                            <img
                              src={qrImage}
                              alt="Bakong KHQR Code"
                              className="block h-[200px] w-[200px]"
                            />
                          </div>
                          <p className="mt-3 mb-1 text-[13px] font-medium text-text">
                            Scan with any Bakong member app
                          </p>
                          <p className="mx-auto my-2 inline-block rounded-sm bg-pink-lt px-4 py-1 text-xl font-semibold text-text">
                            ${grandTotal.toFixed(2)}
                          </p>
                          {khqrOrderId && (
                            <p className="my-1 text-[11px] text-muted">Order #{khqrOrderId}</p>
                          )}
                          <div className="mb-4 mt-2">
                            <span className="inline-block rounded-full bg-gold-lt px-[10px] py-[3px] text-[11px] font-medium text-gold">
                              Payment Pending
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCheckPaymentStatus}
                            disabled={statusChecking}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-pink p-[13px] text-[13px] font-medium font-sans text-white disabled:cursor-not-allowed disabled:bg-pink-mid"
                          >
                            I Have Paid
                          </button>
                        </>
                      )}

                      {khqrError && (
                        <div className="mt-3 flex items-start gap-1.5 rounded-sm bg-[rgba(163,32,32,0.08)] p-[10px] text-left text-xs text-danger">
                          <AlertCircle size={14} className="mt-[1px] shrink-0" />
                          <span>{khqrError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* General submission error */}
                  {orderError && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-sm bg-[rgba(163,32,32,0.08)] p-[10px] text-xs text-danger">
                      <AlertCircle size={14} />
                      {orderError}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── Security reassurance ── */}
            <div className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted">
              <Lock size={12} />
              Your payment information is processed securely
            </div>
          </div>

          {/* ============= RIGHT COLUMN — Order Summary ============= */}
          <div className="sticky top-5 rounded-lg border border-border bg-white p-5">
            <h3 className="m-0 mb-4 text-base font-medium text-text">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            <div className="mb-4 flex flex-col gap-[10px]">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.shade}`}
                  className="flex items-center gap-[10px] border-b border-border py-2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-bg text-xl">
                    {item.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-text">{item.name}</div>
                    <div className="text-[11px] text-muted">
                      {item.shade || 'Standard'} &times; {item.quantity}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-xs font-medium text-text">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({activeCoupon?.code})</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-[2px] flex justify-between border-t border-border pt-2 text-base font-semibold text-text">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Selection reminder */}
            {!selectedMethod && isFormValid && (
              <div className="mt-4 rounded-sm bg-pink-lt p-[10px] text-center text-[11px] text-text">
                Select a payment method above to complete your order
              </div>
            )}

            {!isFormValid && (
              <div className="mt-4 rounded-sm bg-pink-lt p-[10px] text-center text-[11px] text-text">
                Please fill in your shipping information first
              </div>
            )}

            {/* Accepted payment methods */}
            <div className="mt-4 border-t border-border pt-[14px]">
              <div className="mb-2 text-[10px] uppercase tracking-[0.5px] text-muted">
                Accepted Payments
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-sm border border-border bg-bg px-2 py-[4px] text-[10px] text-text">
                  PayPal
                </div>
                <div className="rounded-sm border border-border bg-bg px-2 py-[4px] text-[10px] text-text">
                  Bakong KHQR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
