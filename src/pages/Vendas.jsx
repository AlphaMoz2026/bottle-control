import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vendas() {
    const navigate = useNavigate();
    const [bottles, setBottles] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Buscar as garrafas ao Supabase
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

        // Bloqueia se a quantidade no carrinho já atingiu o stock máximo
        if (currentQty >= bottle.stock_quantity) {
            alert("Não há stock suficiente para adicionar mais!");
            return;
        }

        if (existing) {
            setCart(cart.map((item) => item.id === bottle.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...bottle, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.sell_price * item.qty), 0);

    const finalizarVenda = async () => {
        if (cart.length === 0) return alert("O carrinho está vazio!");

        try {
            for (const item of cart) {
                // 1. Registar a venda na tabela 'sales'
                await supabase.from('sales').insert([
                    {
                        bottle_id: item.id,
                        quantity: item.qty,
                        total_price: item.sell_price * item.qty,
                        created_at: new Date().toISOString(), // Força a data e hora atual
                    },
                ]);

                // 2. Baixar o stock na tabela 'bottles'
                await supabase
                    .from('bottles')
                    .update({ stock_quantity: item.stock_quantity - item.qty })
                    .eq('id', item.id);
            }

            alert(`Venda de ${total.toFixed(2)} MZN finalizada com sucesso!`);
            setCart([]);

            // 3. Recarregar as garrafas para atualizar o stock no ecrã
            const { data } = await supabase.from('bottles').select('*').gt('stock_quantity', 0);
            setBottles(data);

        } catch (error) {
            alert("Erro ao finalizar venda: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Frente de Caixa</h1>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-bold">
                    <ShoppingCart className="w-5 h-5" /> Total: {total.toFixed(2)} MZN
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* LISTA DE GARRAFAS */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Garrafas Disponíveis</h2>
                    {loading ? <p>A carregar...</p> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {bottles.map((bottle) => (
                                <div key={bottle.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{bottle.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{bottle.category} | Stock: {bottle.stock_quantity}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-blue-600">{Number(bottle.sell_price).toFixed(2)} MZN</span>
                                        <button onClick={() => addToCart(bottle)} className="bg-blue-100 text-blue-600 p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CARRINHO */}
                <div className="w-96 bg-white border-l flex flex-col shadow-lg">
                    <div className="p-4 border-b">
                        <h2 className="font-bold text-lg">Fatura Atual</h2>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-400 mt-10">Nenhum item adicionado.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-start border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.qty} x {Number(item.sell_price).toFixed(2)} MZN</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-sm">{Number(item.sell_price * item.qty).toFixed(2)} MZN</span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 mt-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                        <button onClick={finalizarVenda} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
                            Finalizar Venda
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}