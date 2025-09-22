"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header-nav.module.css";

export default function HeaderNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "🏠 Etusivu" },
    { href: "/test-article", label: "🧪 Test Article" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          📰 Prompt Manager
        </Link>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
