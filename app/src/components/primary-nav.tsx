"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PRIMARY_NAV } from "@/lib/navigation";

/**
 * Section nav with a real current-page state. The only client JavaScript in the shell:
 * it is what makes "where am I" legible on a site whose sections are six, not sixty.
 */
export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sezioni" className="border-y border-rule">
      <ul className="page-shell flex items-center gap-0.5 overflow-x-auto py-0 [scrollbar-width:none]">
        {PRIMARY_NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap px-3 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink hover:bg-paper-deep hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
