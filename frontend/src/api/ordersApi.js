import { apiSlice } from './apiSlice.js';

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({ url: '/orders', method: 'POST', body: data }),
      invalidatesTags: ['Order'],
    }),
    getAllOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/orders/${id}/status`, method: 'PUT', body: data }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { useCreateOrderMutation, useGetAllOrdersQuery, useUpdateOrderStatusMutation } = ordersApi;
