const steps = [
  {
    number: '01',
    title: 'Pick your area & date',
    description:
      'Search by neighbourhood. DHA, Gulshan, Clifton — every verified court in your area shows up, with live availability.',
  },
  {
    number: '02',
    title: 'Lock your slot',
    description: 'Tap a time, confirm in one screen. Pay via JazzCash, Easypaisa, or settle at the venue. No calls. No follow-ups.',
  },
  {
    number: '03',
    title: 'Show up & play',
    description: 'You get an SMS confirmation. Walk in, play your game. No waiting for the manager to pick up.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border-subtle px-6 py-16 sm:px-10 lg:px-20">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-faint">The process</div>
      <h2 className="mb-12 font-heading text-[28px] font-bold tracking-[-0.5px] text-fg">From kickoff idea to kickoff</h2>

      <div className="grid gap-10 sm:grid-cols-3 sm:gap-12">
        {steps.map((step) => (
          <div key={step.number}>
            <div className="mb-5 font-heading text-[56px] font-bold leading-none text-primary/25">{step.number}</div>
            <h3 className="mb-2.5 font-heading text-lg font-bold text-fg">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
