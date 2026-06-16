import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from '@/components/toast';
import { useStore } from '@/lib/store';

describe('Toast', () => {
  beforeEach(() => {
    useStore.setState({
      toast: { message: '', visible: false },
    });
  });

  it('does not render visible toast when hidden', () => {
    const { container } = render(<Toast />);
    const status = container.querySelector('[role="status"]');
    expect(status).toBeInTheDocument();
    expect(status?.className).not.toContain('animate-in');
  });

  it('shows message when toast is visible', () => {
    useStore.setState({ toast: { message: 'Added to cart', visible: true } });
    render(<Toast />);
    expect(screen.getByText('Added to cart')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    useStore.setState({ toast: { message: 'Hello', visible: true } });
    const { container } = render(<Toast />);
    const el = container.querySelector('[role="status"]');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
