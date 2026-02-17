import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
    const { products, sales, stockMovements } = useInventory();
    const [reportType, setReportType] = useState('valuation');

    // Stock Valuation Calculations
    const stockValuation = products
        .filter(p => !p.archived)
        .map(p => ({
            ...p,
            totalValue: (p.stock || 0) * (p.price_purchase || 0)
        }));

    const totalInventoryValue = stockValuation.reduce((sum, p) => sum + p.totalValue, 0);

    // Sales Analysis
    const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

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
            `$${(p.price_purchase || 0).toFixed(2)}`,
            `$${(p.totalValue || 0).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 40,
            head: [['Producto', 'SKU', 'Stock', 'Costo Unit.', 'Valor Total']],
            body: tableData,
            foot: [['', '', '', 'TOTAL:', `$${totalInventoryValue.toFixed(2)}`]],
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.save('reporte-inventario.pdf');
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Producto', 'SKU', 'Stock', 'Costo Unitario', 'Valor Total'];
        const rows = stockValuation.map(p => [
            p.name,
            p.sku,
            p.stock,
            (p.price_purchase || 0).toFixed(2),
            (p.totalValue || 0).toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
                    className="text-3xl font-bold text-slate-800 tracking-tight"
                >
                    Reportes
                </motion.h2>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Valor Total de Inventario</p>
                            <p className="text-2xl font-bold text-slate-800">${totalInventoryValue.toFixed(2)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Ventas Totales</p>
                            <p className="text-2xl font-bold text-slate-800">${totalSales.toFixed(2)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Movimientos Totales</p>
                            <p className="text-2xl font-bold text-slate-800">{stockMovements.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Valuation Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl overflow-hidden"
            >
                <div className="p-5 border-b border-gray-100/50 bg-white/40">
                    <h3 className="text-lg font-bold text-slate-800">Valoración de Inventario</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium text-xs uppercase">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4 text-right">Stock</th>
                                <th className="p-4 text-right">Costo Unit.</th>
                                <th className="p-4 text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {stockValuation.map((product) => (
                                <tr key={product.id} className="hover:bg-white/60 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.category}</p>
                                    </td>
                                    <td className="p-4 text-slate-600 font-mono text-xs">{product.sku}</td>
                                    <td className="p-4 text-right font-medium text-slate-700">{product.stock} {product.unit}</td>
                                    <td className="p-4 text-right text-slate-700">${product.price_purchase.toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold text-slate-800">${product.totalValue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                            <tr>
                                <td colSpan="4" className="p-4 text-right font-bold text-slate-800">TOTAL:</td>
                                <td className="p-4 text-right text-xl font-bold text-primary">${totalInventoryValue.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Reports;
