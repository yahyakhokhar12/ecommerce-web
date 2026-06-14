import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Required'),
});

export const Login = () => {
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 gradient-bg" />
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800" alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <h2 className="text-4xl font-bold">Welcome Back</h2>
          <p className="mt-4 opacity-90">Sign in to continue your shopping journey</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground mt-1">Enter your credentials to access your account</p>
          </div>
          <form onSubmit={handleSubmit(signIn)} className="space-y-4">
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-fuchsia-500 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" disabled={isSubmitting} variant="gradient" className="w-full" size="lg">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-fuchsia-500 hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
