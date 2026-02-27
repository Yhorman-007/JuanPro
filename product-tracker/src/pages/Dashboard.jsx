import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useSearch } from '../context/SearchContext';
import { DollarSign, Package, AlertTriangle, TrendingUp, Calendar, ShoppingBag, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCOP } from '../utils/formatters';

const StatCard = ({ icon: Icon, label, value, accentClass, glowClass, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="w-full glass-vibrant p-8 rounded-3xl relative overflow-hidden group shadow-2xl min-w-0"
        >
            {/* Background icon watermark */}
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rounded-2xl ${accentClass}`}>
                <Icon className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col w-full h-full justify-between">
                <div className="flex items-start gap-4 flex-wrap">
                    <div className={`p-5 rounded-2xl ${accentClass} bg-opacity-10 shadow-xl ${glowClass} border border-white/20`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                </div>
                <div className="mt-8 w-full">
                    <p className={`font-black text-slate-900 dark:text-slate-100 leading-tight text-3xl tracking-[-0.05em] mb-1 whitespace-nowrap`}>
                        {value}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {label}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { totalStockValue, dailySalesTotal, totalUnitsSold, alerts, products, topProducts, loading } = useInventory();
    const { searchTerm } = useSearch();
    const navigate = useNavigate();

    const term = (searchTerm || '').trim().toLowerCase();

    const filteredLowStock = alerts.lowStock.filter(p =>
        !term || (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term)
    );

    const filteredExpiringSoon = alerts.expiringSoon.filter(p =>
        !term || (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term)
    );

    const filteredTopProducts = topProducts.filter(p =>
        !term || (p.name || '').toLowerCase().includes(term)
    );

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold">Analizando inventario...</p>
            </div>
        );
    }

    const handleReponer = (productName) => {
        navigate('/purchase-orders', { state: { productName } });
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-4xl font-black text-slate-950 dark:text-slate-100 tracking-tight">Dashboard</h2>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin size={14} className="text-[#10b981]" />
                        <span className="text-xs font-bold uppercase tracking-widest">Sede Medellín, Colombia</span>
                    </div>
                </div>
                <div className="text-sm font-black text-[#10b981] dark:text-emerald-400 glass px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-lg">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Package}
                    label="Valor en Stock"
                    value={formatCOP(totalStockValue)}
                    accentClass="bg-[#10b981]"
                    glowClass="shadow-[#10b981]/30"
                    delay={0.1}
                />
                <StatCard
                    icon={DollarSign}
                    label="Ventas Hoy"
                    value={formatCOP(dailySalesTotal)}
                    accentClass="bg-[#22c55e]"
                    glowClass="shadow-[#22c55e]/30"
                    delay={0.2}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Total Ventas (Unidades)"
                    value={totalUnitsSold ?? 0}
                    accentClass="bg-[#06b6d4]"
                    glowClass="shadow-[#06b6d4]/30"
                    delay={0.25}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Alertas de Stock"
                    value={alerts.lowStock.length}
                    accentClass="bg-orange-500"
                    glowClass="shadow-orange-500/30"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card rounded-3xl overflow-hidden flex flex-col border border-[#7c3aed]/20"
                >
                    <div className="p-6 flex justify-between items-center cyber-header">
                        <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                            Atención Urgente
                        </h3>
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[450px] scrollbar-hide">
                        {filteredLowStock.length === 0 && filteredExpiringSoon.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
                                    <Package className="w-12 h-12 text-emerald-500 opacity-60" />
                                </div>
                                <p className="font-black text-lg">
                                    {searchTerm ? 'Sin coincidencias' : 'Inventario Optimizado'}
                                </p>
                                <p className="text-sm font-medium">
                                    {searchTerm ? `No se encontró "${searchTerm}"` : 'No se detectaron anomalías'}
                                </p>
                            </div>
                        )}

                        {filteredLowStock.map((p, i) => (
                            <motion.div
                                key={`low-${p.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center justify-between p-5 glass-card !bg-white/40 dark:!bg-white/5 hover:!bg-orange-500/10 transition-all rounded-3xl border-none shadow-sm group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 dark:text-slate-200 text-lg group-hover:text-orange-600 transition-colors">{p.name}</p>
                                        <p className="text-sm font-bold text-slate-500">Stock: <span className="text-orange-600 font-black">{p.stock}</span> / Mín: {p.min_stock}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReponer(p.name)}
                                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/30 uppercase tracking-widest transition-all"
                                >
                                    Reponer
                                </motion.button>
                            </motion.div>
                        ))}

                        {filteredExpiringSoon.map((p, i) => (
                            <motion.div
                                key={`exp-${p.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center justify-between p-5 glass-card !bg-white/40 dark:!bg-white/5 hover:!bg-red-500/10 transition-all rounded-3xl border-none shadow-sm group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 dark:text-slate-200 text-lg group-hover:text-red-600 transition-colors">{p.name}</p>
                                        <p className="text-sm font-bold text-slate-500">Vence: <span className="text-red-600 font-black">{p.expiration_date}</span></p>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-red-100 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                    Caduca
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Movement Analysis */}
                {filteredTopProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card rounded-3xl overflow-hidden"
                    >
                        <div className="p-6 flex justify-between items-center cyber-header">
                            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-[#7c3aed]" />
                                Ranking de Movimientos (Unidades)
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            {filteredTopProducts.map((p, index) => {
                                // Find max sold to scale progress bars relative to top seller
                                const maxSold = Math.max(...filteredTopProducts.map(tp => tp.total_sold), 1);
                                const progress = (p.total_sold / maxSold) * 100;

                                return (
                                    <div key={p.id} className="relative group">
                                        <div className="flex justify-between mb-3 items-end">
                                            <span className="font-black text-slate-700 dark:text-slate-200 text-lg">{p.name}</span>
                                            <span className="text-xs font-black text-[#7c3aed] bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-200/50 shadow-sm italic">
                                                {p.total_sold} vendidos
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner p-0.5 border border-white dark:border-slate-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (index * 0.1) }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] shadow-lg shadow-indigo-500/20"
                                            ></motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

