import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice.js';
import { Button } from '../components/ui/button.jsx';

const decodeUser = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
};

export const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = params.get('error');

  useEffect(() => {
    if (error) {
      toast.error(error);
      return;
    }

    const accessToken = params.get('accessToken');
    const encodedUser = params.get('user');

    if (!accessToken || !encodedUser) {
      toast.error('Social sign-in did not return a valid session');
      return;
    }

    try {
      const user = decodeUser(encodedUser);
      dispatch(setCredentials({ user, accessToken }));
      toast.success('Signed in successfully');
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (_err) {
      toast.error('Could not complete social sign-in');
    }
  }, [dispatch, error, navigate, params]);

  if (error) {
    return (
      <div className="container flex min-h-[50vh] max-w-md flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold">Social sign-in failed</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild variant="gradient" className="mt-6">
          <Link to="/login">Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      <p className="mt-4 text-muted-foreground">Completing sign-in...</p>
    </div>
  );
};
