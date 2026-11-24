
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  MoveUpRight,
} from "lucide-react";

import useProducts from "../../hooks/useProducts";
import ProductGrid from "../../components/products/ProductGrid";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function Home() {
  const navigate = useNavigate();

  const { products = [], loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const featured = products
    .filter((product) => product.is_featured)
    .slice(0, 4);

  const visibleFeatured = featured.length
    ? featured
    : products.slice(0, 4);

  const arrivals = products
    .filter(
      (product) =>
        !visibleFeatured.some((item) => item.id === product.id)
    )
    .slice(0, 4);

  const wishlistIds = (items) =>
    items
      .filter((product) => isWishlisted(product.id))
      .map((product) => product.id);

  return (
    <main className="overflow-hidden bg-zlit-bg">

      {/* ANNOUNCEMENT */}
      <div className="flex items-center justify-center gap-2 bg-zlit-red px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
        <Sparkles size={13} />
        Wear your own energy. Define your own style.
      </div>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1600px] px-4 pb-16 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24">

        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">

          <div className="relative z-10">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-zlit-red" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zlit-muted">
                The new streetwear standard
              </span>
            </div>

            <h1 className="max-w-2xl font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl xl:text-8xl">
              DON'T
              <br />
              FOLLOW.
              <br />
              <span className="text-zlit-red">STAND OUT.</span>
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-zlit-muted sm:text-base">
              Your identity. Your energy. Your rules.
              Discover streetwear made for people who
              refuse to blend into the crowd.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="zl-primary inline-flex items-center gap-3"
              >
                Explore collection
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/lookbook"
                className="zl-secondary inline-flex items-center gap-2"
              >
                Discover the lookbook
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-12 flex gap-10 border-t border-white/10 pt-7">
              <div>
                <p className="font-display text-2xl font-bold">
                  {products.length}+
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-zlit-muted">
                  Store pieces
                </p>
              </div>

              <div>
                <p className="font-display text-2xl font-bold">ZLIT</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-zlit-muted">
                  Your identity
                </p>
              </div>
            </div>

          </div>

          {/* HERO IMAGE */}
          <div className="relative mx-auto w-full max-w-2xl">

            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-zlit-red/20 blur-[90px]" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zlit-surface sm:rounded-[32px]">
              <img
                src="/logo.webp"
                alt="ZLIT streetwear campaign"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                    ZLIT Collection
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                    MADE TO BE SEEN.
                  </h2>
                </div>

                <Link
                  to="/shop"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:bg-zlit-red hover:text-white"
                  aria-label="Shop collection"
                >
                  <ArrowUpRight size={21} />
                </Link>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-xl border border-white/10 bg-zlit-surface px-5 py-4 shadow-xl sm:-left-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zlit-muted">
                The ZLIT attitude
              </p>
              <p className="mt-1 font-display text-lg font-bold">
                NEVER ORDINARY.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="border-y border-white/10 bg-zlit-surface/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 text-center">
          {["YOUR STYLE", "YOUR RULES", "YOUR IDENTITY", "YOUR ENERGY"].map(
            (item) => (
              <span
                key={item}
                className="font-display text-xs font-bold tracking-[0.2em] text-zlit-muted"
              >
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-8 lg:px-12 lg:py-24">

        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zlit-red">
              Selected for you
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
              THE ZLIT EDIT.
            </h2>

            <p className="mt-3 text-xs text-zlit-muted sm:text-sm">
              Pieces that speak before you do.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-white transition hover:text-zlit-red"
          >
            View all
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[3/4] rounded-card bg-zlit-surface" />
                <div className="mt-4 h-3 w-3/4 rounded bg-zlit-surface" />
                <div className="mt-2 h-3 w-1/3 rounded bg-zlit-surface" />
              </div>
            ))}
          </div>
        ) : visibleFeatured.length ? (
          <ProductGrid
            products={visibleFeatured}
            onProductClick={(product) =>
              navigate(`/product/${product.id}`)
            }
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            wishlistIds={wishlistIds(visibleFeatured)}
          />
        ) : (
          <div className="rounded-card bg-zlit-surface px-6 py-16 text-center">
            <p className="font-display text-xl font-bold">
              NEW PIECES ARE COMING.
            </p>
            <p className="mt-2 text-sm text-zlit-muted">
              Check back soon for the latest ZLIT drops.
            </p>
            <Link to="/shop" className="zl-primary mt-6 inline-flex">
              Explore store
            </Link>
          </div>
        )}

      </section>

      {/* EDITORIAL BANNER */}
      <section className="mx-4 mb-20 overflow-hidden rounded-2xl bg-zlit-surface sm:mx-8 lg:mx-12 lg:rounded-[32px]">

        <div className="grid items-center lg:grid-cols-2">

          <div className="px-7 py-12 sm:px-12 lg:px-16 lg:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zlit-red">
              More than clothing
            </p>

            <h2 className="mt-5 max-w-lg font-display text-4xl font-bold leading-tight sm:text-6xl">
              STYLE IS HOW YOU INTRODUCE YOURSELF.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-zlit-muted">
              Every outfit tells a story. Find your inspiration,
              experiment with combinations and create a look
              that is completely yours.
            </p>

            <Link
              to="/lookbook"
              className="zl-primary mt-8 inline-flex items-center gap-3"
            >
              Explore our lookbook
              <MoveUpRight size={16} />
            </Link>
          </div>

          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[540px]">
            <img
              src="/Born.jpg"
              alt="ZLIT fashion editorial"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r lg:from-zlit-surface lg:via-transparent" />
          </div>

        </div>
      </section>

      {/* NEW ARRIVALS */}
      {!loading && arrivals.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-8 lg:px-12 lg:pb-24">

          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zlit-red">
                Fresh from the store
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
                LATEST DROPS.
              </h2>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zlit-muted hover:text-white"
            >
              Shop everything
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <ProductGrid
            products={arrivals}
            onProductClick={(product) =>
              navigate(`/product/${product.id}`)
            }
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            wishlistIds={wishlistIds(arrivals)}
          />

        </section>
      )}

      {/* FINAL CTA */}
      <section className="relative mx-4 mb-16 overflow-hidden rounded-2xl bg-zlit-red px-6 py-16 text-center sm:mx-8 sm:py-24 lg:mx-12 lg:rounded-[32px]">

        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[80px]" />

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
            This is your moment
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            DON'T JUST WEAR IT. OWN IT.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/75">
            Find the pieces that represent you.
            Make every appearance count.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-bold text-zlit-bg transition hover:bg-black hover:text-white"
          >
            SHOP ZLIT
            <ArrowUpRight size={16} />
          </Link>
        </div>

      </section>

    </main>
  );
}
