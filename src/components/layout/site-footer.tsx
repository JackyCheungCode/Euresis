export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a className="wordmark wordmark-footer" href="/">EURESIS<span>®</span></a>
        <p>Precision performance wheels.<br />Engineered with intent.</p>
        <a className="footer-top-link" href="#main">Back to top ↑</a>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} EURESIS. ALL RIGHTS RESERVED.</span><span>DESIGNED FOR THE DRIVE.</span></div>
    </footer>
  );
}
