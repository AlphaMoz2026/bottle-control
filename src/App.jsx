import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Garrafas from './pages/Garrafas';
import Vendas from './pages/Vendas';
import Historico from './pages/Historico';
import Utilizadores from './pages/Utilizadores';
import CashGive from './pages/CashGive';
import Relatorios from './pages/Relatorios'; // <-- Nova importação

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/garrafas" element={<Garrafas />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/utilizadores" element={<Utilizadores />} />
        <Route path="/cashgive" element={<CashGive />} />
        <Route path="/relatorios" element={<Relatorios />} /> {/* <-- Nova rota */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;