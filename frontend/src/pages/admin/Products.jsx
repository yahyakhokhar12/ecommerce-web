import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useGetProductsQuery } from '../../api/apiSlice.js';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { formatPrice } from '../../lib/utils.js';

export const AdminProducts = () => {
  const { data, isLoading, refetch } = useGetProductsQuery({ limit: 100 });
  const products = data?.data?.products || [];

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, { withCredentials: true });
      toast.success('Deleted');
      refetch();
    } catch (e) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button variant="gradient"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-12" /></td></tr>
              )) : products.map((p) => (
                <tr key={p._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images[0]?.url} className="h-10 w-10 rounded object-cover" />
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{formatPrice(p.finalPrice)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4"><Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
