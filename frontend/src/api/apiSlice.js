import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../lib/api.js';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken || localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );
    if (refreshResult?.data?.data) {
      api.dispatch({ type: 'auth/setCredentials', payload: refreshResult.data.data });
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: 'auth/logout' });
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Order', 'User', 'Category', 'Review', 'Wishlist', 'Coupon'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (r, e, id) => [{ type: 'Product', id }],
    }),
    getCategories: builder.query({ query: () => '/categories', providesTags: ['Category'] }),
    getMyOrders: builder.query({ query: () => '/orders/my-orders', providesTags: ['Order'] }),
    getOrder: builder.query({ query: (id) => `/orders/${id}`, providesTags: ['Order'] }),
    getWishlist: builder.query({ query: () => '/wishlist', providesTags: ['Wishlist'] }),
    getDashboard: builder.query({ query: () => '/admin/dashboard' }),
    getAnalytics: builder.query({ query: (days) => ({ url: '/admin/analytics', params: { days } }) }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useGetWishlistQuery,
  useGetDashboardQuery,
  useGetAnalyticsQuery,
} = apiSlice;
