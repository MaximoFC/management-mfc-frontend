import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import HomeRedirect from "./components/HomeRedirect";
import { LoadingDots } from "./components/ui-primitives";

// Cada página se descarga recién cuando se abre: el bundle inicial queda mucho más chico
const Login = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StockList = lazy(() => import("./pages/StockList"));
const Cash = lazy(() => import("./pages/Cash"));
const Budget = lazy(() => import("./pages/Budget"));
const WorkList = lazy(() => import("./pages/WorkList"));
const ClientList = lazy(() => import("./pages/ClientsList"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Warranties = lazy(() => import("./pages/Warranties"));
const BudgetDetail = lazy(() => import("./pages/BudgetDetail"));

const PageLoader = () => (
  <div className="flex h-dvh items-center justify-center text-[#D90429]">
    <LoadingDots />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="repuestos" element={<StockList />} />
          <Route path="caja" element={<ProtectedRoute adminOnly><Cash /></ProtectedRoute>} />
          <Route path="presupuestos" element={<Budget />} />
          <Route path="trabajos" element={<WorkList />} />
          <Route path="clientes" element={<ClientList />} />
          <Route path="clientes/:id" element={<ClientDetail />} />
          <Route path="notificaciones" element={<Notifications />} />
          <Route path="garantias" element={<Warranties />} />
          <Route path="garantias/:id" element={<BudgetDetail />} />
        </Route>

        {/* Rutas inexistentes: al dashboard si hay sesión, si no al login */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default App;
