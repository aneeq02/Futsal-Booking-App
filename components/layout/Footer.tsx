import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { KARACHI_AREAS } from '@/lib/constants';

const playerLinks = [
  { label: 'Browse Courts', href: '/courts' },
  { label: 'My Bookings', href: '/courts' },
  { label: 'How It Works', href: '/#how-it-works' },
];

const ownerLinks = [
  { label: 'List Your Court', href: '/register' },
  { label: 'Owner Dashboard', href: '/dashboard' },
  { label: 'Pricing', href: '/register' },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 pb-10 pt-12 sm:px-10 lg:px-20">
      <div className="mb-10 flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div>
          <Logo size="sm" />
          <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-faint">
            Karachi&apos;s futsal booking network. For players, by players.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16">
          <FooterColumn title="For Players" links={playerLinks} />
          <FooterColumn title="For Owners" links={ownerLinks} />
          <FooterColumn
            title="Areas"
            links={KARACHI_AREAS.slice(0, 3).map((area) => ({ label: area, href: `/courts?areas=${area}` }))}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 sm:flex-row">
        <span className="text-xs text-faint">© {new Date().getFullYear()} footy. Built for Karachi.</span>
        <span className="text-xs text-faint">Privacy · Terms · Contact</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-faint">{title}</div>
      <div className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-[13px] text-muted hover:text-fg">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
