import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSearch } from '../context/SearchContext';
import { useNotification } from '../context/NotificationContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, Save, Calculator, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCOP } from '../utils/formatters';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import EmergencyAuthModal from '../components/common/EmergencyAuthModal';

const POS = () => {
    const { products, cart, addToCart, removeFromCart, updateCartQty, clearCart, completeSale } = useInventory();
    const { isAdmin } = useAuth();
    const { showNotification } = useNotification();
    const { searchTerm, setSearchTerm } = useSearch();
    const [discount, setDiscount] = useState(0); // Percentage
    const [amountTendered, setAmountTendered] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [emergencyAuthItem, setEmergencyAuthItem] = useState(null);

    // Get tax config from localStorage
    const taxConfig = useMemo(() => {
        const saved = localStorage.getItem('taxConfig');
        return saved ? JSON.parse(saved) : { iva: 0 };
    }, []);

    const filteredProducts = useMemo(() => {
        const term = (searchTerm || '').trim().toLowerCase();
        return products.filter(p =>
            !p.archived && (
                !term ||
                (p.name || '').toLowerCase().includes(term) ||
                (p.sku || '').toLowerCase().includes(term)
            )
        );
    }, [products, searchTerm]);

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + ((item.price_sale || 0) * item.qty), 0);
    }, [cart]);

    const taxAmount = useMemo(() => {
        return (subtotal * (taxConfig.iva / 100));
    }, [subtotal, taxConfig.iva]);

    const total = useMemo(() => {
        const withTax = subtotal + taxAmount;
        return withTax * (1 - discount / 100);
    }, [subtotal, taxAmount, discount]);

    const change = useMemo(() => {
        const tendered = parseFloat(amountTendered) || 0;
        return (tendered - total).toFixed(2);
    }, [amountTendered, total]);

    const handleCheckout = async () => {
        if (!amountTendered || parseFloat(amountTendered) < total) {
            showNotification("¡Monto insuficiente!", "warning");
            return;
        }

        const proceedWithSale = async () => {
            try {
                const saleResult = await completeSale(total, discount, 'Efectivo'); // Default to Cash for now
                setIsCheckoutModalOpen(false);
                setAmountTendered('');
                setDiscount(0);
                showNotification("¡Venta completada exitosamente!", "success");

                // Ask if user wants PDF or generate it automatically
                generateReceiptPDF(saleResult);
            } catch (error) {
                console.error('Error in handleCheckout:', error);
                showNotification("Error al procesar la venta: " + (error.response?.data?.detail || error.message), "error");
            }
        };

        // If discount is high (>15%), require admin auth if not admin
        if (discount > 15 && !isAdmin) {
            setEmergencyAuthItem({
                title: 'Descuento de Alto Nivel',
                description: `Autorizando descuento del ${discount}% en venta por ${formatCOP(total)}`,
                callback: proceedWithSale
            });
            return;
        }

        proceedWithSale();
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
            {/* Product List Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden"
            >
                <div className="p-6 flex justify-between items-center z-10 cyber-header">
                    <div className="flex items-center gap-3">
                        <Package className="text-emerald-500 w-6 h-6" />
                        <h3 className="font-black text-xl text-slate-800 dark:text-slate-200 tracking-tight">Seleccionar Productos</h3>
                    </div>
                    {searchTerm && (
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 font-black uppercase tracking-widest animate-pulse">
                            Filtrando: {searchTerm}
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start scrollbar-hide">
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className={`group relative p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-50 dark:border-white/5 cursor-pointer hover:shadow-elite hover:-translate-y-1.5 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${product.stock > product.min_stock ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock <= 0 ? 'Sin Stock' : `${product.stock} disp.`}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">{product.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{product.sku}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
                                        <span className="text-xl font-black text-emerald-600 dark:text-[#10b981] drop-shadow-sm">{formatCOP(product.price_sale)}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            disabled={product.stock <= 0}
                                            className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all disabled:bg-slate-300 disabled:shadow-none"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                            <Search className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg">No se encontraron productos.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Cart Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-96 glass-card rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10"
            >
                <div className="p-5 flex justify-between items-center z-10 cyber-header">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        Venta Actual
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={clearCart} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Limpiar Carrito">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    <AnimatePresence>
                        {cart.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                key={item.id}
                                className="flex justify-between items-center p-3 bg-white/60 dark:bg-[#0f172a]/80 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm group hover:border-emerald-500/20 transition-colors"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatCOP(item.price_sale)} x {item.qty}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-emerald-50/50 dark:bg-[#0f172a] rounded-lg shadow-inner border border-emerald-100 dark:border-emerald-900">
                                        <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-slate-800 text-emerald-700 dark:text-slate-300 rounded-l-lg transition-colors">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className={`w-6 text-center text-sm font-bold ${item.qty >= item.stock ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>{item.qty}</span>
                                        <button
                                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                                            disabled={item.qty >= item.stock}
                                            className="w-7 h-7 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-slate-800 text-emerald-700 dark:text-slate-300 rounded-r-lg transition-colors disabled:opacity-30"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="font-black text-slate-900 dark:text-white w-24 text-right">
                                        {formatCOP((item.price_sale || 0) * item.qty)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <ShoppingCart className="w-10 h-10" />
                            </div>
                            <p>El carrito está vacío</p>
                            <p className="text-sm text-slate-400/80 mt-1">Agrega productos para comenzar</p>
                        </div>
                    )}
                </div>

                <div className="p-6 glass-vibrant border-t border-white/20 space-y-5 z-20">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Descuento (%)</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-16 p-2 text-right bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none font-black text-sm text-slate-800 dark:text-slate-100 shadow-sm"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">IVA ({taxConfig.iva}%)</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">{formatCOP(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-slate-100 pt-4 border-t border-slate-100 dark:border-white/5">
                            <span>Total</span>
                            <span className="text-emerald-600 font-black drop-shadow-sm">{formatCOP(total)}</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCheckoutModalOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Cobrar
                    </motion.button>
                </div>
            </motion.div>

            {/* Checkout Modal */}
            <AnimatePresence>
                {isCheckoutModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => setIsCheckoutModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 overflow-hidden border border-slate-200 dark:border-white/10"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <Calculator className="w-6 h-6 text-primary" />
                                    Pago y Cambio
                                </h3>
                                <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl text-center border border-slate-100 dark:border-white/5">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monto Total a Pagar</p>
                                    <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{formatCOP(total)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto Recibido</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            autoFocus
                                            className="w-full pl-8 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-xl font-mono shadow-sm text-slate-900 dark:text-white"
                                            placeholder="0.00"
                                            value={amountTendered}
                                            onChange={(e) => setAmountTendered(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <motion.div
                                    animate={{
                                        backgroundColor: parseFloat(change) >= 0 ? '#f0fdf4' : '#fef2f2',
                                        borderColor: parseFloat(change) >= 0 ? '#bbf7d0' : '#fecaca'
                                    }}
                                    className="p-4 rounded-xl flex justify-between items-center border"
                                >
                                    <span className={`font-bold ${parseFloat(change) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Cambio:</span>
                                    <span className={`text-2xl font-bold font-mono ${parseFloat(change) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {parseFloat(change) >= 0 ? formatCOP(parseFloat(change)) : '---'}
                                    </span>
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCheckout}
                                    disabled={parseFloat(amountTendered) < total}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all mt-2"
                                >
                                    Completar Venta
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Emergency Authorization Modal */}
            <EmergencyAuthModal
                isOpen={!!emergencyAuthItem}
                onClose={() => setEmergencyAuthItem(null)}
                onAuthorized={() => emergencyAuthItem?.callback()}
                actionTitle={emergencyAuthItem?.title}
                actionDescription={emergencyAuthItem?.description}
            />
        </div>
    );
};

export default POS;
