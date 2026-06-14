import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Button } from '../ui/button.jsx';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const ContactForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact`, data);
      toast.success('Message sent successfully!');
      reset();
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input {...register('name')} placeholder="Your name" />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} placeholder="you@email.com" />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Label>Subject</Label>
        <Input {...register('subject')} placeholder="How can we help?" />
        {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
      </div>
      <div>
        <Label>Message</Label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full rounded-lg border bg-background/50 px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
          placeholder="Your message..."
        />
        {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} variant="gradient" className="w-full">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};
