import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSearch } from '../context/SearchContext';
import { Plus, Search, Edit, Trash2, X, Building2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Suppliers = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
    const { searchTerm, setSearchTerm } = useSearch();
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredSuppliers = (suppliers || []).filter(s => {
        const term = (searchTerm || '').trim().toLowerCase();
        const name = (s?.name || '').toLowerCase();
        const contact = (s?.contact_name || '').toLowerCase();
        const email = (s?.email || '').toLowerCase();
        const phone = (s?.phone || '').toLowerCase();
        return !term || name.includes(term) || contact.includes(term) || email.includes(term) || phone.includes(term);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const supplierData = {
            name: formData.get('name'),
            contact_name: formData.get('contact_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            payment_terms: formData.get('payment_terms'),
            address: formData.get('address')
        };

        if (editingSupplier) {
            updateSupplier(editingSupplier.id, supplierData);
            setEditingSupplier(null);
        } else {
            addSupplier(supplierData);
            setShowAddModal(false);
        }
    };

    const currentSupplier = editingSupplier || (showAddModal ? {} : null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-slate-950 dark:text-slate-100 tracking-tight"
                >
                    Proveedores
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 btn-primary-elite text-white px-5 py-2.5 rounded-xl font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Proveedor
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
            >
                <div className="p-5 flex justify-between items-center cyber-header">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-primary w-6 h-6" />
                        <h3 className="font-black text-slate-900 dark:text-slate-200">Socio-Proveedores</h3>
                    </div>
                    {searchTerm && (
                        <span className="text-[10px] bg-primary/20 text-primary-hover px-3 py-1 rounded-lg border border-primary/30 font-black uppercase tracking-widest">
                            Filtrando: {searchTerm}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {filteredSuppliers.map((supplier) => (
                        <motion.div
                            key={supplier.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{supplier.name}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingSupplier(supplier)}
                                        className="p-1 hover:bg-primary/10 text-primary rounded"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteSupplier(supplier.id)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>{supplier.phone}</span>
                                </div>
                                <p className="text-xs mt-2 text-slate-400 dark:text-slate-500">Contacto: <span className="font-medium text-slate-600 dark:text-slate-300">{supplier.contact_name}</span></p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Términos: <span className="font-medium text-slate-600 dark:text-slate-300">{supplier.payment_terms}</span></p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {currentSupplier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setEditingSupplier(null);
                            setShowAddModal(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingSupplier(null);
                                        setShowAddModal(false);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                    <input name="name" defaultValue={currentSupplier.name} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contacto</label>
                                    <input name="contact_name" defaultValue={currentSupplier.contact_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input name="email" type="email" defaultValue={currentSupplier.email} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                    <input name="phone" defaultValue={currentSupplier.phone} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Términos de Pago</label>
                                    <input name="payment_terms" defaultValue={currentSupplier.payment_terms} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                    <textarea name="address" defaultValue={currentSupplier.address} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" rows="2" required />
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingSupplier(null);
                                            setShowAddModal(false);
                                        }}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30"
                                    >
                                        {editingSupplier ? 'Guardar' : 'Crear'}
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

export default Suppliers;
