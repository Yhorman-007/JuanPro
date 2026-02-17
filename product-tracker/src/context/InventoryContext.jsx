import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createAuditLog } from '../utils/auditLogger';
import { showLowStockNotification, showExpirationNotification } from '../utils/notifications';
import { productsApi, reportsApi, suppliersApi, salesApi, stockApi, purchaseOrdersApi } from '../services/api';
import { useAuth } from './AuthContext';

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
    const [stats, setStats] = useState({
        totalStockValue: 0,
        dailySalesTotal: 0,
        totalSales: 0,
        averageSale: 0
    });

    // Fetch initial data from API
    const refreshData = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [prodRes, suppliersRes, valuationRes, salesRes] = await Promise.all([
                productsApi.getAll(),
                suppliersApi.getAll(),
                reportsApi.getValuation(),
                reportsApi.getSalesSummary()
            ]);

            setProducts(prodRes.data || []);
            setSuppliers(suppliersRes.data || []);
            setStats({
                totalStockValue: valuationRes.data?.total_inventory_value || 0,
                dailySalesTotal: salesRes.data?.total_revenue || 0,
                totalSales: salesRes.data?.total_sales || 0,
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
        const lowStock = activeProducts.filter(p => p.stock <= p.min_stock);
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
            throw error;
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

    const createPurchaseOrder = (po) => setPurchaseOrders(prev => [{ ...po, id: Date.now(), status: 'pending' }, ...prev]);
    const updatePurchaseOrderStatus = (id, status) => setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));
    const updateCartQty = (productId, qty) => setCart(prev => prev.map(item => item.id === productId ? { ...item, qty } : item));
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
            purchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus,
            stockMovements, createStockMovement, fetchProductMovements,
            locations, auditLogs, alerts, calculateGrossProfit,
            totalStockValue: stats.totalStockValue,
            dailySalesTotal: stats.dailySalesTotal,
            stats,
            isOnline: onlineStatus, loading, refreshData
        }}>
            {children}
        </InventoryContext.Provider>
    );
};
