const CONTACT_EMAIL = "spursoverstetsonsla@gmail.com";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <p>Spurs Over Stetsons Dance Hall</p>
      <span>Alexandria, Louisiana</span>
      <small><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></small>
    </footer>
  );
}
