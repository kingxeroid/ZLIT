import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram } from "lucide-react";

const footerLinks = [
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "Lookbook", path: "/lookbook" },
  { label: "My Orders", path: "/orders" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#1e1e20] px-5 pb-6 pt-14 sm:px-8">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="font-display text-3xl font-bold tracking-tighter">
            ZL<span className="text-zlit-red">IT</span>
          </Link>

          <p className="mt-3 max-w-xs text-xs leading-6 text-zlit-muted">
            Streetwear for people who define their own identity.
          </p>
        </div>

        <div className="grid content-start gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zlit-muted">
            EXPLORE
          </span>

          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="w-fit text-xs text-zlit-white/80 transition hover:text-zlit-red"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="grid content-start gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zlit-muted">
            CONNECT
          </span>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-zlit-white/80 hover:text-zlit-red"
          >
            <Instagram size={15} /> Instagram <ArrowUpRight size={13} />
          </a>

          <a
            href="mailto:hello@zlit.com"
            className="flex items-center gap-2 text-xs text-zlit-white/80 hover:text-zlit-red"
          >
            Email us <ArrowUpRight size={13} />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1440px] flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-[10px] tracking-wider text-zlit-muted">
        <span>© {new Date().getFullYear()} ZLIT</span>
        <span>BUILT FOR EXPRESSION.</span>
      </div>
    </footer>
  );
}