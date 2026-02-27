import React, { useState, useEffect } from 'react';
import {
    User, Palette, AlertTriangle, Save, Sun, Moon, MapPin,
    Building2, Receipt, Download, Globe, Lock, Unlock,
    ShieldCheck, Eye, EyeOff, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useInventory } from '../context/InventoryContext';

const Settings = () => {
    const { user, login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showNotification } = useNotification();

    // --- Security Vault State ---
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [passwordVerify, setPasswordVerify] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'reveal', 'saveBusiness', 'saveTaxes'
    const [revealTimer, setRevealTimer] = useState(null);

    // --- Persistence Logic ---
    const [businessData, setBusinessData] = useState(() => {
        const saved = localStorage.getItem('businessProfile');
        return saved ? JSON.parse(saved) : {
            name: 'Elite Store',
            nit: '000.000.000-0',
            address: 'Calle 10 #12-34, Medellín',
            phone: '+57 300 000 0000'
        };
    });

    const [taxData, setTaxData] = useState(() => {
        const saved = localStorage.getItem('taxConfig');
        return saved ? JSON.parse(saved) : {
            iva: 19,
            currency: 'COP'
        };
    });

    // --- Inactivity & Tab Auto-Lock ---
    useEffect(() => {
        let inactivityTimer;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            if (isVaultUnlocked) {
                inactivityTimer = setTimeout(() => {
                    handleLockVault();
                    showNotification('Bóveda bloqueada por inactividad', 'info');
                }, 120000); // 2 minutes
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && isVaultUnlocked) {
                handleLockVault();
            }
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(inactivityTimer);
        };
    }, [isVaultUnlocked]);

    // --- 60s Reveal Expiration ---
    useEffect(() => {
        let countdown;
        if (isVaultUnlocked) {
            setRevealTimer(60);
            countdown = setInterval(() => {
                setRevealTimer((prev) => {
                    if (prev <= 1) {
                        handleLockVault();
                        showNotification('Sesión de alta seguridad expirada (60s)', 'warning');
                        clearInterval(countdown);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setRevealTimer(null);
        }
        return () => clearInterval(countdown);
    }, [isVaultUnlocked]);

    const handleLockVault = () => {
        setIsVaultUnlocked(false);
        setPasswordVerify('');
    };

    const handleVerifyPassword = async (e) => {
        if (e) e.preventDefault();
        setIsVerifying(true);
        try {
            await login(user?.username, passwordVerify);
            setIsVaultUnlocked(true);
            setShowSecurityModal(false);
            setPasswordVerify('');

            if (pendingAction === 'saveBusiness') {
                performSaveBusiness();
            } else if (pendingAction === 'saveTaxes') {
                performSaveTaxes();
            }
        } catch (error) {
            showNotification('Contraseña incorrecta. Acceso denegado.', 'error');
        } finally {
            setIsVerifying(false);
            setPendingAction(null);
        }
    };

    const handleSaveBusiness = () => {
        if (!isVaultUnlocked) {
            setPendingAction('saveBusiness');
            setShowSecurityModal(true);
        } else {
            performSaveBusiness();
        }
    };

    const performSaveBusiness = () => {
        localStorage.setItem('businessProfile', JSON.stringify(businessData));
        localStorage.setItem('appName', businessData.name);
        showNotification('Perfil de negocio actualizado correctamente', 'success');
        window.dispatchEvent(new Event('businessProfileUpdated'));
    };

    const handleSaveTaxes = () => {
        if (!isVaultUnlocked) {
            setPendingAction('saveTaxes');
            setShowSecurityModal(true);
        } else {
            performSaveTaxes();
        }
    };

    const performSaveTaxes = () => {
        localStorage.setItem('taxConfig', JSON.stringify(taxData));
        showNotification('Configuración tributaria guardada', 'success');
    };

    const { products } = useInventory();

    const handleExportInventory = () => {
        if (!products || products.length === 0) {
            showNotification('No hay productos para exportar', 'warning');
            return;
        }

        const headers = ['Nombre', 'Referencia (SKU)', 'Stock', 'Precio'];
        const rows = products.map(p => [
            p.name,
            p.sku,
            p.stock,
            p.price_sale
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventario_${businessData.name.toLowerCase().replace(/\s/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Inventario exportado correctamente', 'success');
    };

    const sectionClass = 'glass-card rounded-3xl p-8 border border-emerald-100/20 dark:border-emerald-500/10 shadow-2xl overflow-hidden transition-all duration-500';
    const inputClass = 'w-full px-5 py-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-emerald-800/20 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700 dark:text-slate-200 font-medium';

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                        Elite <span className="text-emerald-500">Shield</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Centro de Seguridad y Operaciones Avanzadas
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isVaultUnlocked ? (
                        <div key="timer-active" className="flex flex-col items-end">
                            <span key="timer-label" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Revelado Expirará en</span>
                            <span key="timer-value" className="text-lg font-mono font-black text-emerald-500">{revealTimer}s</span>
                        </div>
                    ) : (
                        <div key="timer-inactive" className="hidden" />
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (isVaultUnlocked) {
                                handleLockVault();
                                showNotification('Bóveda bloqueada manualmente', 'info');
                            } else {
                                setPendingAction('reveal');
                                setShowSecurityModal(true);
                            }
                        }}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 font-black text-xs tracking-widest shadow-lg ${isVaultUnlocked
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'}`}
                    >
                        {isVaultUnlocked ? (
                            <React.Fragment key="btn-unlocked">
                                <Unlock key="icon-unlock" size={18} />
                                <span key="text-unlock">BLOQUEAR BÓVEDA</span>
                            </React.Fragment>
                        ) : (
                            <React.Fragment key="btn-locked">
                                <Lock key="icon-lock" size={18} />
                                <span key="text-lock">ABRIR SECURITY VAULT</span>
                            </React.Fragment>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* ── Security Profile ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${sectionClass} relative ${isVaultUnlocked ? 'ring-2 ring-emerald-500/30 bg-white/80 dark:bg-slate-900/80' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl shadow-xl transition-all duration-500 ${isVaultUnlocked ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                    {isVaultUnlocked ? <ShieldCheck className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Información Sensible</h3>
                                    {isVaultUnlocked ? (
                                        <p key="label-unlocked" className="text-sm text-slate-500 font-bold uppercase tracking-wider">Acceso de Lectura/Escritura Habilitado</p>
                                    ) : (
                                        <p key="label-locked" className="text-sm text-slate-500 font-bold uppercase tracking-wider">Protección de Datos Nivel Militar</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario Operativo</p>
                                <div className="h-12 flex items-center overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {isVaultUnlocked ? (
                                            <motion.div
                                                key="vault-user-visible"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xl font-black text-slate-900 dark:text-white"
                                            >
                                                <span key="user-name-text">{user?.full_name}</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="vault-user-hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex gap-1"
                                            >
                                                {[1, 2, 3, 4, 5, 6].map(i => <div key={`dot-u-${i}`} className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Vinculado</p>
                                <div className="h-12 flex items-center overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {isVaultUnlocked ? (
                                            <motion.div
                                                key="vault-email-visible"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xl font-black text-slate-900 dark:text-white"
                                            >
                                                <span key="user-email-text">{user?.email}</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="vault-email-hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex gap-1"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={`dot-e-${i}`} className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Perfil de Negocio ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${sectionClass} ${isVaultUnlocked ? 'ring-2 ring-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-2xl shadow-xl transition-all ${isVaultUnlocked ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Estructura Corporativa</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Identidad Legal y Fiscal del Establecimiento</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            {isVaultUnlocked ? (
                                <React.Fragment key="vault-inputs-visible-fragment">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Razón Social</label>
                                        <div className="relative group">
                                            <input
                                                key="input-biz-name-unlocked"
                                                type="text"
                                                value={businessData.name}
                                                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                                                className={inputClass}
                                                placeholder="Nombre del Negocio"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIT / Identificación Fiscal</label>
                                        <div className="relative">
                                            <input
                                                key="input-biz-nit-unlocked"
                                                type="text"
                                                value={businessData.nit}
                                                onChange={(e) => setBusinessData({ ...businessData, nit: e.target.value })}
                                                className={inputClass}
                                                placeholder="NIT / Tax ID"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sede Principal / Dirección</label>
                                        <div className="relative">
                                            <input
                                                key="input-biz-address-unlocked"
                                                type="text"
                                                value={businessData.address}
                                                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                                                className={inputClass}
                                                placeholder="Ubicación Física"
                                            />
                                        </div>
                                    </div>
                                </React.Fragment>
                            ) : (
                                <React.Fragment key="vault-inputs-hidden-fragment">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Razón Social</label>
                                        <div className="relative group">
                                            <div className={`${inputClass} bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-between`}>
                                                <span key="mask-biz-name" className="text-slate-400">••••••••••••••••</span>
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIT / Identificación Fiscal</label>
                                        <div className="relative">
                                            <div className={`${inputClass} bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-between`}>
                                                <span key="mask-biz-nit" className="text-slate-400">•••.•••.•••-•</span>
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sede Principal / Dirección</label>
                                        <div className="relative">
                                            <div className={`${inputClass} bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-between`}>
                                                <span key="mask-biz-address" className="text-slate-400">••••••••••••••••••••••••••••</span>
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )}
                        </div>

                        <div className="mt-10 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveBusiness}
                                className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black transition-all shadow-xl ${isVaultUnlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                <Save className="w-5 h-5" />
                                {isVaultUnlocked ? 'COMMIT CHANGES' : 'VERIFICAR PARA EDITAR'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* ── Gestión Tributaria ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${sectionClass} ${isVaultUnlocked ? 'ring-2 ring-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-2xl shadow-xl transition-all ${isVaultUnlocked ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Finanzas y Taxes</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Control de Impuestos y Moneda de Operación</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impuesto Directo (IVA)</label>
                                    <span className="text-lg font-black text-emerald-600">{isVaultUnlocked ? `${taxData.iva}%` : '••%'}</span>
                                </div>
                                <div className="relative px-2">
                                    <input
                                        type="range" min="0" max="30" step="1"
                                        disabled={!isVaultUnlocked}
                                        value={taxData.iva}
                                        onChange={(e) => setTaxData({ ...taxData, iva: parseInt(e.target.value) })}
                                        className={`w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all ${!isVaultUnlocked && 'opacity-20 cursor-not-allowed'}`}
                                    />
                                    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                        <span>Exento (0%)</span>
                                        <span>Estándar (15%)</span>
                                        <span>Máximo (30%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divisa de Referencia</label>
                                    <div className="relative">
                                        <select
                                            disabled={!isVaultUnlocked}
                                            value={taxData.currency}
                                            onChange={(e) => setTaxData({ ...taxData, currency: e.target.value })}
                                            className={`${inputClass} ${!isVaultUnlocked && 'bg-slate-100/50 text-transparent select-none'}`}
                                        >
                                            <option value="COP">Peso Colombiano (COP)</option>
                                            <option value="USD">Dólar Americano (USD)</option>
                                            <option value="MXN">Peso Mexicano (MXN)</option>
                                        </select>
                                        {!isVaultUnlocked && <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <motion.button
                                whileHover={{ scale: isVaultUnlocked ? 1.02 : 1 }}
                                whileTap={{ scale: isVaultUnlocked ? 0.98 : 1 }}
                                onClick={handleSaveTaxes}
                                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl ${isVaultUnlocked ? 'bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                            >
                                <Save className="w-5 h-5" />
                                {isVaultUnlocked ? 'SAVE TAX CONFIG' : 'LOCKED'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    {/* ── Export Center ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${sectionClass} ${isVaultUnlocked ? 'ring-2 ring-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-90'}`}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-2xl shadow-xl transition-all ${isVaultUnlocked ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Download className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Hub</h3>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleExportInventory}
                                disabled={!isVaultUnlocked}
                                className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 group ${isVaultUnlocked ? 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800/50 border-transparent grayscale cursor-not-allowed opacity-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-sm">Full Inventory</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CSV Data Export</p>
                                    </div>
                                </div>
                                {isVaultUnlocked ? <Download size={20} className="text-slate-400 group-hover:text-emerald-500" /> : <Lock size={16} className="text-slate-500" />}
                            </button>

                            <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl opacity-40 grayscale flex items-center justify-between">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Sales Analytics</p>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter">Pro Feature Only</p>
                                    </div>
                                </div>
                                <Lock size={16} />
                            </div>
                        </div>
                    </motion.div>

                    {/* ── System Preferences ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={sectionClass}
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Visual Experience</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-emerald-500/10 shadow-inner group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white dark:bg-emerald-500/10 rounded-xl shadow-sm text-emerald-600 group-hover:rotate-12 transition-transform">
                                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 dark:text-slate-100">Dark Interface</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest">ELITE DARK MODE</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`w-14 h-7 rounded-full transition-all relative p-1 ${theme === 'dark' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Security Verification Modal */}
            <AnimatePresence>
                {showSecurityModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={() => !isVerifying && setShowSecurityModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-slate-100 dark:border-white/10"
                        >
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl w-fit mx-auto mb-6 text-emerald-600">
                                <Lock className="w-8 h-8" />
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Verificación de Identidad</h3>
                                <p className="text-slate-500 text-sm font-medium px-4">
                                    Introduce tu contraseña de administrador para {pendingAction === 'saveBusiness' || pendingAction === 'saveTaxes' ? 'confirmar los cambios' : 'revelar la bóveda'}.
                                </p>
                            </div>

                            <form onSubmit={handleVerifyPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={passwordVerify}
                                        onChange={(e) => setPasswordVerify(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center text-xl font-mono dark:text-white"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSecurityModal(false)}
                                        className="flex-1 py-4 px-6 rounded-2xl font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isVerifying || !passwordVerify}
                                        className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isVerifying ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                VERIFICAR
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
