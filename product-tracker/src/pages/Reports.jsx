import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSearch } from '../context/SearchContext';
import { DollarSign, Download, FileText, TrendingUp, Calculator, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../utils/formatters';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const { products, sales, stockMovements } = useInventory();
    const { searchTerm } = useSearch();
    const { showNotification } = useNotification();
    const [closureData, setClosureData] = useState(null);
    const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
    const [loadingClosure, setLoadingClosure] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchDailyClosure = async () => {
        setLoadingClosure(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/reports/daily-closure`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClosureData(res.data);
            setIsClosureModalOpen(true);
        } catch (error) {
            showNotification('Error al obtener cierre de caja: ' + (error.response?.data?.detail || error.message), 'error');
        } finally {
            setLoadingClosure(false);
        }
    };

    // Stock Valuation Calculations (filtrado estricto por búsqueda: nombre, SKU)
    const term = (searchTerm || '').trim().toLowerCase();
    const stockValuation = products
        .filter(p => !p.archived && (!term || (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term)))
        .map(p => ({
            ...p,
            totalValue: (p.stock || 0) * (p.price_purchase || 0)
        }));

    const totalInventoryValue = stockValuation.reduce((sum, p) => sum + p.totalValue, 0);

    // Sales Analysis
    const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte de Valoración de Inventario', 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 32);

        const tableData = stockValuation.map(p => [
            p.name,
            p.sku,
            p.stock,
            formatCOP(p.price_purchase || 0),
            formatCOP(p.totalValue || 0)
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Producto', 'SKU', 'Stock', 'Costo Unit.', 'Valor Total']],
            body: tableData,
            foot: [['', '', '', 'TOTAL:', formatCOP(totalInventoryValue)]],
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.save('reporte-inventario.pdf');
    };

    // Export to CSV
    const exportToCSV = () => {
        const sep = ';';
        const headers = ['Producto', 'SKU', 'Stock', 'Costo Unitario', 'Valor Total'];
        const rows = stockValuation.map(p => [
            p.name,
            p.sku,
            p.stock,
            (p.price_purchase || 0).toString(),
            (p.totalValue || 0).toString()
        ]);

        const csvContent = [headers.join(sep), ...rows.map(row => row.join(sep))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'reporte-inventario.csv';
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                >
                    Reportes
                </motion.h2>
                <div className="flex gap-2">
                    <button
                        onClick={fetchDailyClosure}
                        disabled={loadingClosure}
                        className="flex items-center gap-2 btn-primary-elite text-white px-5 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <Calculator className="w-4 h-4" />
                        {loadingClosure ? 'Cargando...' : 'Cierre de Caja'}
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Valor Inventario</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCOP(totalInventoryValue)}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-emerald-900/30 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Ventas Totales</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCOP(totalSales)}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><FileText className="w-6 h-6 text-purple-600" /></div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Movimientos</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stockMovements.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Valuation Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden shadow-md">
                <div className="p-5 flex justify-between items-center cyber-header">
                    <div className="flex items-center gap-2">
                        <Search className="text-primary w-5 h-5" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">Valoración de Inventario</h3>
                        {searchTerm && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg animate-pulse">
                                Filtrando por: "{searchTerm}"
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-emerald-50/30 dark:bg-emerald-900/10 text-emerald-600/70 dark:text-emerald-400/50 font-black text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-4 border-b border-emerald-100/50 dark:border-emerald-800/20">Producto</th>
                                <th className="p-4 border-b border-emerald-100/50 dark:border-emerald-800/20">Categoría</th>
                                <th className="p-4 border-b border-emerald-100/50 dark:border-emerald-800/20 text-right">Stock</th>
                                <th className="p-4 border-b border-emerald-100/50 dark:border-emerald-800/20 text-right">Costo Unit.</th>
                                <th className="p-4 border-b border-emerald-100/50 dark:border-emerald-800/20 text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/30 dark:divide-emerald-900/20">
                            {stockValuation.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                                        No se encontraron resultados para tu búsqueda
                                    </td>
                                </tr>
                            )}
                            <AnimatePresence mode='popLayout'>
                                {stockValuation.map((product) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={product.id}
                                        className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{product.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{product.sku}</p>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">{product.category}</td>
                                        <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-300">{product.stock} {product.unit}</td>
                                        <td className="p-4 text-right text-slate-700 dark:text-slate-300">{formatCOP(product.price_purchase)}</td>
                                        <td className="p-4 text-right font-black text-slate-800 dark:text-white">{formatCOP(product.totalValue)}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                        <tfoot className="bg-slate-50/80 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan="4" className="p-4 text-right font-black text-slate-800 dark:text-white uppercase tracking-wider">TOTAL INVENTARIO:</td>
                                <td className="p-4 text-right text-xl font-black text-primary">{formatCOP(totalInventoryValue)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </motion.div>

            {/* Cierre de Caja Modal */}
            <AnimatePresence>
                {isClosureModalOpen && closureData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsClosureModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Cierre de Caja</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Fecha: {new Date(closureData.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <button
                                    onClick={() => setIsClosureModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Hoy</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{closureData.total_sales_count}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{closureData.total_items_sold}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Total Recaudado</p>
                                    <p className="text-4xl font-black text-primary-hover">{formatCOP(closureData.total_revenue)}</p>
                                    {closureData.total_discount > 0 && (
                                        <p className="text-xs text-slate-500 mt-2">Dctos: {formatCOP(closureData.total_discount)}</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b dark:border-slate-700 pb-2">Métodos de Pago</h4>
                                    <div className="space-y-2">
                                        {Object.entries(closureData.by_payment_method).map(([method, amount]) => (
                                            <div key={method} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">{method}</span>
                                                <span className="font-black text-slate-800 dark:text-white">{formatCOP(amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        showNotification('Cierre de caja guardado exitosamente', 'success');
                                        setIsClosureModalOpen(false);
                                    }}
                                    className="w-full py-4 bg-slate-900 dark:bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                                >
                                    Finalizar Jornada
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
