export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "The Vitamin Glow Powder is unlike anything I've tried. My skin looks airbrushed from morning to night — absolutely obsessed.",
      author: 'Sophie Laurent',
      initials: 'SL',
      bg: '#fde8f0',
      color: '#c0305a',
      location: 'Paris',
    },
    {
      quote:
        "I've been using the Radiance Serum for three weeks. My skin is noticeably smoother and more even. Best investment in my routine.",
      author: 'Maya Rodriguez',
      initials: 'MR',
      bg: '#eaf3de',
      color: '#3b6d11',
      location: 'New York',
    },
    {
      quote:
        "Glamour's packaging is beautiful but the formulas are even better. The Satin Lip Gloss stays on all day and isn't sticky at all.",
      author: 'Joanna Kim',
      initials: 'JK',
      bg: '#eeedfe',
      color: '#534ab7',
      location: 'Seoul',
    },
  ];

  return (
    <div className="bg-white px-7 py-12">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="font-heading text-[26px] font-normal text-text">What our customers say</h2>
          <p className="text-xs text-muted mt-0.5">Real reviews from real people</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {testimonials.map((t) => (
          <div key={t.author} className="bg-bg border border-border rounded-md p-5">
            <div className="text-gold text-[13px] mb-2.5">★★★★★</div>
            <div className="font-heading text-[13px] text-text leading-[1.7] mb-3.5 italic font-light">
              &ldquo;{t.quote}&rdquo;
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{ background: t.bg, color: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-xs font-medium text-text">{t.author}</div>
                <div className="text-[10px] text-muted">Verified buyer · {t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
