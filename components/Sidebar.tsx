
import React from 'react';
import { Package, Truck, LogOut, ClipboardList, ClipboardCheck, ArrowRightLeft } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  // Determine if a general category is active (e.g., LIST, DETAIL, CREATE, EDIT all belong to "Package" management)
  const isAttachmentActive = ['LIST', 'DETAIL', 'CREATE', 'EDIT'].includes(currentView);
  const isInventoryActive = currentView === 'INVENTORY';
  const isStocktakeActive = currentView === 'STOCKTAKE';
  const isTransferActive = currentView === 'TRANSFER';

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">EquipMaster</h1>
          <p className="text-xs text-slate-400">属具资产管理</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavItem 
          icon={<Package size={20} />} 
          label="属具管理" 
          active={isAttachmentActive} 
          onClick={() => onViewChange('LIST')}
        />
        <NavItem 
          icon={<ClipboardList size={20} />} 
          label="属具库存" 
          active={isInventoryActive} 
          onClick={() => onViewChange('INVENTORY')}
        />
        <NavItem 
          icon={<ArrowRightLeft size={20} />} 
          label="属具调拨" 
          active={isTransferActive} 
          onClick={() => onViewChange('TRANSFER')}
        />
        <NavItem 
          icon={<ClipboardCheck size={20} />} 
          label="属具盘点" 
          active={isStocktakeActive} 
          onClick={() => onViewChange('STOCKTAKE')}
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors w-full">
          <LogOut size={18} />
          <span className="text-sm font-medium">退出登录</span>
        </button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3 w-full rounded-md text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
