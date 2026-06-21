import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';
import { SocialAuthButtons } from '../components/forms/SocialAuthButtons.jsx';
import { AuthShowcase } from '../components/auth/AuthShowcase.jsx';

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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080b12] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.24),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.18),transparent_24%),linear-gradient(135deg,#080b12_0%,#10131f_48%,#050816_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <AuthShowcase variant="login" />
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10131f]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="mb-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-teal-400 shadow-lg shadow-fuchsia-500/25">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Sign in</h1>
              <p className="mt-2 text-sm text-slate-400">Enter your credentials or use a social account.</p>
            </div>
            <form onSubmit={handleSubmit(signIn)} className="space-y-4">
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
              <div className="flex items-center justify-between text-sm text-slate-400">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10 accent-fuchsia-500" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-fuchsia-300 hover:text-fuchsia-200">Forgot password?</Link>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-teal-400 text-white shadow-lg shadow-fuchsia-500/25 hover:opacity-95" size="lg">
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6">
              <SocialAuthButtons mode="signin" />
            </div>
            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account? <Link to="/register" className="font-semibold text-fuchsia-300 hover:text-fuchsia-200">Sign up</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
