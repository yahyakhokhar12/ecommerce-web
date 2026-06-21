import { AppRoutes } from './routes/AppRoutes.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

const App = () => (
  <ErrorBoundary>
    <AppRoutes />
  </ErrorBoundary>
);
export default App;
