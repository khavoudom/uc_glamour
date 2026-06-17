import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/product-card';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const mockProduct: Product = {
  id: '1',
  name: 'Velvet Matte Lipstick',
  brand: 'Glamour',
  category: 'Lips',
  price: 24.99,
  originalPrice: 29.99,
  emoji: '💄',
  description: 'A long-lasting matte lipstick.',
  rating: 4.5,
  reviewCount: 100,
  shades: [
    { name: 'Ruby Red', hex: '#c0392b', stock: 50 },
    { name: 'Berry Bliss', hex: '#8e44ad', stock: 30 },
  ],
  badge: 'SALE',
  isNew: false,
};

const mockProductNoBadge: Product = {
  ...mockProduct,
  id: '2',
  badge: null,
  originalPrice: undefined,
  shades: [],
};

describe('ProductCard', () => {
  beforeEach(() => {
    useStore.setState({
      wishlist: [],
      cart: [],
      isAuthenticated: false,
      cartCount: 0,
      subtotal: 0,
      shippingCost: 0,
      couponDiscount: 0,
      activeCoupon: null,
    });
  });

  it('renders product name, brand, price, and emoji', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    expect(screen.getByText('Velvet Matte Lipstick')).toBeInTheDocument();
    expect(screen.getByText('Glamour')).toBeInTheDocument();
    expect(screen.getByText('$24.99')).toBeInTheDocument();
    expect(screen.getByText('💄')).toBeInTheDocument();
  });

  it('shows SALE badge when product has badge', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    expect(screen.getByText('SALE')).toBeInTheDocument();
  });

  it('hides badge when product has no badge', () => {
    render(<ProductCard product={mockProductNoBadge} onSelect={() => {}} />);
    expect(screen.queryByText('SALE')).not.toBeInTheDocument();
  });

  it('shows original price with strikethrough', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('shows shade swatches when product has shades', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    expect(screen.getByTitle('Ruby Red')).toBeInTheDocument();
    expect(screen.getByTitle('Berry Bliss')).toBeInTheDocument();
  });

  it('does not show shades section when product has no shades', () => {
    render(<ProductCard product={mockProductNoBadge} onSelect={() => {}} />);
    expect(screen.queryByTitle('Ruby Red')).not.toBeInTheDocument();
  });

  it('calls onSelect when article is clicked', async () => {
    const user = userEvent.setup();
    let selected: Product | null = null;
    render(
      <ProductCard
        product={mockProduct}
        onSelect={(p) => {
          selected = p;
        }}
      />,
    );
    await user.click(screen.getByRole('article'));
    expect(selected?.id).toBe('1');
  });

  it('wishlist heart is filled when product is wishlisted', () => {
    useStore.setState({ wishlist: ['1'] });
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    const heart = document.querySelector('.p-card-wish svg');
    expect(heart).toHaveAttribute('fill', '#fff');
  });

  it('wishlist heart is outlined when product is not wishlisted', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    const heart = document.querySelector('.p-card-wish svg');
    expect(heart).toHaveAttribute('fill', 'none');
  });

  it('renders stars and review count', () => {
    render(<ProductCard product={mockProduct} onSelect={() => {}} />);
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });
});
