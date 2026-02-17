import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Search, Edit, Trash2, Archive, History, X, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
    const { products, addProduct, deleteProduct, archiveProduct, updateProduct, stockMovements, createStockMovement, fetchProductMovements } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [viewingMovements, setViewingMovements] = useState(null);
    const [adjustingStock, setAdjustingStock] = useState(null);

    const filteredProducts = products.filter(p => {
        const name = p.name || '';
        const sku = p.sku || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArchived = showArchived ? p.archived : !p.archived;
        return matchesSearch && matchesArchived;
    });

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProduct = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            category: formData.get('category'),
            price_purchase: parseFloat(formData.get('price_purchase')),
            price_sale: parseFloat(formData.get('price_sale')),
            unit: formData.get('unit'),
            stock: parseInt(formData.get('stock')),
            min_stock: parseInt(formData.get('min_stock')),
            location: formData.get('location'),
            expiration_date: formData.get('expiration_date') || null
        };
        try {
            await addProduct(newProduct);
            setIsAddingProduct(false);
        } catch (error) {
            console.error('Error in handleAddProduct:', error);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            category: formData.get('category'),
            price_purchase: parseFloat(formData.get('price_purchase')),
            price_sale: parseFloat(formData.get('price_sale')),
            unit: formData.get('unit'),
            min_stock: parseInt(formData.get('min_stock')),
            location: formData.get('location'),
            expiration_date: formData.get('expiration_date') || null
        };
        try {
            await updateProduct(editingProduct.id, updates);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error in handleSaveEdit:', error);
        }
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const quantity = parseInt(formData.get('quantity'));
        const type = formData.get('type'); // 'entry' or 'exit'

        const movement = {
            product_id: adjustingStock.id,
            type: type.toUpperCase(),
            quantity: quantity,
            reason: formData.get('reason'),
            date: new Date().toISOString()
        };

        try {
            await createStockMovement(movement);
            setAdjustingStock(null);
            alert('Ajuste de stock realizado con éxito');
        } catch (error) {
            console.error('Error in handleAdjustStock:', error);
            alert('Error al ajustar stock: ' + (error.response?.data?.detail || error.message));
        }
    };

    const productMovements = viewingMovements
        ? stockMovements.filter(m => m.product_id === viewingMovements.id)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-slate-800 tracking-tight"
                >
                    Inventario
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddingProduct(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/30 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl overflow-hidden flex flex-col"
            >
                <div className="p-5 border-b border-gray-100/50 bg-white/40 backdrop-blur-md flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showArchived
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Archive className="w-4 h-4" />
                        {showArchived ? 'Ver Activos' : 'Ver Archivados'}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4 rounded-tr-lg text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            <AnimatePresence>
                                {filteredProducts.map((product, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={product.id}
                                        className={`group hover:bg-white/60 transition-colors ${product.archived ? 'opacity-60' : ''}`}
                                    >
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.location}</p>
                                        </td>
                                        <td className="p-4 text-slate-500">{product.category}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock <= product.min_stock ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {product.stock} {product.unit}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700">${(product.price_sale || 0).toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setViewingMovements(product);
                                                        fetchProductMovements(product.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Historial"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setAdjustingStock(product)}
                                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Ajustar Stock"
                                                >
                                                    <Box className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingProduct(product)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('¿Estás seguro de archivar este producto?')) {
                                                            await archiveProduct(product.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('¿Estás seguro de eliminar este producto permanentemente?')) {
                                                            await deleteProduct(product.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            No se encontraron productos.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsAddingProduct(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">Nuevo Producto</h3>
                                <button
                                    onClick={() => setIsAddingProduct(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                        <input name="name" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                        <input name="sku" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                        <input name="category" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Unidad (kg, unidades, etc)</label>
                                        <input name="unit" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                                        <input name="stock" type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                                        <input name="min_stock" type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio Compra</label>
                                        <input name="price_purchase" type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta</label>
                                        <input name="price_sale" type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                                        <input name="location" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Pasillo 1, Estante A" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento (Opcional)</label>
                                        <input name="expiration_date" type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingProduct(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30 transition-all"
                                    >
                                        Crear Producto
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">Editar Producto</h3>
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                        <input
                                            name="name"
                                            defaultValue={editingProduct.name}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                        <input
                                            name="sku"
                                            defaultValue={editingProduct.sku}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                        <input
                                            name="category"
                                            defaultValue={editingProduct.category}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                                        <input
                                            name="unit"
                                            defaultValue={editingProduct.unit}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio Compra</label>
                                        <input
                                            name="price_purchase"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingProduct.price_purchase}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta</label>
                                        <input
                                            name="price_sale"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingProduct.price_sale}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                                        <input
                                            name="min_stock"
                                            type="number"
                                            defaultValue={editingProduct.min_stock}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                                        <input
                                            name="location"
                                            defaultValue={editingProduct.location}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento (Opcional)</label>
                                        <input
                                            name="expiration_date"
                                            type="date"
                                            defaultValue={editingProduct.expiration_date ? editingProduct.expiration_date.split('T')[0] : ''}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30 transition-all"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Movement History Modal */}
            <AnimatePresence>
                {viewingMovements && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setViewingMovements(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{viewingMovements.name}</h3>
                                    <p className="text-slate-500">Historial de Movimientos</p>
                                </div>
                                <button
                                    onClick={() => setViewingMovements(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {productMovements.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">No hay movimientos registrados</p>
                                ) : (
                                    productMovements.map(movement => (
                                        <div key={movement.id} className="p-4 bg-white/50 rounded-lg border border-slate-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${movement.type.toLowerCase() === 'entry' ? 'bg-green-100 text-green-700' :
                                                        movement.type.toLowerCase() === 'exit' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {movement.type.toLowerCase() === 'entry' ? 'Entrada' :
                                                            movement.type.toLowerCase() === 'exit' ? 'Salida' : 'Transferencia'}
                                                    </span>
                                                    <p className="text-sm text-slate-700 mt-2">{movement.reason}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{movement.user} - {new Date(movement.created_at).toLocaleString('es-ES')}</p>
                                                </div>
                                                <span className="text-lg font-bold text-slate-800">
                                                    {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stock Adjustment Modal */}
            <AnimatePresence>
                {adjustingStock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setAdjustingStock(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Ajustar Stock</h3>
                                    <p className="text-slate-500">{adjustingStock.name}</p>
                                </div>
                                <button
                                    onClick={() => setAdjustingStock(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAdjustStock} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Movimiento</label>
                                    <select
                                        name="type"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        required
                                    >
                                        <option value="entry">Entrada (+)</option>
                                        <option value="exit">Salida (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                                    <textarea
                                        name="reason"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="Ej: Ajuste de inventario, Producto dañado..."
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustingStock(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30 transition-all"
                                    >
                                        Guardar Ajuste
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
