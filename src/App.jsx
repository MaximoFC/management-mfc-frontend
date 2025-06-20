import Login from './pages/Login';
import StockEntryForm from './pages/StockEntryForm';
import StockList from './pages/StockList';
import Dashboard from './pages/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Navigate to="/login" />} />
      <Route path='/login' element={<Login />} />
      <Route path='/repuestos/nuevo' element={<StockEntryForm />} />
      <Route path='/repuestos' element={<StockList />} />
      <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
  );
}

export default App
