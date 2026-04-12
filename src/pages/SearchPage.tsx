import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/services'
import { ProductCard } from '@/components/shop/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { Pager } from '@/components/ui/Pagination'

export default function SearchPage() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') || ''
  const page = Number(sp.get('page') || 1)

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => productApi.list({ search: q, page }),
    enabled: !!q,
  })

  const handlePageChange = (p: number) => {
    setSp({ q, page: String(p) })
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="page py-10">
        <h1
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          className="text-3xl font-normal mb-6"
        >
          Search results for: "{q}"
        </h1>

        {isLoading ? (
          <Spinner />
        ) : data?.data.length ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {data.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {data.pagination && (
              <div className="mt-12">
                <Pager p={data.pagination} onChange={handlePageChange} />
              </div>
            )}
          </>
        ) : (
          <p className="text-stone-500">No products found.</p>
        )}
      </div>
    </div>
  )
}