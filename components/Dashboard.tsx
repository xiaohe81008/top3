
import React, { useMemo } from 'react';
import { InventoryItem, StocktakeStatus, TransferStatus, InventoryStatus, InventoryHistoryRecord, InventoryHistoryType, ViewState } from '../types';
import { MOCK_STOCKTAKE_ORDERS, MOCK_TRANSFER_ORDERS, INITIAL_INVENTORY, MOCK_HISTORY_LOGS } from '../constants';
import { Wallet, Package, AlertTriangle, ArrowRight, ArrowRightLeft, ClipboardCheck, Clock, TrendingUp, Truck, Box } from 'lucide-react';

interface Props {
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  // --- Statistics Calculation ---
  const totalAssets = INITIAL_INVENTORY.length;
  const totalValue = INITIAL_INVENTORY.reduce((sum, item) => sum + item.netValue, 0);
  const rentedAssets = INITIAL_INVENTORY.filter(i => i.status === InventoryStatus.RENTED).length;
  const utilizationRate = Math.round((rentedAssets / totalAssets) * 100);
  
  const pendingTransfers = MOCK_TRANSFER_ORDERS.filter(o => o.status === TransferStatus.IN_TRANSIT).length;
  const activeStocktakes = MOCK_STOCKTAKE_ORDERS.filter(o => o.status === StocktakeStatus.IN_PROGRESS).length;
  
  // Abnormal items count (Stocktake)
  const abnormalStocktakeItems = MOCK_STOCKTAKE_ORDERS.reduce((sum, order) => sum + order.abnormalItems, 0);

  // Recent Logs
  const recentLogs = [...MOCK_HISTORY_LOGS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getLogIcon = (type: InventoryHistoryType) => {
    switch (type) {
        case InventoryHistoryType.INBOUND: return <Box size={16} className="text-green-600" />;
        case InventoryHistoryType.OUTBOUND: return <Truck size={16} className="text-blue-600" />;
        case InventoryHistoryType.TRANSFER: return <ArrowRightLeft size={16} className="text-indigo-600" />;
        case InventoryHistoryType.STOCKTAKE: return <ClipboardCheck size={16} className="text-orange-600" />;
        default: return <Clock size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">工作台</h2>
        <p className="text-slate-500 mt-1">欢迎回来，这里是您的资产管理概览。</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('INVENTORY')}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">在册属具总数</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalAssets} <span className="text-sm font-normal text-slate-500">件</span></h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Package size={22} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+12 本月新增</span>
            </div>
        </div>

        {/* Total Value */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">资产总净值</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">¥ {(totalValue / 10000).toFixed(2)} <span className="text-sm font-normal text-slate-500">万</span></h3>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Wallet size={22} />
                </div>
            </div>
             <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-slate-400">日折旧: ¥ 245.00</span>
            </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">待办任务</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingTransfers + activeStocktakes}</h3>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Clock size={22} />
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
                {pendingTransfers > 0 && (
                    <span onClick={() => onNavigate('TRANSFER')} className="text-blue-600 cursor-pointer hover:underline">{pendingTransfers} 笔调拨待收货</span>
                )}
                {activeStocktakes > 0 && (
                    <span onClick={() => onNavigate('STOCKTAKE')} className="text-orange-600 cursor-pointer hover:underline">{activeStocktakes} 个盘点进行中</span>
                )}
                {pendingTransfers === 0 && activeStocktakes === 0 && (
                    <span className="text-slate-400">暂无紧急待办</span>
                )}
            </div>
        </div>

        {/* Utilization */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">出租率</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{utilizationRate}%</h3>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <TrendingUp size={22} />
                </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${utilizationRate}%` }}></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">快捷操作</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => onNavigate('CREATE')} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex flex-col items-center gap-2 text-center group">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">新增属具</span>
                    </button>
                    <button onClick={() => onNavigate('INVENTORY')} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex flex-col items-center gap-2 text-center group">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRightLeft size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">库存调拨</span>
                    </button>
                    <button onClick={() => onNavigate('STOCKTAKE')} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex flex-col items-center gap-2 text-center group">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ClipboardCheck size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">发起盘点</span>
                    </button>
                    <button onClick={() => onNavigate('INVENTORY')} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex flex-col items-center gap-2 text-center group">
                         <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Wallet size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">资产盘盈</span>
                    </button>
                </div>
            </div>

            {/* Regional Distribution (Mock Visual) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6">区域库存分布</h3>
                <div className="space-y-4">
                    {[
                        { region: '华东区', count: 45, color: 'bg-blue-500' },
                        { region: '华北区', count: 28, color: 'bg-indigo-500' },
                        { region: '华南区', count: 22, color: 'bg-cyan-500' },
                        { region: '华西区', count: 12, color: 'bg-teal-500' },
                    ].map(item => (
                        <div key={item.region}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-700 font-medium">{item.region}</span>
                                <span className="text-slate-500">{item.count} 件</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / 107) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">最近动态</h3>
                    <button onClick={() => onNavigate('INVENTORY')} className="text-xs text-blue-600 hover:underline">查看全部</button>
                </div>
                <div className="space-y-6">
                    {recentLogs.map(log => (
                        <div key={log.id} className="flex gap-3 relative">
                            {/* Vertical line connecting logs */}
                            <div className="absolute left-[15px] top-6 bottom-[-24px] w-px bg-slate-100 last:hidden"></div>
                            
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 z-10">
                                {getLogIcon(log.type)}
                            </div>
                            <div>
                                <p className="text-sm text-slate-800 leading-snug">{log.details}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">{log.date.split(' ')[0]}</span>
                                    <span className="text-xs text-slate-400">·</span>
                                    <span className="text-xs text-slate-500">{log.operator}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Abnormal Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    需关注项
                 </h3>
                 <div className="space-y-3">
                    {abnormalStocktakeItems > 0 ? (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-red-800">盘点差异</p>
                                <p className="text-xs text-red-600 mt-0.5">发现 {abnormalStocktakeItems} 项库存数量或状态异常，请及时复核。</p>
                                <button onClick={() => onNavigate('STOCKTAKE')} className="text-xs font-bold text-red-700 mt-2 hover:underline flex items-center gap-1">
                                    前往处理 <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="p-4 text-center text-slate-400 text-sm">
                            一切正常，暂无异常警报。
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
