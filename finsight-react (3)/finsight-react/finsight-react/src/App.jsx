import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { useAuth }         from './hooks/useAuth';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Topbar }  from './components/layout/Topbar';
import { AIChat }  from './components/AIChat';

// Pages
import Auth         from './pages/Auth';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget       from './pages/Budget';
import Debts        from './pages/Debts';
import Goals        from './pages/Goals';
import Health       from './pages/Health';
import Insights     from './pages/Insights';
import Reports      from './pages/Reports';
import Profile      from './pages/Profile';

/**
 * ProtectedLayout — wraps all authenticated routes.
 * Redirects to /login if user is not logged in.
 * Also wraps with FinanceProvider so finance data is available app-wide.
 */
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <FinanceProvider>
      <div className="app-shell">
        <Topbar />
        <Sidebar />
        <main className="main">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
      </div>
      {/* Floating AI chat button — available on all authenticated pages */}
      <AIChat />
    </FinanceProvider>
  );
}

/**
 * Root router — declares all routes.
 * Public: /login
 * Protected: /dashboard, /transactions, /budget, /debts, /goals, /health, /insights, /reports, /profile
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />

      {/* Protected routes — all children share the app shell layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard"    element={<Dashboard />}    />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget"       element={<Budget />}       />
        <Route path="/debts"        element={<Debts />}        />
        <Route path="/goals"        element={<Goals />}        />
        <Route path="/health"       element={<Health />}       />
        <Route path="/insights"     element={<Insights />}     />
        <Route path="/reports"      element={<Reports />}      />
        <Route path="/profile"      element={<Profile />}      />
      </Route>

      {/* Catch-all: redirect to dashboard or login */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

/**
 * App — root component.
 * Provides AuthContext globally; FinanceContext is scoped inside ProtectedLayout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
