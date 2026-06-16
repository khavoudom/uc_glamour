interface StatusBadgeProps {
  status: string;
  type?: 'payment' | 'fulfillment';
}

const paymentColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: 'var(--color-bg)', color: 'var(--color-muted)' },
  Paid: { bg: 'var(--color-success-lt)', color: 'var(--color-success)' },
  Refunded: { bg: '#fef2f2', color: 'var(--color-danger)' },
  Failed: { bg: '#fef2f2', color: 'var(--color-danger)' },
};

const fulfillmentColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: 'var(--color-bg)', color: 'var(--color-muted)' },
  Confirmed: { bg: 'var(--color-gold-lt)', color: 'var(--color-gold)' },
  Processing: { bg: 'var(--color-pink-lt)', color: 'var(--color-pink)' },
  Shipped: { bg: '#e0f2fe', color: '#0369a1' },
  Delivered: { bg: 'var(--color-success-lt)', color: 'var(--color-success)' },
  Completed: { bg: 'var(--color-success-lt)', color: 'var(--color-success)' },
};

export default function StatusBadge({ status, type = 'payment' }: StatusBadgeProps) {
  const colors =
    type === 'payment'
      ? paymentColors[status] || paymentColors.Pending
      : fulfillmentColors[status] || fulfillmentColors.Pending;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 10,
        fontSize: 10,
        fontWeight: 500,
        background: colors.bg,
        color: colors.color,
      }}
    >
      {status}
    </span>
  );
}
