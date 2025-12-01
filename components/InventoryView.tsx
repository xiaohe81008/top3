
import React, { useState, useMemo } from 'react';
import { InventoryItem, InventorySource, AttachmentCategory, InventoryHistoryRecord, InventoryHistoryType, InventoryStatus } from '../types';
import { INITIAL_INVENTORY, MOCK_HISTORY_LOGS } from '../constants';
import { Search, Filter, ChevronDown, MapPin, Download, History, X, Truck, ArrowRightLeft, ClipboardCheck, PackagePlus, PackageMinus, Store, Wallet, Calculator, LogOut, Save } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterStore, setFilterStore] = useState<string>('ALL');
  
  // Data State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [historyLogs, setHistoryLogs] = useState<InventoryHistoryRecord[]>(MOCK_HISTORY_LOGS);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InventoryItem | null>(null);

  // Outbound Modal State
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [outboundAssetId, setOutboundAssetId] = useState<string>('');
  const [outboundFormData, setOutboundFormData] = useState({
    type: 'RENT', // RENT, DISPOSE, TRANSFER
    date: new Date().toISOString().split('T')[0],
    target: '',
    remarks: ''
  });

  // Handle region change to reset store filter (Cascade behavior)
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRegion(e.target.value);
    setFilterStore('ALL');
  };

  const filteredData = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = 
        item.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.attachmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.store.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = filterSource === 'ALL' || item.source === filterSource;
      const matchesRegion = filterRegion === 'ALL' || item.region === filterRegion;
      const matchesStore = filterStore === 'ALL' || item.store === filterStore;
      
      return matchesSearch && matchesSource && matchesRegion && matchesStore;
    });
  }, [inventoryItems, searchTerm, filterSource, filterRegion, filterStore]);

  const uniqueRegions = useMemo(() => [...new Set(inventoryItems.map(i => i.region))], [inventoryItems]);

  // Derived available stores based on selected region
  const availableStores = useMemo(() => {
    const sourceData = filterRegion === 'ALL' 
        ? inventoryItems 
        : inventoryItems.filter(item => item.region === filterRegion);
    return [...new Set(sourceData.map(item => item.store))];
  }, [inventoryItems, filterRegion]);

  // Derived history logs for selected item
  const selectedHistoryLogs = useMemo(() => {
    if (!selectedHistoryItem) return [];
    return historyLogs.filter(log => log.inventoryId === selectedHistoryItem.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedHistoryItem, historyLogs]);

  // Summary Statistics
  const totalNetValue = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.netValue, 0), [filteredData]);
  
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    // Initialize all statuses with 0
    Object.values(InventoryStatus).forEach(s => stats[s] = 0);
    // Count occurrences
    filteredData.forEach(item => {
        if (stats[item.status] !== undefined) {
            stats[item.status]++;
        }
    });
    return stats;
  }, [filteredData]);


  const getHistoryIcon = (type: InventoryHistoryType) => {
    switch (type) {
      case InventoryHistoryType.INBOUND: return <PackagePlus size={16} />;
      case InventoryHistoryType.OUTBOUND: return <PackageMinus size={16} />;
      case InventoryHistoryType.TRANSFER: return <ArrowRightLeft size={16} />;
      case InventoryHistoryType.STOCKTAKE: return <ClipboardCheck size={16} />;
      default: return <History size={16} />;
    }
  };

  const getHistoryColor = (type: InventoryHistoryType) => {
    switch (type) {
      case InventoryHistoryType.INBOUND: return 'text-green-600 bg-green-100';
      case InventoryHistoryType.OUTBOUND: return 'text-red-600 bg-red-100';
      case InventoryHistoryType.TRANSFER: return 'text-blue-600 bg-blue-100';
      case InventoryHistoryType.STOCKTAKE: return 'text-orange-600 bg-orange-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getInventoryStatusStyle = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.IN_STOCK:
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case InventoryStatus.RENTED:
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case InventoryStatus.IN_TRANSIT:
        return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
      case InventoryStatus.LOSS:
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case InventoryStatus.DISPOSED:
        return 'bg-slate-100 text-slate-700 ring-slate-600/20';
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-500/20';
    }
  };
  
  // Helper for status summary card border colors
  const getStatusBorderColor = (status: string) => {
     switch (status) {
      case InventoryStatus.IN_STOCK: return 'border-green-200 bg-green-50';
      case InventoryStatus.RENTED: return 'border-blue-200 bg-blue-50';
      case InventoryStatus.IN_TRANSIT: return 'border-yellow-200 bg-yellow-50';
      case InventoryStatus.LOSS: return 'border-red-200 bg-red-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  // Outbound Handlers
  const handleOpenOutboundGlobal = () => {
    setOutboundAssetId('');
    setOutboundFormData({
        type: 'RENT',
        date: new Date().toISOString().split('T')[0],
        target: '',
        remarks: ''
    });
    setIsOutboundModalOpen(true);
  };

  const handleSubmitOutbound = () => {
    if(!outboundAssetId) return;
    const selectedItemForOutbound = inventoryItems.find(i => i.id === outboundAssetId);
    if (!selectedItemForOutbound) return;
    
    // 1. Determine new status
    let newStatus = selectedItemForOutbound.status;
    let historyType = InventoryHistoryType.OUTBOUND;
    let typeLabel = '租赁出库';
    
    if (outboundFormData.type === 'RENT') {
        newStatus = InventoryStatus.RENTED;
        typeLabel = '租赁出库';
    } else if (outboundFormData.type === 'DISPOSE') {
        newStatus = InventoryStatus.DISPOSED;
        typeLabel = '资产处置';
    } else if (outboundFormData.type === 'TRANSFER') {
        newStatus = InventoryStatus.IN_TRANSIT;
        historyType = InventoryHistoryType.TRANSFER;
        typeLabel = '调拨出库';
    }

    // 2. Update Item
    const updatedItems = inventoryItems.map(i => 
       i.id === selectedItemForOutbound.id ? { ...i, status: newStatus } : i
    );
    setInventoryItems(updatedItems);

    // 3. Add Log
    const newLog: InventoryHistoryRecord = {
       id: `LOG-${Date.now()}`,
       inventoryId: selectedItemForOutbound.id,
       type: historyType,
       date: new Date().toISOString().replace('T', ' ').slice(0, 16),
       operator: '管理员', // Hardcoded for prototype
       details: `办理出库: ${typeLabel}。去向/接收方: ${outboundFormData.target}。${outboundFormData.remarks ? `备注: ${outboundFormData.remarks}` : ''}`
    };
    setHistoryLogs([newLog, ...historyLogs]);

    setIsOutboundModalOpen(false);
    setOutboundAssetId('');
  };

  // Prepare available assets for outbound (e.g., currently In Stock)
  // For prototype, let's allow all, but ideally filter by InventoryStatus.IN_STOCK
  const availableAssetsForOutbound = inventoryItems.filter(i => i.status === InventoryStatus.IN_STOCK);

  return (
    <div className="space-y-6 relative h-full">
       {/* Header & Title */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">属具库存管理</h2>
          <p className="text-slate-500 mt-1">实时监控全网属具库存状态、折旧及资产价值。</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleOpenOutboundGlobal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md shadow-blue-500/20"
            >
                <LogOut size={18} />
                <span>办理出库</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm">
                <Download size={18} />
                <span>导出报表</span>
            </button>
        </div>
      </div>

      {/* Summary Statistics - Moved to Top */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                {/* Left: Global Totals */}
                <div className="flex gap-8 items-center border-b xl:border-b-0 pb-4 xl:pb-0 border-slate-200 w-full xl:w-auto">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                             <Calculator size={20} />
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">总库存数</p>
                             <p className="text-xl font-bold text-slate-900">{filteredData.length} <span className="text-xs font-normal text-slate-400">件</span></p>
                         </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                             <Wallet size={20} />
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">总净值</p>
                             <p className="text-xl font-bold text-slate-900">¥ {totalNetValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
                         </div>
                    </div>
                </div>

                {/* Right: Status Breakdown */}
                <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-start xl:justify-end">
                     {Object.entries(statusStats).map(([status, count]) => (
                         <div key={status} className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border ${getStatusBorderColor(status)} min-w-[70px]`}>
                             <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">{status}</span>
                             <span className="text-lg font-bold text-slate-800 leading-none">{count}</span>
                         </div>
                     ))}
                </div>
            </div>
        </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                placeholder="搜索批次码、属具名称、门店..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Source Filter */}
        <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-slate-500" />
            </div>
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2.5 appearance-none cursor-pointer"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
            >
                <option value="ALL">来源: 全部</option>
                {Object.values(InventorySource).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
            </div>
        </div>

         {/* Region Filter */}
         <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-slate-500" />
            </div>
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2.5 appearance-none cursor-pointer"
                value={filterRegion}
                onChange={handleRegionChange}
            >
                <option value="ALL">区域: 全部</option>
                {uniqueRegions.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
            </div>
        </div>

        {/* Store Filter (Cascaded) */}
        <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store size={16} className="text-slate-500" />
            </div>
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2.5 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                disabled={availableStores.length === 0}
            >
                <option value="ALL">门店: 全部</option>
                {availableStores.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
            </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="overflow-auto max-h-[calc(100vh-28rem)] custom-scrollbar">
            <table className="w-full text-sm text-left text-slate-500 border-collapse">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">批次码 / 属具名称</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">类目 / 来源</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">区域 / 门店</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">存放位置</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">状态</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">时间信息</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap bg-slate-50">净值 (¥)</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap bg-slate-50">日折旧 (¥)</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap bg-slate-50">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-blue-600 mb-0.5">{item.batchCode}</div>
                                    <div className="font-medium text-slate-900">{item.attachmentName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 mb-1">
                                        {item.category}
                                    </span>
                                    <div className="text-xs text-slate-500">{item.source}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-900 font-medium">{item.store}</div>
                                    <div className="mt-1">
                                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{item.region}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1 w-fit">
                                        <MapPin size={10} className="text-orange-500" />
                                        {item.storageLocation}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${getInventoryStatusStyle(item.status)}`}>
                                      {item.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-900">持有 {item.holdingDays} 天</div>
                                    <div className="text-xs text-slate-500">入库: {item.firstInboundDate}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    {item.netValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-600">
                                    {item.dailyDepreciation.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setSelectedHistoryItem(item)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors text-xs font-medium inline-flex items-center gap-1"
                                        >
                                            <History size={14} />
                                            履历
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="px-6 py-12 text-center text-slate-400 bg-slate-50">
                                未找到符合条件的库存记录
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* History Side Drawer */}
      {selectedHistoryItem && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedHistoryItem(null)}
          ></div>
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">库存变更履历</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedHistoryItem.batchCode}</p>
                <p className="text-sm text-slate-600 font-medium">{selectedHistoryItem.attachmentName}</p>
              </div>
              <button 
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="relative border-l-2 border-slate-200 space-y-8 pl-6 ml-2">
                {selectedHistoryLogs.length > 0 ? (
                  selectedHistoryLogs.map((log, index) => (
                    <div key={log.id} className="relative group">
                       {/* Timeline Dot */}
                      <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getHistoryColor(log.type)} flex items-center justify-center`}>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${getHistoryColor(log.type)}`}>
                                {getHistoryIcon(log.type)}
                                {log.type}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{log.date}</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium mt-1">{log.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">操作人: {log.operator}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-8 text-slate-400">
                     <p>暂无变更记录</p>
                   </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button 
                onClick={() => setSelectedHistoryItem(null)}
                className="w-full py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}

      {/* Outbound Modal */}
      {isOutboundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">办理出库</h3>
                        <p className="text-xs text-slate-500 mt-1">请选择资产并填写出库信息</p>
                    </div>
                    <button onClick={() => setIsOutboundModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">选择资产</label>
                        <select 
                            className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={outboundAssetId}
                            onChange={(e) => setOutboundAssetId(e.target.value)}
                        >
                            <option value="">请选择库存资产...</option>
                            {availableAssetsForOutbound.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.batchCode} - {item.attachmentName} ({item.store})
                                </option>
                            ))}
                        </select>
                        {availableAssetsForOutbound.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">当前没有可出库的在库资产。</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">出库类型</label>
                        <select 
                            className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={outboundFormData.type}
                            onChange={(e) => setOutboundFormData({...outboundFormData, type: e.target.value})}
                        >
                            <option value="RENT">租赁出库 (标记为已出租)</option>
                            <option value="TRANSFER">调拨出库 (标记为在途)</option>
                            <option value="DISPOSE">资产处置 (标记为已处置)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">出库日期</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={outboundFormData.date}
                            onChange={(e) => setOutboundFormData({...outboundFormData, date: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">去向 / 接收方</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="例如：XX客户 / XX分公司"
                            value={outboundFormData.target}
                            onChange={(e) => setOutboundFormData({...outboundFormData, target: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">备注说明</label>
                        <textarea
                            className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows={3}
                            placeholder="填写出库相关说明..."
                            value={outboundFormData.remarks}
                            onChange={(e) => setOutboundFormData({...outboundFormData, remarks: e.target.value})}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                    <button 
                        onClick={() => setIsOutboundModalOpen(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSubmitOutbound}
                        disabled={!outboundFormData.target || !outboundAssetId}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        确认出库
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
