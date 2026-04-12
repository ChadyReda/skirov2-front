import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/services'
import { ProductCard } from '@/components/shop/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { useReveal } from '@/hooks/useReveal'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from '@/components/ui/Toast'

export default function HomePage() {
  const { data: featured, isLoading: lf } = useQuery({
    queryKey: ['featured'],
    queryFn: () => productApi.featured(8),
  })

  const { data: newArrivals, isLoading: ln } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productApi.newArrivals(8),
  })

  useReveal([featured, newArrivals])

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('orderSuccess') === '1') {
      toast('Your order has been placed! We will contact you soon 🎉', 'success')
      setSearchParams({})
    }
  }, [])

  return (
    <div className="bg-black text-white">
      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────── */}
      <div className="bg-black text-white text-center py-2 text-[11px] tracking-widest uppercase border-b border-white/10">
        LIVRAISON GRATUITE SUR TOUTES LES COMMANDES ✨
      </div>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[500px] overflow-hidden">
        <img
          src="/image.jpg" // Placeholder - please provide the actual image URL
          alt="SKIRO COLLECTION"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative h-full flex items-end">
          <div className="page w-full pb-12 md:pb-20">
            <div className="max-w-2xl">
              <p className="text-lg text-stone-200 mb-1 animate-fade-up">
                Découvrez
              </p>
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-up leading-tight"
              >
                NOS NOUVEAUTES
              </h1>
              <p className="text-stone-300 text-sm font-light leading-relaxed mb-8 animate-fade-up max-w-md">
                Des maillots de football de haute qualité, conçus pour les vrais supporters. Confort, style et performance dans chaque détail. Portez vos couleurs. Ressentez la qualité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────── */}
      <section className="bg-black py-12 md:py-16 reveal">
        <div className="page">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              Nouveautés
            </h2>
            <Link to="/shop?newArrival=true" className="text-stone-400 hover:text-white text-sm uppercase tracking-widest transition-colors">
              Voir tout
            </Link>
          </div>
          {ln ? (
            <Spinner full />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals?.map((p, i) => (
                <ProductCard key={p.id || p._id} product={p} delay={i * 80} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────── */}
      <section className="bg-stone-950 py-16 md:py-20 reveal">
        <div className="page">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-white uppercase"
            >
              Best Sellers
            </h2>
          </div>
          {lf ? (
            <Spinner full />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured?.map((p, i) => (
                <ProductCard key={p.id || p._id} product={p} delay={i * 80} />
              ))}
            </div>
          )}
          <div className="text-center mt-10 md:mt-14">
            <Link to="/shop" className="btn btn-outline-white">
              View Full Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}