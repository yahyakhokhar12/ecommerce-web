import { useGetWishlistQuery } from '../../api/apiSlice.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { Heart } from 'lucide-react';

export const Wishlist = () => {
  const { data, isLoading } = useGetWishlistQuery();
  const products = data?.data?.products || [];

  if (isLoading) return <div className="container py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {products.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
        </div>
      )}
    </div>
  );
};
