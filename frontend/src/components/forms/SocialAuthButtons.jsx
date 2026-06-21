import { Facebook } from 'lucide-react';
import { apiUrl } from '../../lib/api.js';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

export const SocialAuthButtons = ({ mode = 'signin' }) => {
  const action = mode === 'signup' ? 'Sign up' : 'Sign in';

  const startOAuth = (provider) => {
    window.location.assign(apiUrl(`/auth/${provider}`));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#10131f] px-3 tracking-[0.22em] text-slate-400">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => startOAuth('google')}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-slate-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => startOAuth('facebook')}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1877F2]/15 px-4 text-sm font-semibold text-slate-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-[#5da0ff]/50 hover:bg-[#1877F2]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Facebook className="h-4 w-4 text-[#63a4ff]" />
          Facebook
        </button>
      </div>
      <p className="sr-only">{action} with Google or Facebook</p>
    </div>
  );
};
