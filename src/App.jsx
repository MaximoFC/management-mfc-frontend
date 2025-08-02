import Login from './pages/Login';
import StockEntryForm from './pages/StockEntryForm';
import StockList from './pages/StockList';
import Dashboard from './pages/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import EditSpare from './pages/EditSpare';
import ReplenishStock from './pages/ReplenishStock';
import Cash from './pages/Cash';
import Budget from './pages/Budget';
import WorkList from './pages/WorkList';
import ClientList from './pages/ClientsList';
import HomeRedirect from './components/HomeRedirect';
import Notifications from './pages/Notifications';
import NewClient from './pages/NewClient';

function App() {

  return (
    <Routes>
      <Route path='/' element={<HomeRedirect />} />
      <Route path='/login' element={<Login />} />

      {/* Rutas protegidas */}
      <Route
        path='/repuestos/nuevo'
        element={
          <ProtectedRoute>
            <StockEntryForm />
          </ProtectedRoute>
        }
      />
      <Route
        path='/repuestos'
        element={
          <ProtectedRoute>
            <StockList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/repuestos/editar/:id'
        element={
          <ProtectedRoute>
            <EditSpare />
          </ProtectedRoute>
        }
      />
      <Route
        path='/repuestos/reponer/:id'
        element={
          <ProtectedRoute>
            <ReplenishStock />
          </ProtectedRoute>
        }
      />
      <Route
        path='/caja'
        element={
          <ProtectedRoute>
            <Cash />
          </ProtectedRoute>
        }
      />
      <Route
        path='/presupuestos'
        element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
      />
      <Route
        path='/trabajos'
        element={
          <ProtectedRoute>
            <WorkList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/clientes'
        element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/notificaciones'
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path='/clientes/nuevo'
        element={
          <ProtectedRoute>
          <NewClient />
          </ProtectedRoute>
        }
      />
      <Route
        path='/presupuestos'
        element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App
