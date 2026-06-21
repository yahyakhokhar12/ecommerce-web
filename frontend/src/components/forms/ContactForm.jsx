import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Button } from '../ui/button.jsx';
import { apiUrl } from '../../lib/api.js';

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
      await axios.post(apiUrl('/contact'), data);
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
          <Input {...register('name')} placeholder="Your name" className="border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:ring-teal-300/40" />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} placeholder="you@email.com" className="border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:ring-teal-300/40" />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Label>Subject</Label>
        <Input {...register('subject')} placeholder="How can we help?" className="border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:ring-teal-300/40" />
        {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
      </div>
      <div>
        <Label>Message</Label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-300/40"
          placeholder="Your message..."
        />
        {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-white text-slate-950 hover:bg-slate-100">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};
