import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, CheckCircle, Package, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PurchaseOrders = () => {
    const { purchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus, suppliers, products } = useInventory();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderItems, setOrderItems] = useState([]);

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

    const handleCreateOrder = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const po = {
            supplier_id: parseInt(formData.get('supplier_id')),
            items: orderItems,
            notes: formData.get('notes'),
            total: orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
        };

        createPurchaseOrder(po);
        setShowCreateModal(false);
        setOrderItems([]);
    };

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : 'Desconocido';
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Desconocido';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-slate-800 tracking-tight"
                >
                    Órdenes de Compra
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/30"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Orden
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {purchaseOrders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-slate-800">OC-{order.id}</h3>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{getSupplierName(order.supplier_id)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'received' ? 'bg-green-100 text-green-700' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {order.status === 'received' ? 'Recibida' :
                                    order.status === 'pending' ? 'Pendiente' : order.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{getProductName(item.product_id)}</span>
                                    <span className="font-medium text-slate-800">{item.quantity} x ${item.unit_cost}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-xl font-bold text-slate-800">${order.total.toFixed(2)}</p>
                            </div>
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updatePurchaseOrderStatus(order.id, 'received')}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Marcar Recibida
                                </button>
                            )}
                            {order.status === 'received' && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(order.received_at).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {purchaseOrders.length === 0 && (
                    <div className="col-span-2 glass-card rounded-2xl p-12 text-center">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No hay órdenes de compra registradas</p>
                    </div>
                )}
            </div>

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
                                <h3 className="text-2xl font-bold text-slate-800">Nueva Orden de Compra</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOrder} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                                    <select
                                        name="supplier_id"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
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
                                        <label className="block text-sm font-medium text-slate-700">Productos</label>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="text-sm text-primary hover:text-primary-hover font-medium"
                                        >
                                            + Agregar Producto
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-end p-3 bg-slate-50 rounded-lg">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-slate-600 mb-1">Producto</label>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                                        required
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {products.filter(p => !p.archived).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-xs text-slate-600 mb-1">Cantidad</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <label className="block text-xs text-slate-600 mb-1">Costo Unit.</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value))}
                                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                                    <textarea
                                        name="notes"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        rows="2"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Estimado</p>
                                        <p className="text-2xl font-bold text-slate-800">
                                            ${orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={orderItems.length === 0}
                                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
