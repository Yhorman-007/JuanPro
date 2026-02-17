import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { DollarSign, Package, AlertTriangle, TrendingUp, Calendar, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 shadow-sm`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { totalStockValue, dailySalesTotal, alerts, products, loading } = useInventory();

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Actualizando datos...</p>
            </div>
        );
    }

    const topMovers = products
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
            >
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Panel Principal</h2>
                <div className="text-sm text-slate-500 glass px-4 py-2 rounded-full">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Package}
                    label="Valor en Stock"
                    value={`$${(Number(totalStockValue) || 0).toFixed(2)}`}
                    color="bg-blue-500 text-blue-600"
                    delay={0.1}
                />
                <StatCard
                    icon={DollarSign}
                    label="Ventas Hoy"
                    value={`$${(Number(dailySalesTotal) || 0).toFixed(2)}`}
                    color="bg-emerald-500 text-emerald-600"
                    delay={0.2}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Stock Bajo"
                    value={alerts.lowStock.length}
                    color="bg-orange-500 text-orange-600"
                    delay={0.3}
                />
                <StatCard
                    icon={Calendar}
                    label="Por Vencer"
                    value={alerts.expiringSoon.length}
                    color="bg-red-500 text-red-600"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/40">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Atención Requerida
                        </h3>
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[400px]">
                        {alerts.lowStock.length === 0 && alerts.expiringSoon.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                <p>Todo en orden. No hay alertas.</p>
                            </div>
                        )}

                        {alerts.lowStock.map((p, i) => (
                            <motion.div
                                key={`low-${p.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center justify-between p-4 bg-orange-50/50 hover:bg-orange-50 transition-colors rounded-xl border border-orange-100/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-12 bg-orange-400 rounded-full"></div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{p.name}</p>
                                        <p className="text-sm text-slate-500">Stock: <span className="text-orange-600 font-bold">{p.stock}</span> / Min: {p.min_stock}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded-lg shadow-sm border border-orange-100">
                                    Reponer
                                </span>
                            </motion.div>
                        ))}

                        {alerts.expiringSoon.map((p, i) => (
                            <motion.div
                                key={`exp-${p.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center justify-between p-4 bg-red-50/50 hover:bg-red-50 transition-colors rounded-xl border border-red-100/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-12 bg-red-400 rounded-full"></div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{p.name}</p>
                                        <p className="text-sm text-slate-500">Vence: <span className="text-red-600 font-bold">{p.expiration_date}</span></p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded-lg shadow-sm border border-red-100">
                                    Caduca Pronto
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Movement Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100/50 bg-white/40">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Top Movimientos
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {topMovers.map((p, index) => (
                            <div key={p.id} className="relative">
                                <div className="flex justify-between mb-2 items-end">
                                    <span className="font-semibold text-slate-700">{p.name}</span>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{100 - p.stock} vendidos</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (100 - p.stock))}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
