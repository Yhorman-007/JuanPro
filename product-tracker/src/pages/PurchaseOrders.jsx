import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSearch } from '../context/SearchContext';
import { Plus, CheckCircle, Package, X, Calendar, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../utils/formatters';

const PurchaseOrders = () => {
    const { purchaseOrders, createPurchaseOrder, receivePurchaseOrder, deletePurchaseOrder, suppliers, products } = useInventory();
    const { searchTerm } = useSearch();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderItems, setOrderItems] = useState([]);

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : 'Desconocido';
    };

    const getProductName = (productId) => {
        const product = (products || []).find(p => p.id === productId);
        return product ? product.name : 'Desconocido';
    };

    const term = (searchTerm || '').toLowerCase().trim();
    const filteredOrders = (purchaseOrders || []).filter(order => {
        const supplierName = getSupplierName(order?.supplier_id).toLowerCase();
        const orderId = (order?.id || '').toString();
        return !term || supplierName.includes(term) || orderId.includes(term);
    });

    const handleAddItem = () => {
        setOrderItems([...orderItems, { product_id: '', quantity: 1, unit_cost: 0 }]);
    };

    const handleRemoveItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...orderItems];
        updated[index][field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                updated[index].unit_cost = product.price_purchase;
            }
        }

        setOrderItems(updated);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const items = orderItems.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: Math.max(1, parseInt(item.quantity) || 1),
            unit_cost: parseFloat(item.unit_cost) || 0
        })).filter(item => item.product_id && item.quantity > 0);

        if (items.length === 0) return;

        const po = {
            supplier_id: parseInt(formData.get('supplier_id')),
            items,
            notes: formData.get('notes') || null
        };

        try {
            await createPurchaseOrder(po);
            setShowCreateModal(false);
            setOrderItems([]);
        } catch (_) { /* Error handled in context */ }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                >
                    Órdenes de Compra
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 btn-primary-elite text-white px-5 py-2.5 rounded-xl font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Orden
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden shadow-md"
            >
                <div className="p-5 flex justify-between items-center cyber-header">
                    <div className="flex items-center gap-2">
                        <Search className="text-primary w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-slate-300">Registro de Órdenes</h3>
                        {searchTerm && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg animate-pulse">
                                Filtrando por: "{searchTerm}"
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700">ID</th>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700">Proveedor</th>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700">Total</th>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700">Fecha</th>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700 text-center">Estado</th>
                                <th className="p-4 border-b border-purple-100 dark:border-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50 dark:divide-slate-800/50">
                            {filteredOrders.length === 0 && !searchTerm && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                                        No hay órdenes de compra registradas
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.length === 0 && searchTerm && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                                        No se encontraron órdenes para tu búsqueda
                                    </td>
                                </tr>
                            )}
                            <AnimatePresence mode='popLayout'>
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={order.id}
                                        className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors group"
                                    >
                                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">OC-{order.id}</td>
                                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{getSupplierName(order.supplier_id)}</td>
                                        <td className="p-4 font-black text-primary">{formatCOP(order.total)}</td>
                                        <td className="p-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString('es-ES')}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'received' || order.status === 'completado' ? 'bg-green-100 text-green-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {order.status === 'received' || order.status === 'completado' ? 'Completado' :
                                                    order.status === 'pending' ? 'Pendiente' : order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => receivePurchaseOrder(order.id)}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Marcar Recibida"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Eliminar esta orden del historial?')) {
                                                            deletePurchaseOrder(order.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Create Order Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Nueva Orden de Compra</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 dark:text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOrder} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proveedor</label>
                                    <select
                                        name="supplier_id"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar proveedor</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Productos</label>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="text-sm text-primary hover:text-primary-hover font-bold"
                                        >
                                            + Agregar Producto
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-end p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Producto</label>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded"
                                                        required
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {products.filter(p => !p.archived).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Cantidad</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            handleItemChange(index, 'quantity', isNaN(val) || val < 1 ? 1 : val);
                                                        }}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Costo Unit.</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value))}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {orderItems.length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-4">No hay productos agregados</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas (opcional)</label>
                                    <textarea
                                        name="notes"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        rows="2"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Estimado</p>
                                        <p className="text-2xl font-black text-primary">
                                            {formatCOP(orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0))}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={orderItems.length === 0}
                                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Crear Orden
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseOrders;
