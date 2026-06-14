import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z.string(),
          quantity: z.number().int().min(1),
        })
      )
      .min(1, 'At least one item required'),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['stripe', 'cod']),
  }),
});
