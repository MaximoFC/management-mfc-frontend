import Login from './pages/Login';
import StockEntryForm from './pages/StockEntryForm';
import StockList from './pages/StockList';
import Dashboard from './pages/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import EditSpare from './pages/EditSpare';
import ReplenishStock from './pages/ReplenishStock';
import Cash from './pages/Cash';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Navigate to="/login" />} />
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
    </Routes>
  );
}

export default App
