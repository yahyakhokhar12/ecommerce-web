import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '../api/authApi.js';
import { setCredentials, logout as logoutAction, selectCurrentUser } from '../features/auth/authSlice.js';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const isAdmin = user?.role === 'admin';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [logout] = useLogoutMutation();

  const signIn = async (creds) => {
    try {
      const res = await login(creds).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
      return res;
    } catch (e) { toast.error(e?.data?.message || 'Login failed'); throw e; }
  };

  const signUp = async (data) => {
    try {
      const res = await register(data).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Account created!');
      navigate('/');
      return res;
    } catch (e) { toast.error(e?.data?.message || 'Registration failed'); throw e; }
  };

  const signOut = async () => {
    try {
      await logout().unwrap();
    } catch (_error) {
      // Local logout should still complete if the token is already expired.
    }
    dispatch(logoutAction());
    toast.success('Logged out');
    navigate('/');
  };

  return { user, isAuthenticated, isAdmin, signIn, signUp, signOut };
};
