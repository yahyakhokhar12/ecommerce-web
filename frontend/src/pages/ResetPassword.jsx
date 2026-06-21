import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Shield, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';
import { Logo } from '../components/common/Logo.jsx';
import { apiUrl } from '../lib/api.js';

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.valid).length;
  const strengthColor =
    strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : strength === 3 ? 'bg-yellow-500' : 'bg-emerald-500';
  const strengthLabel = strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong';

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strengthColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-medium">{strengthLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-1 ${c.valid ? 'text-emerald-500' : 'text-muted-foreground'}`}
          >
            {c.valid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.put(
        apiUrl(`/auth/reset-password/${token}`),
        { password: data.password }
      );
      setIsSuccess(true);
      toast.success('Password reset successful!');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass p-8 rounded-2xl text-center space-y-6"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground mt-2">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild variant="gradient" className="w-full" size="lg">
              <Link to="/forgot-password">Request New Link</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Back to Sign In</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl" />

        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm mb-6">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure Password Reset</span>
            </div>
            <h2 className="text-5xl font-bold leading-tight">
              Set a new <br />
              <span className="text-cyan-300">password</span>
            </h2>
            <p className="mt-6 text-lg opacity-90 max-w-md">
              Create a strong new password to secure your account. Make sure it's something you'll remember!
            </p>
            <div className="mt-8 glass p-6 rounded-2xl space-y-3">
              <p className="font-semibold text-sm">Password Tips:</p>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Use at least 8 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Mix uppercase and lowercase letters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Include at least one number</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Avoid using personal information</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {!isSuccess ? (
            <>
              <div className="space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-fuchsia-500/25">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Create new password</h1>
                <p className="text-muted-foreground">
                  Your new password must be different from previous passwords and meet the security requirements below.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      {...register('password', {
                        onChange: (e) => setPassword(e.target.value),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Password reset successful!</h2>
                <p className="text-muted-foreground mt-2">
                  Your password has been changed. You can now sign in with your new password.
                </p>
              </div>

              <div className="glass p-4 rounded-xl text-sm text-muted-foreground">
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                Redirecting to sign in page...
              </div>

              <Button asChild variant="gradient" className="w-full" size="lg">
                <Link to="/login">Sign In Now</Link>
              </Button>
            </motion.div>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
