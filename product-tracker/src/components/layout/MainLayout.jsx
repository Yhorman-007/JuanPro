import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="min-h-screen bg-transparent flex">
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            <div 
                className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
                style={{ marginLeft: isExpanded ? '16rem' : '5rem' }}
            >
                <Header />
            <main className="flex-1 p-8 lg:p-10 mt-16 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    <Outlet />
                </div>
            </main>
            </div>
        </div>
    );
};

export default MainLayout;
