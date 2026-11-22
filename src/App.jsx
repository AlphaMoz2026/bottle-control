import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Garrafas from './pages/Garrafas';
import Vendas from './pages/Vendas';
import Historico from './pages/Historico'; // <-- 1. Importação aqui

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/garrafas" element={<Garrafas />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/historico" element={<Historico />} /> {/* <-- 2. Rota aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;