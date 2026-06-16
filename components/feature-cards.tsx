const features = [
  {
    icon: 'truck',
    title: 'Free Delivery',
    desc: 'On all orders over $100, delivered worldwide',
  },
  {
    icon: 'refresh',
    title: 'Easy Returns',
    desc: '30-day hassle-free returns, no questions asked',
  },
  {
    icon: 'leaf',
    title: 'Clean Beauty',
    desc: 'Cruelty-free, vegan, sustainably sourced',
  },
  {
    icon: 'message',
    title: 'Expert Advice',
    desc: 'Live beauty consultants available 24/7',
  },
];

export default function FeatureCards() {
  return (
    <div className="features-strip px-7 pb-10 grid grid-cols-4 gap-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="feat-tile bg-white border-[0.5px] border-[var(--color-border)] rounded-xl p-[18px] flex gap-3 items-start"
        >
          <div className="feat-ico w-9 h-9 bg-[var(--color-pink-lt)] rounded-lg flex items-center justify-center shrink-0">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-pink)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {f.icon === 'truck' && (
                <>
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </>
              )}
              {f.icon === 'refresh' && (
                <>
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </>
              )}
              {f.icon === 'leaf' && (
                <>
                  <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </>
              )}
              {f.icon === 'message' && (
                <>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </>
              )}
            </svg>
          </div>
          <div>
            <div className="feat-title text-xs font-medium text-[var(--color-text)] mb-0.5">
              {f.title}
            </div>
            <div className="feat-desc text-[10px] text-[var(--color-muted)] leading-relaxed">
              {f.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
