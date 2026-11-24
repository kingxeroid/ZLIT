import { Link } from "react-router-dom";
import { Instagram, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "Lookbook", path: "/lookbook" },
  { label: "My orders", path: "/orders" },
];

export default function Footer() {
  return (
    <footer className="zl-footer">
      <div className="zl-footer-grid">
        <div className="zl-footer-brand">
          <Link to="/" className="zl-logo">
            ZL<span>IT</span>
          </Link>

          <p>Define your style.</p>
        </div>

        <div className="zl-footer-column">
          <span className="zl-footer-label">EXPLORE</span>

          {footerLinks.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="zl-footer-column">
          <span className="zl-footer-label">CONNECT</span>

          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram <ArrowUpRight size={14} />
          </a>

          <a href="mailto:hello@zlit.com">
            Contact <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      <div className="zl-footer-bottom">
        <span>© {new Date().getFullYear()} ZLIT</span>
        <span>BUILT FOR EXPRESSION.</span>
      </div>
    </footer>
  );
}