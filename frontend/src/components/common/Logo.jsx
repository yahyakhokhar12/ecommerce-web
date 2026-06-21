import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Logo = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
    <div className="gradient-bg p-2 rounded-xl shadow-lg shadow-fuchsia-500/20">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <span className="bg-gradient-to-r from-white via-teal-100 to-fuchsia-200 bg-clip-text text-transparent">LuxeCart</span>
  </Link>
);
