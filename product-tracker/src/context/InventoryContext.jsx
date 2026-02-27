import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createAuditLog } from '../utils/auditLogger';
import { showLowStockNotification, showExpirationNotification } from '../utils/notifications';
import { productsApi, reportsApi, suppliersApi, salesApi, stockApi, purchaseOrdersApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useSearch } from './SearchContext';

const InventoryContext = createContext();

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};

export const InventoryProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [cart, setCart] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [stockMovements, setStockMovements] = useState([]);
    const [locations, setLocations] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [topProducts, setTopProducts] = useState([]);
    const { searchTerm } = useSearch();
    const [stats, setStats] = useState({
        totalStockValue: 0,
        dailySalesTotal: 0,
        totalSales: 0,
        averageSale: 0
    });

    const filteredProducts = useMemo(() => {
        const term = (searchTerm || '').trim().toLowerCase();
        return products.filter(p =>
            !term ||
            (p.name || '').toLowerCase().includes(term) ||
            (p.sku || '').toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    // Fetch initial data from API
    const refreshData = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [prodRes, suppliersRes, valuationRes, salesRes, poRes, salesListRes, topProductsRes] = await Promise.all([
                productsApi.getAll(),
                suppliersApi.getAll(),
                reportsApi.getValuation(),
                reportsApi.getSalesSummary(),
                purchaseOrdersApi.getAll().catch(() => ({ data: [] })),
                salesApi.getAll().catch(() => ({ data: [] })),
                reportsApi.getTopProducts().catch(() => ({ data: [] }))
            ]);

            setProducts(prodRes.data || []);
            setSuppliers(suppliersRes.data || []);
            setPurchaseOrders(poRes.data || []);
            setSales(salesListRes.data || []);
            setTopProducts(topProductsRes.data || []);
            setStats({
                totalStockValue: valuationRes.data?.total_inventory_value || 0,
                dailySalesTotal: salesRes.data?.daily_revenue || 0,
                totalSales: salesRes.data?.total_sales || 0,
                totalUnitsSold: salesRes.data?.total_units_sold || 0,
                averageSale: salesRes.data?.average_sale || 0
            });

        } catch (error) {
            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [isAuthenticated]);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Monitor low stock and send notifications
    useEffect(() => {
        products.forEach(product => {
            if (!product.archived && product.stock <= product.min_stock) {
                showLowStockNotification(product);
            }
        });
    }, [products]);

    // Alerts Logic (RF17/24)
    const alerts = useMemo(() => {
        const activeProducts = products.filter(p => !p.archived);
        // Use the configurable threshold from Settings (default 5)
        const globalThreshold = parseInt(localStorage.getItem('lowStockThreshold') || '5', 10);
        const lowStock = activeProducts.filter(p => p.stock <= p.min_stock || p.stock <= globalThreshold);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringSoon = activeProducts.filter(p => {
            if (!p.expiration_date) return false;
            const expDate = new Date(p.expiration_date);
            return expDate <= thirtyDaysFromNow && expDate >= today;
        });

        return { lowStock, expiringSoon };
    }, [products]);

    // Gross Profit Calculation (RF08)
    const calculateGrossProfit = (purchasePrice, salePrice) => {
        if (!purchasePrice || !salePrice) return 0;
        return (parseFloat(salePrice) - parseFloat(purchasePrice)).toFixed(2);
    };

    // Product Operations
    const addProduct = async (product) => {
        try {
            const response = await productsApi.create(product);
            setProducts(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            const response = await productsApi.update(id, updates);
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productsApi.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error; // Propagate error to the component
        }
    };

    const archiveProduct = async (id) => {
        try {
            const response = await productsApi.archive(id);
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
        } catch (error) {
            console.error('Error archiving product:', error);
            throw error;
        }
    };

    // ... (rest of functions like Stock movements, Sales etc. would follow same pattern)
    // For now keeping them as local mock to avoid breaking UI if backend routes aren't complete

    // Stock Movement Operations (RF09, RF10, RF11)
    const fetchProductMovements = async (productId) => {
        try {
            const response = await stockApi.getByProductId(productId);
            setStockMovements(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching product movements:', error);
            throw error;
        }
    };

    const createStockMovement = async (movement) => {
        try {
            const response = await stockApi.createMovement(movement);
            setStockMovements(prev => [response.data, ...prev]);
            // Refresh everything (products, stats, etc.)
            await refreshData();
            return response.data;
        } catch (error) {
            console.error('Error creating stock movement:', error);
            throw error;
        }
    };

    const addSupplier = async (supplier) => {
        try {
            const response = await suppliersApi.create(supplier);
            setSuppliers(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error adding supplier:', error);
            throw error;
        }
    };

    const updateSupplier = async (id, updates) => {
        try {
            const response = await suppliersApi.update(id, updates);
            setSuppliers(prev => prev.map(s => s.id === id ? response.data : s));
            return response.data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    };

    const deleteSupplier = async (id) => {
        try {
            await suppliersApi.delete(id);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    };

    const createPurchaseOrder = async (po) => {
        try {
            const response = await purchaseOrdersApi.create(po);
            setPurchaseOrders(prev => [response.data, ...prev]);
            showNotification('Orden de compra creada', 'success');
            await refreshData();
            return response.data;
        } catch (error) {
            console.error('Error creating purchase order:', error);
            showNotification(error.response?.data?.detail || 'Error al crear orden', 'error');
            throw error;
        }
    };

    const receivePurchaseOrder = async (id) => {
        try {
            const response = await purchaseOrdersApi.receive(id);
            setPurchaseOrders(prev => prev.map(p => p.id === id ? response.data : p));
            showNotification('Orden marcada como recibida. Stock actualizado.', 'success');
            await refreshData();
            return response.data;
        } catch (error) {
            console.error('Error receiving purchase order:', error);
            showNotification(error.response?.data?.detail || 'Error al recibir orden', 'error');
            throw error;
        }
    };

    const deletePurchaseOrder = async (id) => {
        try {
            await purchaseOrdersApi.delete(id);
            setPurchaseOrders(prev => prev.filter(p => p.id !== id));
            showNotification('Orden eliminada del historial', 'success');
        } catch (error) {
            console.error('Error deleting purchase order:', error);
            showNotification(error.response?.data?.detail || 'Error al eliminar', 'error');
            throw error;
        }
    };

    const { showNotification } = useNotification();

    const addToCart = (product) => {
        if (product.stock <= 0) {
            showNotification(`No hay stock disponible de ${product.name}`, 'warning');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty + 1 > product.stock) {
                    showNotification(`No puedes agregar más de ${product.stock} unidades de ${product.name}`, 'warning');
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));

    const updateCartQty = (productId, qty) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (qty > product.stock) {
            showNotification(`Stock insuficiente: Solo quedan ${product.stock} unidades`, 'warning');
            return;
        }

        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prev => prev.map(item => item.id === productId ? { ...item, qty } : item));
    };
    const clearCart = () => setCart([]);

    const completeSale = async (total, discount, paymentMethod) => {
        const saleData = {
            total,
            discount,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.qty,
                unit_price: item.price_sale
            }))
        };

        try {
            const response = await salesApi.create(saleData);
            setSales(prev => [response.data, ...prev]);
            clearCart();
            await refreshData(); // Refresh everything to update stock and stats
            return response.data;
        } catch (error) {
            console.error('Error completing sale:', error);
            throw error;
        }
    };

    return (
        <InventoryContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct, archiveProduct,
            sales, cart, addToCart, removeFromCart, updateCartQty, clearCart, completeSale,
            suppliers, addSupplier, updateSupplier, deleteSupplier,
            purchaseOrders, createPurchaseOrder, receivePurchaseOrder, deletePurchaseOrder,
            stockMovements, createStockMovement, fetchProductMovements,
            locations, auditLogs, alerts, calculateGrossProfit,
            totalStockValue: stats.totalStockValue,
            dailySalesTotal: stats.dailySalesTotal,
            totalUnitsSold: stats.totalUnitsSold,
            topProducts,
            filteredProducts,
            stats,
            isOnline: onlineStatus, loading, refreshData
        }}>
            {children}
        </InventoryContext.Provider>
    );
};
