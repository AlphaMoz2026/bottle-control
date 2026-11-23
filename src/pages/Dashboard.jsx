import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wine, ShoppingCart, BarChart3, PlusCircle, Receipt, UserPlus, Bell, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();

    const [totalBottles, setTotalBottles] = useState(0);
    const [salesToday, setSalesToday] = useState(0);
    const [totalSalesCount, setTotalSalesCount] = useState(0);

    // Estados para as notificações
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchData = async () => {
        // 1. Contar o total de produtos em stock
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

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (data) setNotifications(data);
    };

    useEffect(() => {
        fetchData();
        fetchNotifications();
    }, []);

    const handleNotification = async (notification, action) => {
        try {
            if (action === 'accept') {
                // 1. Regista a transação na carteira
                await supabase.from('wallet_transactions').insert([
                    {
                        sender_id: notification.sender_id,
                        amount: notification.amount,
                        type: 'cashgive',
                        status: 'completed',
                    },
                ]);
                // 2. Atualiza o estado da notificação
                await supabase.from('notifications').update({ status: 'accepted' }).eq('id', notification.id);
                alert("Transferência aceite com sucesso!");
            } else {
                await supabase.from('notifications').update({ status: 'rejected' }).eq('id', notification.id);
                alert("Transferência rejeitada.");
            }
            fetchNotifications();
        } catch (error) {
            alert("Erro: " + error.message);
        }
    };

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

                    <button onClick={() => navigate('/garrafas')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <Wine className="w-5 h-5" /> Produtos (Stock)
                    </button>

                    <button onClick={() => navigate('/vendas')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <ShoppingCart className="w-5 h-5" /> Vendas
                    </button>

                    <button onClick={() => navigate('/historico')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <Receipt className="w-5 h-5" /> Histórico
                    </button>

                    <button onClick={() => navigate('/utilizadores')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <UserPlus className="w-5 h-5" /> Utilizadores
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-gray-800 rounded-lg text-left transition">
                        <LogOut className="w-5 h-5" /> Sair
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8 relative">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
                        <p className="text-gray-500">Bem-vindo ao BOTTLE CONTROL</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* SINO DE NOTIFICAÇÕES */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                                <Bell className="w-6 h-6 text-gray-700" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* PAINEL DE NOTIFICAÇÕES */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                                    <div className="p-3 bg-gray-50 border-b font-bold text-sm">Pedidos de Transferência</div>
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Nenhum pedido pendente.</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                                                <p className="text-sm font-semibold mb-1">Pedido de CashGive</p>
                                                <p className="text-xs text-gray-500 mb-2">Valor: {Number(notif.amount).toFixed(2)} MZN</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleNotification(notif, 'accept')} className="flex-1 bg-green-500 text-white text-xs font-bold py-1 rounded flex justify-center items-center gap-1 hover:bg-green-600">
                                                        <Check className="w-3 h-3" /> Aceitar
                                                    </button>
                                                    <button onClick={() => handleNotification(notif, 'reject')} className="flex-1 bg-red-500 text-white text-xs font-bold py-1 rounded flex justify-center items-center gap-1 hover:bg-red-600">
                                                        <X className="w-3 h-3" /> Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => navigate('/vendas')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" /> Nova Venda
                        </button>
                    </div>
                </header>

                {/* CARTÕES DE RESUMO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Wine className="w-6 h-6" /></div>
                            <h2 className="text-lg font-semibold text-gray-700">Produtos em Stock</h2>
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