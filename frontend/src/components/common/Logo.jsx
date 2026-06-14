import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Logo = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
    <div className="gradient-bg p-2 rounded-xl">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <span className="gradient-text">LuxeCart</span>
  </Link>
);
