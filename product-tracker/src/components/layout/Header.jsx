import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <header className="h-16 fixed top-0 right-0 left-0 md:left-20 bg-white/40 backdrop-blur-md border-b border-white/20 z-40 px-6 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 hover:bg-white/50 rounded-lg text-slate-600">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden md:flex items-center gap-2 text-slate-400 bg-white/50 px-3 py-1.5 rounded-full border border-white/40">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar general..."
                        className="bg-transparent border-none outline-none text-sm w-48 text-slate-600 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 relative hover:bg-white/50 rounded-full text-slate-600 transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </motion.button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 cursor-pointer"
                    >
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default Header;
