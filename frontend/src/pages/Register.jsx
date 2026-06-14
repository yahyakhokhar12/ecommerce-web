import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
});

export const Register = () => {
  const { signUp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md glass p-8 rounded-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join us and start shopping</p>
        </div>
        <form onSubmit={handleSubmit(signUp)} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input placeholder="John Doe" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="you@email.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} variant="gradient" className="w-full" size="lg">
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-fuchsia-500 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
