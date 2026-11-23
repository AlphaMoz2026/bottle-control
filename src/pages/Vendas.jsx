import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Plus, Trash2, Receipt, Send, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vendas() {
    const navigate = useNavigate();
    const [bottles, setBottles] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para o menu no telemóvel
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchBottles = async () => {
            const { data, error } = await supabase.from('bottles').select('*').gt('stock_quantity', 0);
            if (error) console.error(error);
            else setBottles(data);
            setLoading(false);
        };
        fetchBottles();
    }, []);

    const addToCart = (bottle) => {
        const existing = cart.find((item) => item.id === bottle.id);
        const currentQty = existing ? existing.qty : 0;
        if (currentQty >= bottle.stock_quantity) {
            alert("Não há stock suficiente!");
            return;
        }
        if (existing) {
            setCart(cart.map((item) => item.id === bottle.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...bottle, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
    const total = cart.reduce((acc, item) => acc + (item.sell_price * item.qty), 0);

    const finalizarVenda = async () => {
        if (cart.length === 0) return alert("O carrinho está vazio!");
        try {
            for (const item of cart) {
                await supabase.from('sales').insert([
                    { bottle_id: item.id, quantity: item.qty, total_price: item.sell_price * item.qty, created_at: new Date().toISOString() },
                ]);
                await supabase.from('bottles').update({ stock_quantity: item.stock_quantity - item.qty }).eq('id', item.id);
            }
            alert(`Venda de ${total.toFixed(2)} MZN finalizada com sucesso!`);
            setCart([]);
            const { data } = await supabase.from('bottles').select('*').gt('stock_quantity', 0);
            setBottles(data);
        } catch (error) {
            alert("Erro: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* CABEÇALHO RESPONSIVO */}
            <header className="bg-white border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm relative">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="bg-red-50 p-2 rounded-lg text-red-600 hover:bg-red-100">
                        <LogOut className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg md:text-xl font-bold text-gray-800">Caixa</h1>

                    {/* BOTÕES PARA DESKTOP */}
                    <div className="hidden md:flex items-center gap-4 ml-4">
                        <button onClick={() => navigate('/historico')} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                            <Receipt className="w-5 h-5" /> Histórico
                        </button>
                        <button onClick={() => navigate('/cashgive')} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                            <Send className="w-5 h-5" /> CashGive
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" /> {total.toFixed(2)} MZN
                </div>

                {/* BOTÃO DE MENU PARA MOBILE */}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600">
                    <Menu className="w-6 h-6" />
                </button>

                {/* DROPDOWN MOBILE (Histórico e CashGive) */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t md:hidden flex flex-col p-2 z-50">
                        <button onClick={() => { navigate('/historico'); setIsMobileMenuOpen(false); }} className="p-3 text-left font-semibold text-blue-600 flex items-center gap-2 border-b">
                            <Receipt className="w-5 h-5" /> Histórico
                        </button>
                        <button onClick={() => { navigate('/cashgive'); setIsMobileMenuOpen(false); }} className="p-3 text-left font-semibold text-blue-600 flex items-center gap-2">
                            <Send className="w-5 h-5" /> CashGive
                        </button>
                    </div>
                )}
            </header>

            {/* CONTEÚDO PRINCIPAL (Empilhado no telemóvel, lado a lado no PC) */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* PRODUTOS */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
                    <h2 className="text-sm font-bold mb-3 text-gray-500 uppercase tracking-wider">Produtos Disponíveis</h2>
                    {loading ? <p>A carregar...</p> : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {bottles.map((bottle) => (
                                <div key={bottle.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight">{bottle.name}</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 mb-2 mt-1">{bottle.category} | Stock: {bottle.stock_quantity}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-blue-600 text-sm md:text-base">{Number(bottle.sell_price).toFixed(2)}</span>
                                        <button onClick={() => addToCart(bottle)} className="bg-blue-50 text-blue-600 p-1.5 rounded-lg active:scale-95 transition">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CARRINHO (Fica na parte inferior no telemóvel) */}
                <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l flex flex-col shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-lg h-[40vh] md:h-auto z-10">
                    <div className="p-3 md:p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-sm md:text-lg text-gray-800">Fatura Atual</h2>
                        <span className="text-xs text-gray-500">{cart.length} itens</span>
                    </div>
                    <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3">
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-400 mt-6 text-sm">Nenhum item adicionado.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-start border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold text-xs md:text-sm">{item.name}</h4>
                                        <p className="text-[10px] md:text-xs text-gray-500">{item.qty} x {Number(item.sell_price).toFixed(2)} MZN</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-xs md:text-sm">{Number(item.sell_price * item.qty).toFixed(2)} MZN</span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 mt-1"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 md:p-4 border-t bg-white">
                        <button onClick={finalizarVenda} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl active:scale-95 hover:bg-green-700 transition text-sm md:text-base">
                            Finalizar Venda
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}