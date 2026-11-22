import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wine, ShoppingCart, BarChart3, PlusCircle, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();

    const [totalBottles, setTotalBottles] = useState(0);
    const [salesToday, setSalesToday] = useState(0);
    const [totalSalesCount, setTotalSalesCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Contar o total de garrafas em stock
            const { count: bottleCount } = await supabase
                .from('bottles')
                .select('*', { count: 'exact', head: true });

            // 2. Buscar TODAS as vendas
            const { data: salesData } = await supabase
                .from('sales')
                .select('total_price');

            // 3. Calcular os totais
            if (bottleCount !== null) setTotalBottles(bottleCount);
            if (salesData) {
                const totalRevenue = salesData.reduce((acc, sale) => acc + Number(sale.total_price), 0);
                setSalesToday(totalRevenue);
                setTotalSalesCount(salesData.length);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* MENU LATERAL */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-gray-800">
                    BOTTLE <span className="text-blue-500">CONTROL</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-lg text-left">
                        <BarChart3 className="w-5 h-5" /> Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/garrafas')}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition"
                    >
                        <Wine className="w-5 h-5" /> Garrafas (Stock)
                    </button>

                    <button
                        onClick={() => navigate('/vendas')}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition"
                    >
                        <ShoppingCart className="w-5 h-5" /> Vendas
                    </button>

                    {/* NOVO BOTÃO DE HISTÓRICO */}
                    <button
                        onClick={() => navigate('/historico')}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition"
                    >
                        <Receipt className="w-5 h-5" /> Histórico
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-gray-800 rounded-lg text-left transition">
                        <LogOut className="w-5 h-5" /> Sair
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
                        <p className="text-gray-500">Bem-vindo ao BOTTLE CONTROL</p>
                    </div>
                    <button
                        onClick={() => navigate('/vendas')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" /> Nova Venda
                    </button>
                </header>

                {/* CARTÕES DE RESUMO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Wine className="w-6 h-6" /></div>
                            <h2 className="text-lg font-semibold text-gray-700">Garrafas em Stock</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalBottles}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-lg text-green-600"><ShoppingCart className="w-6 h-6" /></div>
                            <h2 className="text-lg font-semibold text-gray-700">Vendas Hoje</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{salesToday.toFixed(2)} MZN</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><BarChart3 className="w-6 h-6" /></div>
                            <h2 className="text-lg font-semibold text-gray-700">Total de Vendas</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalSalesCount}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}