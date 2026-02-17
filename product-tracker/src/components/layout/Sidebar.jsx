import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, ShoppingBag, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Panel Principal', path: '/' },
        { icon: ShoppingCart, label: 'Punto de Venta', path: '/pos' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Users, label: 'Proveedores', path: '/suppliers' },
        { icon: ShoppingBag, label: 'Órdenes de Compra', path: '/purchase-orders' },
        { icon: FileText, label: 'Reportes', path: '/reports' },
        { icon: Settings, label: 'Configuración', path: '/settings' },
    ];

    return (
        <motion.aside
            initial={{ width: '5rem' }}
            animate={{ width: isExpanded ? '16rem' : '5rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onHoverStart={() => setIsExpanded(true)}
            onHoverEnd={() => setIsExpanded(false)}
            className="fixed left-0 top-0 h-screen glass border-r border-white/20 z-50 flex flex-col shadow-2xl overflow-hidden"
        >
            <div className="h-20 flex items-center justify-center border-b border-white/20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50" />
                <motion.div
                    animate={{ scale: isExpanded ? 1 : 0.8 }}
                    className="relative z-10 flex items-center gap-2"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
                        PT
                    </div>
                    {isExpanded && (
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                        >
                            ProdTrack
                        </motion.h1>
                    )}
                </motion.div>
            </div>

            <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                <ul className="space-y-2 px-3">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    clsx(
                                        'relative flex items-center px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden',
                                        isActive
                                            ? 'text-white shadow-lg shadow-primary/30'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl"
                                                initial={false}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <div className="relative z-10 flex items-center gap-4">
                                            <item.icon className={clsx("w-6 h-6 min-w-[24px]", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                                            {isExpanded && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="font-medium whitespace-nowrap"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-white/20">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 w-full px-3 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all group overflow-hidden"
                >
                    <LogOut className="w-6 h-6 min-w-[24px] group-hover:scale-110 transition-transform" />
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-medium whitespace-nowrap"
                        >
                            Cerrar Sesión
                        </motion.span>
                    )}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
