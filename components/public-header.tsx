import Image from "next/image";
import Link from "next/link";

const EBALLROOM_URL = "https://www.eballroom.com";

export function PublicHeader() {
  return (
    <header className="public-site-header">
      <Link href="/" aria-label="Spurs Over Stetsons home">
        <Image src="/spurs-over-stetsons-logo.webp" alt="Spurs Over Stetsons Dance Hall" width={720} height={720} priority />
      </Link>
      <nav aria-label="Main navigation">
        <a href={EBALLROOM_URL} target="_blank" rel="noreferrer">eBallroom Login</a>
      </nav>
    </header>
  );
}
