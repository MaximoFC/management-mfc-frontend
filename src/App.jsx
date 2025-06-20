import Login from './pages/Login';
import StockEntryForm from './pages/StockEntryForm';
import StockList from './pages/StockList';
import Dashboard from './pages/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

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
    </Routes>
  );
}

export default App
