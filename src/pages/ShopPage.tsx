import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { categoryApi, productApi } from '@/services'
import { Spinner } from '@/components/ui/Spinner'
import { useReveal } from '@/hooks/useReveal'
import { ProductCard } from '@/components/shop/ProductCard'
import { Pager } from '@/components/ui/Pagination'
import { ChevronLeft } from 'lucide-react'

// Temporary data for category images
const categoryImages: { [key: string]: string } = {
  pack: 'https://i.imgur.com/5d1SAc3.jpeg',
  pantalon: 'https://i.imgur.com/s7zT2sK.jpeg',
  'survetement': 'https://i.imgur.com/sYn4m2G.jpeg',
  't-shirt': 'https://i.imgur.com/sYn4m2G.jpeg',
}

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')

  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  })

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', categorySlug, page],
    queryFn: () => productApi.list({ 
      category: categorySlug || undefined, 
      page, 
      limit: 12 
    }),
    enabled: !!categorySlug || categorySlug === null // Always fetch if we want the "Shop All" or filtered view
  })

  const selectedCategory = categories?.find(c => c.slug === categorySlug)

  useReveal([productsData, categorySlug])

  if (categorySlug) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="page py-12 md:py-16">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-8 text-sm uppercase tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Retour aux collections
          </Link>

          <header className="mb-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4">
                  {selectedCategory?.name || 'Collection'}
                </h1>
                {selectedCategory?.description && (
                  <p className="text-stone-400 max-w-2xl leading-relaxed">
                    {selectedCategory.description}
                  </p>
                )}
              </div>
              <div className="text-stone-500 text-sm mt-2">
                {productsData?.pagination.total || 0} produits
              </div>
            </div>
          </header>

          {isProductsLoading ? (
            <Spinner full />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 reveal mt-8">
                {productsData?.data.map((product, i) => (
                  <ProductCard key={product.id} product={product} delay={i * 50} />
                ))}
              </div>
              
              {!productsData?.data.length && (
                <div className="py-20 text-center text-stone-500">
                  Aucun produit trouvé dans cette collection.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="page py-12 md:py-16">
        <div className="mb-8 md:mb-12 text-left">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">
            Collections
          </h1>
        </div>

        {isCatsLoading ? (
          <Spinner full />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 reveal">
            {categories
              ?.filter((c) => c.isActive)
              .map((category, i) => (
                <Link
                  to={`/shop?category=${category.slug}`}
                  key={category.id || category._id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <img
                    src={category.imageUrl || categoryImages[category.slug] || 'https://i.imgur.com/5d1SAc3.jpeg'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wider text-center px-4">
                      {category.name}
                    </h2>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}