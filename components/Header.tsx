import React from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';

interface HeaderProps {
  // No props needed for now as search is moved
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-40 flex items-center justify-end px-4 lg:px-8 transition-all">
      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-none">管理员</p>
            <p className="text-xs text-slate-500 mt-1">设备部</p>
          </div>
        </div>
      </div>
    </header>
  );
};