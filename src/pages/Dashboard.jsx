import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wine, ShoppingCart, BarChart3, PlusCircle, Receipt, UserPlus, Bell, X, Wallet, TrendingUp, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();

    const [totalBottles, setTotalBottles] = useState(0);
    const [salesToday, setSalesToday] = useState(0);
    const [totalSalesCount, setTotalSalesCount] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [movimentos, setMovimentos] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Estado para controlar o menu no telemóvel
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Estados para a venda rápida
    const [showSellModal, setShowSellModal] = useState(false);
    const [bottles, setBottles] = useState([]);
    const [cart, setCart] = useState([]);

    const fetchData = async () => {
        const { count: bottleCount } = await supabase.from('bottles').select('*', { count: 'exact', head: true });
        const { data: salesData } = await supabase.from('sales').select('total_price');
        if (bottleCount !== null) setTotalBottles(bottleCount);
        if (salesData) {
            const totalRevenue = salesData.reduce((acc, sale) => acc + Number(sale.total_price), 0);
            setSalesToday(totalRevenue);
            setTotalSalesCount(salesData.length);
        }
    };

    const fetchSaldoEMovimentos = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('wallet_transactions').select('*').eq('receiver_id', user.id).order('created_at', { ascending: false });
        if (data) {
            const totalRecebido = data.reduce((acc, mov) => acc + Number(mov.amount), 0);
            setSaldo(totalRecebido);
            setMovimentos(data);
        }
    };

    const fetchNotifications = async () => {
        const { data } = await supabase.from('notifications').select('*').eq('status', 'pending').order('created_at', { ascending: false });
        if (data) setNotifications(data);
    };

    const fetchBottlesForSell = async () => {
        const { data } = await supabase.from('bottles').select('*').gt('stock_quantity', 0);
        if (data) setBottles(data);
    };

    useEffect(() => {
        fetchData();
        fetchSaldoEMovimentos();
        fetchNotifications();
        fetchBottlesForSell();
    }, []);

    const handleNotification = async (notification, action) => {
        try {
            if (action === 'accept') {
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('wallet_transactions').insert([{ sender_id: notification.sender_id, receiver_id: user.id, amount: notification.amount, type: 'cashgive', status: 'completed' }]);
                await supabase.from('notifications').update({ status: 'accepted' }).eq('id', notification.id);
                alert("Transferência aceite!");
                fetchSaldoEMovimentos();
            } else {
                await supabase.from('notifications').update({ status: 'rejected' }).eq('id', notification.id);
            }
            fetchNotifications();
        } catch (error) { alert("Erro: " + error.message); }
    };

    const addToAdminCart = (bottle) => {
        const existing = cart.find((item) => item.id === bottle.id);
        if (existing) setCart(cart.map((item) => item.id === bottle.id ? { ...item, qty: item.qty + 1 } : item));
        else setCart([...cart, { ...bottle, qty: 1 }]);
    };

    const handleAdminSell = async () => {
        if (cart.length === 0) return alert("Carrinho vazio!");
        const { data: { user } } = await supabase.auth.getUser();
        try {
            for (const item of cart) {
                await supabase.from('sales').insert([{ bottle_id: item.id, quantity: item.qty, total_price: item.sell_price * item.qty, created_at: new Date().toISOString() }]);
                await supabase.from('bottles').update({ stock_quantity: item.stock_quantity - item.qty }).eq('id', item.id);
                await supabase.from('wallet_transactions').insert([{ receiver_id: user.id, amount: item.sell_price * item.qty, type: 'sale', status: 'completed' }]);
            }
            setCart([]); setShowSellModal(false); fetchData(); fetchSaldoEMovimentos(); fetchBottlesForSell();
            alert("Venda registada com sucesso!");
        } catch (error) { alert("Erro: " + error.message); }
    };

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

    // Função para navegar e fechar o menu no telemóvel
    const handleNavigate = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex relative">

            {/* OVERLAY ESCURO NO TELEMÓVEL */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* MENU LATERAL (RESPONSIVO) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-xl`}>
                <div className="p-6 text-2xl font-bold border-b border-gray-800 flex justify-between items-center">
                    <span>BOTTLE <span className="text-blue-500">CONTROL</span></span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400"><X className="w-6 h-6" /></button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => handleNavigate('/dashboard')} className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-lg text-left">
                        <BarChart3 className="w-5 h-5" /> Dashboard
                    </button>
                    <button onClick={() => handleNavigate('/garrafas')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <Wine className="w-5 h-5" /> Produtos (Stock)
                    </button>
                    <button onClick={() => handleNavigate('/historico')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
                        <Receipt className="w-5 h-5" /> Histórico Geral
                    </button>
                    <button onClick={() => handleNavigate('/utilizadores')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-left text-gray-400 hover:text-white transition">
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
            <main className="flex-1 p-4 md:p-8 relative overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        {/* BOTÃO HAMBÚRGUER (Só aparece no telemóvel) */}
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden bg-white p-2 rounded-lg shadow-sm">
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Visão Geral</h1>
                            <p className="text-sm text-gray-500">Bem-vindo, Administrador</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                                <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                                {notifications.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                                    <div className="p-3 bg-gray-50 border-b font-bold text-sm">Pedidos Pendentes</div>
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Nenhum pedido.</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                                                <p className="text-sm font-semibold mb-1">CashGive</p>
                                                <p className="text-xs text-gray-500 mb-2">Valor: {Number(notif.amount).toFixed(2)} MZN</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleNotification(notif, 'accept')} className="flex-1 bg-green-500 text-white text-xs font-bold py-1 rounded">Aceitar</button>
                                                    <button onClick={() => handleNotification(notif, 'reject')} className="flex-1 bg-red-500 text-white text-xs font-bold py-1 rounded">Rejeitar</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setShowSellModal(true)} className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base">
                            <PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> Vender
                        </button>
                    </div>
                </header>

                {/* CARTÕES DE RESUMO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                            <div className="bg-blue-100 p-2 md:p-3 rounded-lg text-blue-600"><Wine className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <h2 className="text-sm md:text-lg font-semibold text-gray-700">Produtos em Stock</h2>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">{totalBottles}</p>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                            <div className="bg-green-100 p-2 md:p-3 rounded-lg text-green-600"><ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <h2 className="text-sm md:text-lg font-semibold text-gray-700">Vendas Hoje</h2>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">{salesToday.toFixed(2)} MZN</p>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                            <div className="bg-purple-100 p-2 md:p-3 rounded-lg text-purple-600"><BarChart3 className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <h2 className="text-sm md:text-lg font-semibold text-gray-700">Total de Vendas</h2>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">{totalSalesCount}</p>
                    </div>
                </div>

                {/* SALDO DISPONÍVEL */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 md:mb-6 border-b pb-4">
                        <div className="bg-yellow-100 p-2 md:p-3 rounded-lg text-yellow-600"><Wallet className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div>
                            <h2 className="text-sm md:text-lg font-semibold text-gray-700">Saldo Disponível / Dinheiro</h2>
                            <p className="text-2xl md:text-3xl font-bold text-green-600">{saldo.toFixed(2)} MZN</p>
                        </div>
                    </div>

                    <h3 className="text-sm md:text-md font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Extrato de Movimentos
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {movimentos.length === 0 ? (
                            <p className="text-gray-500 text-sm">Nenhum movimento registado.</p>
                        ) : (
                            movimentos.map((mov) => (
                                <div key={mov.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">
                                            {mov.type === 'sale' ? 'Venda Própria' : 'CashGive Recebido'}
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(mov.created_at).toLocaleString('pt-PT')}</p>
                                    </div>
                                    <span className="font-bold text-green-600">+{Number(mov.amount).toFixed(2)} MZN</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* MODAL DE VENDA DO ADMIN */}
                {showSellModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg md:text-xl font-bold">Vender Produto (Admin)</h2>
                                <button onClick={() => { setShowSellModal(false); setCart([]); }}><X className="w-6 h-6 text-gray-500" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {bottles.map(b => (
                                    <div key={b.id} className="border p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-sm">{b.name}</p>
                                            <p className="text-xs text-gray-500">Stock: {b.stock_quantity}</p>
                                        </div>
                                        <button onClick={() => addToAdminCart(b)} className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200">
                                            <PlusCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-bold text-lg">Carrinho: {cart.reduce((acc, item) => acc + (item.sell_price * item.qty), 0).toFixed(2)} MZN</p>
                                    <button onClick={() => setCart([])} className="text-red-500 text-sm font-semibold">Limpar</button>
                                </div>
                                <button onClick={handleAdminSell} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">Finalizar Venda</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}