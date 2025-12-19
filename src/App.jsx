import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import InventoryBootstrapper from "./components/InventoryBootstrapper";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StockList from "./pages/StockList";
import StockEntryForm from "./pages/StockEntryForm";
import EditSpare from "./pages/EditSpare";
import ReplenishStock from "./pages/ReplenishStock";
import Cash from "./pages/Cash";
import Budget from "./pages/Budget";
import WorkList from "./pages/WorkList";
import ClientList from "./pages/ClientsList";
import HomeRedirect from "./components/HomeRedirect";
import Notifications from "./pages/Notifications";
import NewClient from "./pages/NewClient";
import ClientDetail from "./pages/ClientDetail";
import BudgetDetail from "./pages/BudgetDetail";
import Warranties from "./pages/Warranties";

function App() {
  return (
    <Routes>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="repuestos" element={<StockList />} />
        <Route path="repuestos/nuevo" element={<StockEntryForm />} />
        <Route path="repuestos/editar/:id" element={<EditSpare />} />
        <Route path="repuestos/reponer/:id" element={<ReplenishStock />} />
        <Route path="caja" element={<Cash />} />
        <Route path="presupuestos" element={<Budget />} />
        <Route path="trabajos" element={<WorkList />} />
        <Route path="clientes" element={<ClientList />} />
        <Route path="clientes/nuevo" element={<NewClient />} />
        <Route path="clientes/:id" element={<ClientDetail />} />
        <Route path="notificaciones" element={<Notifications />} />
        <Route path="garantias" element={<Warranties />} />
        <Route path="garantias/:id" element={<BudgetDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function ProtectedLayout() {
  return (
    <InventoryBootstrapper>
      <Outlet />
    </InventoryBootstrapper>
  );
}

export default App;
