import Image from "next/image";
import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="public-site-header">
      <Link href="/" aria-label="Spurs Over Stetsons home">
        <Image src="/spurs-over-stetsons-logo.webp" alt="Spurs Over Stetsons Dance Hall" width={720} height={720} priority />
      </Link>
      <nav aria-label="Main navigation">
        <Link href="#coming-soon">Coming Soon</Link>
        <Link href="/login" className="staff-link">Staff Login</Link>
      </nav>
    </header>
  );
}
