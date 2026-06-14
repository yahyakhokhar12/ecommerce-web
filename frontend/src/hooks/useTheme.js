import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectTheme } from '../features/theme/themeSlice.js';

export const useTheme = () => {
  const mode = useSelector(selectTheme);
  const dispatch = useDispatch();
  return { mode, toggle: () => dispatch(toggleTheme()), isDark: mode === 'dark' };
};
