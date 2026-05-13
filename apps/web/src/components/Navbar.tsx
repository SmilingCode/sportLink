"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Browse games" },
  { href: "/games/create", label: "Create game" },
  { href: "/profile", label: "My profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="px-6 pt-5 sm:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[18px] border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--sportlink-border)] px-5 py-4 sm:px-6">
          <Link href="/" className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--sportlink-green)]">
            Sportlink
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl border border-[#66665f] px-5 py-2 text-sm font-semibold text-[#f2f0e8] transition hover:border-[#7b7a73] hover:bg-[#353530]"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl border border-[#8a887f] px-5 py-2 text-sm font-semibold text-[#f2f0e8] transition hover:bg-[#353530]"
            >
              Sign up
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-8 px-5 sm:px-6">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--sportlink-green)] text-[var(--sportlink-green)]"
                    : "border-transparent text-[var(--sportlink-text-soft)] hover:text-[#efede5]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
