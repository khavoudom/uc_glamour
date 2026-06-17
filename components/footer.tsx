'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Footer() {
  const router = useRouter();
  const { showToast } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email');
      return;
    }
    showToast('Subscribed! Check your inbox for offers.');
    setEmail('');
  };

  const footerLink = (label: string, href: string) => (
    <span
      key={label}
      onClick={() => router.push(href)}
      className="text-[11px] text-white/35 cursor-pointer"
    >
      {label}
    </span>
  );

  return (
    <footer className="bg-[#111110] px-7 pt-10 pb-5">
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-6 pb-7 border-b border-white/[0.06]">
        <div>
          <div
            onClick={() => router.push('/')}
            className="font-heading text-[22px] font-normal text-white mb-2 cursor-pointer"
          >
            Glam<em style={{ color: 'var(--color-pink)', fontStyle: 'italic' }}>our</em>
          </div>
          <div className="text-[11px] text-white/35 leading-[1.65] mb-4 max-w-55">
            Clean, effective beauty essentials crafted for every complexion. Feel radiant, look
            stunning.
          </div>
          <div
            className="rounded-[10px] p-3.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="text-xs font-medium text-white mb-0.75">Don&apos;t miss our offers</div>
            <div className="text-[10px] text-white/35 mb-2.5">
              Beauty tips, exclusive deals, and new arrivals
            </div>
            <div className="flex gap-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                placeholder="your@email.com"
                className="flex-1 border-none rounded-sm px-2.5 py-1.75 text-[11px] text-white font-sans outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                }}
              />
              <button
                onClick={handleSubscribe}
                className="bg-pink border-none rounded-sm px-3 py-1.75 text-[11px] font-medium text-white font-sans cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-white tracking-[0.5px] uppercase mb-3">
            Products
          </div>
          <div className="flex flex-col gap-1.75">
            {[
              { label: 'New Arrivals', href: '/products?filter=new-arrivals' },
              { label: 'Bestsellers', href: '/products?filter=bestsellers' },
              { label: 'Sale', href: '/products?filter=sale' },
              { label: 'Bundles', href: '/bundles' },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => router.push(link.href)}
                className="text-[11px] text-white/35 cursor-pointer"
              >
                {link.label}
              </span>
            ))}
          </div>
          <div className="text-[11px] font-medium text-white tracking-[0.5px] uppercase mb-3 mt-[18px]">
            Collections
          </div>
          <div className="flex flex-col gap-1.75">
            {[
              { label: 'Night Cream', href: '/collections/night-cream' },
              { label: 'Skin Toner', href: '/collections/skin-toner' },
              { label: 'Body Wash', href: '/collections/body-wash' },
              { label: 'Day Cream', href: '/collections/day-cream' },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => router.push(link.href)}
                className="text-[11px] text-white/35 cursor-pointer"
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-white tracking-[0.5px] uppercase mb-3">
            Company
          </div>
          <div className="flex flex-col gap-1.75">
            {[
              { label: 'About Us', href: '/about' },
              { label: 'Our Story', href: '/our-story' },
              { label: 'Careers', href: '/careers' },
              { label: 'Press', href: '/press' },
              { label: 'Sustainability', href: '/sustainability' },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => router.push(link.href)}
                className="text-[11px] text-white/35 cursor-pointer"
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-white tracking-[0.5px] uppercase mb-3">
            Support
          </div>
          <div className="flex flex-col gap-1.75">
            {[
              { label: 'Help Center', href: '/help' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'Track Order', href: '/track-order' },
              { label: 'Returns', href: '/returns' },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => router.push(link.href)}
                className="text-[11px] text-white/35 cursor-pointer"
              >
                {link.label}
              </span>
            ))}
          </div>
          <div className="text-[11px] font-medium text-white tracking-[0.5px] uppercase mb-3 mt-[18px]">
            Legal
          </div>
          <div className="flex flex-col gap-1.75">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookie-policy' },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => router.push(link.href)}
                className="text-[11px] text-white/35 cursor-pointer"
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 text-[10px] text-white/25">
        <span>&copy; 2026 Glamour. All rights reserved.</span>
        <div className="flex gap-2.5">
          {['instagram', 'facebook', 'twitter', 'pinterest'].map((social) => (
            <span
              key={social}
              onClick={() => window.open(`https://${social}.com`, '_blank')}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                border: '0.5px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {social === 'instagram' && (
                  <>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </>
                )}
                {social === 'facebook' && (
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                )}
                {social === 'twitter' && (
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                )}
                {social === 'pinterest' && (
                  <>
                    <path d="M10 13.5 8 22" />
                    <path d="M16.5 8.5c0 2.5-1.5 4.5-4 4.5s-3.5-2-3.5-4.5S10.5 4 13 4s3.5 2 3.5 4.5Z" />
                    <circle cx="12" cy="12" r="10" />
                  </>
                )}
              </svg>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
