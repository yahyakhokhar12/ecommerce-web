import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, UserRound, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';
import { SocialAuthButtons } from '../components/forms/SocialAuthButtons.jsx';
import { AuthShowcase } from '../components/auth/AuthShowcase.jsx';

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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080b12] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(20,184,166,0.2),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(217,70,239,0.22),transparent_27%),linear-gradient(135deg,#050816_0%,#10131f_52%,#070b14_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10131f]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-fuchsia-500 shadow-lg shadow-teal-500/20">
                <UserRound className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Create account</h1>
              <p className="mt-2 text-sm text-slate-400">Start shopping with saved carts, wishlists, and order tracking.</p>
            </div>
            <form onSubmit={handleSubmit(signUp)} className="space-y-4">
              <div>
                <Label className="text-slate-300">Full Name</Label>
                <div className="relative mt-2">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input placeholder="John Doe" className="border-white/10 bg-white/[0.06] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-400" {...register('name')} />
                </div>
                {errors.name && <p className="text-sm text-red-300 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label className="text-slate-300">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input type="email" placeholder="you@email.com" className="border-white/10 bg-white/[0.06] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-400" {...register('email')} />
                </div>
                {errors.email && <p className="text-sm text-red-300 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label className="text-slate-300">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input type="password" placeholder="Password" className="border-white/10 bg-white/[0.06] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-400" {...register('password')} />
                </div>
                {errors.password && <p className="text-sm text-red-300 mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-teal-400 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25 hover:opacity-95" size="lg">
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6">
              <SocialAuthButtons mode="signup" />
            </div>
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account? <Link to="/login" className="font-semibold text-fuchsia-300 hover:text-fuchsia-200">Sign in</Link>
            </p>
          </div>
        </div>
        <AuthShowcase variant="register" />
      </div>
    </div>
  );
};
