import Image from "next/image";
import Link from "next/link";

const LOGIN_URL = "https://my.e-ballroom.com/login";

export function PublicHeader() {
  return (
    <header className="public-site-header">
      <Link href="/" aria-label="Spurs Over Stetsons home">
        <Image src="/spurs-over-stetsons-logo.webp" alt="Spurs Over Stetsons Dance Hall" width={720} height={720} priority />
      </Link>
      <nav aria-label="Main navigation">
        <a href={LOGIN_URL} target="_blank" rel="noreferrer">Login</a>
      </nav>
    </header>
  );
}
