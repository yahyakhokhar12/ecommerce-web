import { apiSlice } from './apiSlice.js';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (data) => ({ url: '/payment/create-intent', method: 'POST', body: data }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentApi;
