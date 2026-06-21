import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Button } from '../components/ui/button.jsx';
import { Logo } from '../components/common/Logo.jsx';
import { apiUrl } from '../lib/api.js';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.post(
        apiUrl('/auth/forgot-password'),
        { email: data.email }
      );
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to send reset email. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl" />

        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm mb-6">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Account Recovery</span>
            </div>
            <h2 className="text-5xl font-bold leading-tight">
              Forgot your <br />
              <span className="text-yellow-300">password?</span>
            </h2>
            <p className="mt-6 text-lg opacity-90 max-w-md">
              No worries! Enter your email and we'll send you a secure link to reset your password and get back to shopping.
            </p>
            <div className="mt-8 space-y-3">
              {['Quick & Secure Process', 'Email Verification Required', 'Back to Shopping in Minutes'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-yellow-300" />
                  <span className="text-sm opacity-90">{item}</span>
                </motion.div>
              ))}
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

          {!isSubmitted ? (
            <>
              <div className="space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-fuchsia-500/25">
                  <KeyRound className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
                <p className="text-muted-foreground">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
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
                      <span className="animate-pulse">Sending reset link...</span>
                    </>
                  ) : (
                    'Send Reset Link'
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
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-muted-foreground mt-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium mt-1">{submittedEmail}</p>
              </div>

              <div className="glass p-4 rounded-xl text-left space-y-2 text-sm">
                <p className="font-medium">Next steps:</p>
                <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Open your email inbox</li>
                  <li>Click the reset link within 10 minutes</li>
                  <li>Create a new strong password</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail('');
                  }}
                >
                  Try a different email
                </Button>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
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
