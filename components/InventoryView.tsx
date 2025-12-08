
import React, { useState, useMemo } from 'react';
import { InventoryItem, InventorySource, InventoryHistoryRecord, InventoryHistoryType, InventoryStatus } from '../types';
import { INITIAL_INVENTORY } from '../constants';
import { Search, Filter, ChevronDown, MapPin, Download, History, X, ArrowRightLeft, ClipboardCheck, PackagePlus, PackageMinus, Store, Wallet, Calculator, LogOut, Save, CheckSquare, Square, Ruler, FileText, MoreHorizontal } from 'lucide-react';

interface Props {
  inventoryItems: InventoryItem[];
  setInventoryItems: (items: InventoryItem[]) => void;
  historyLogs: InventoryHistoryRecord[];
  setHistoryLogs: (logs: InventoryHistoryRecord[]) => void;
}

export const InventoryView: React.FC<Props> = ({ 
  inventoryItems, 
  setInventoryItems, 
  historyLogs, 
  setHistoryLogs 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterStore, setFilterStore] = useState<string>('ALL');
  
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InventoryItem | null>(null);

  // Selection State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Outbound Modal State
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [outboundAssetId, setOutboundAssetId] = useState<string>('');
  const [outboundFormData, setOutboundFormData] = useState({
    type: 'RENT', // RENT, DISPOSE, TRANSFER
    date: new Date().toISOString().split('T')[0],
    target: '',
    remarks: ''
  });

  // Bulk Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    targetRegion: '',
    targetStore: '',
    date: new Date().toISOString().split('T')[0],
    settlementAmount: 0,
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
        item.factoryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // --- Selection Logic ---
  const toggleSelection = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredData.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredData.map(i => i.id));
    }
  };

  // --- Bulk Transfer Logic ---
  const selectedItemsForTransfer = useMemo(() => 
    inventoryItems.filter(i => selectedItemIds.includes(i.id)), 
  [inventoryItems, selectedItemIds]);

  const totalTransferNetValue = useMemo(() => 
    selectedItemsForTransfer.reduce((sum, item) => sum + item.netValue, 0),
  [selectedItemsForTransfer]);

  // Get distinct source stores
  const sourceStores = useMemo(() => 
    [...new Set(selectedItemsForTransfer.map(i => i.store))],
  [selectedItemsForTransfer]);

  // Unique Target Options (Mock list + filter out sources if needed)
  const allStores = useMemo(() => [...new Set(INITIAL_INVENTORY.map(i => i.store)), '新仓库A', '新仓库B'], []);

  const handleOpenTransferModal = () => {
    setTransferFormData({
        targetRegion: '',
        targetStore: '',
        date: new Date().toISOString().split('T')[0],
        settlementAmount: totalTransferNetValue, // Default to Net Value
        remarks: ''
    });
    setIsTransferModalOpen(true);
  };

  const handleSubmitTransfer = () => {
    if (!transferFormData.targetStore) return;

    // 1. Update Items
    const updatedItems = inventoryItems.map(item => {
        if (selectedItemIds.includes(item.id)) {
            return {
                ...item,
                status: InventoryStatus.IN_TRANSIT, // Mark as In Transit
            };
        }
        return item;
    });
    setInventoryItems(updatedItems);

    // 2. Create Logs
    const newLogs = selectedItemsForTransfer.map(item => ({
        id: `LOG-${Date.now()}-${item.id}`,
        inventoryId: item.id,
        type: InventoryHistoryType.TRANSFER,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        operator: '管理员',
        details: `批量调拨: 从 [${item.store}] 调拨至 [${transferFormData.targetStore}]。结算金额分摊: ¥${(transferFormData.settlementAmount / selectedItemsForTransfer.length).toFixed(2)}。`
    }));

    setHistoryLogs([...newLogs, ...historyLogs]);

    // 3. Reset
    setIsTransferModalOpen(false);
    setSelectedItemIds([]);
  };


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

  const getReferenceLabel = (type: InventoryHistoryType, source?: string) => {
      if (type === InventoryHistoryType.INBOUND) {
          return source === InventorySource.ATTACHED ? '设备编码' : '采购单号';
      }
      switch (type) {
          case InventoryHistoryType.OUTBOUND: return '业务单据';
          case InventoryHistoryType.TRANSFER: return '调拨单号';
          case InventoryHistoryType.STOCKTAKE: return '盘点单号';
          default: return '单据号';
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
            {selectedItemIds.length > 0 && (
                <button 
                    onClick={handleOpenTransferModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md shadow-indigo-500/20 animate-in fade-in slide-in-from-top-2"
                >
                    <ArrowRightLeft size={18} />
                    <span>批量调拨 ({selectedItemIds.length})</span>
                </button>
            )}
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
                placeholder="搜索批次码、原厂编码、属具名称..."
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
        <div className="overflow-auto max-h-[calc(100vh-22rem)] custom-scrollbar">
            <table className="w-full text-sm text-left text-slate-500 border-collapse">
                <thead className="text-xs text-slate-600 uppercase bg-slate-50/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20 shadow-sm font-bold tracking-wider">
                    <tr>
                        <th className="px-4 py-4 w-12 bg-slate-50 text-center sticky left-0 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] border-r border-slate-200">
                            <button onClick={toggleSelectAll} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                {selectedItemIds.length > 0 && selectedItemIds.length === filteredData.length ? (
                                    <CheckSquare size={18} className="text-blue-600" />
                                ) : (
                                    <Square size={18} />
                                )}
                            </button>
                        </th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[180px]">批次码 / 属具名称</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[120px]">原厂编码</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[150px]">规格参数</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[100px]">类目 / 来源</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[140px]">区域 / 门店</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[100px]">存放位置</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[90px]">状态</th>
                        <th className="px-4 py-4 font-semibold whitespace-nowrap min-w-[150px]">时间信息</th>
                        <th className="px-4 py-4 font-semibold text-right whitespace-nowrap min-w-[100px]">净值 (¥)</th>
                        <th className="px-4 py-4 font-semibold text-right whitespace-nowrap min-w-[100px]">日折旧 (¥)</th>
                        <th className="px-4 py-4 font-semibold text-right whitespace-nowrap min-w-[100px]">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                            <tr 
                                key={item.id} 
                                className={`transition-all duration-150 group ${selectedItemIds.includes(item.id) ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <td className="px-4 py-3 text-center sticky left-0 z-20 bg-inherit border-r border-slate-100 group-hover:border-slate-200" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => toggleSelection(item.id)} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                        {selectedItemIds.includes(item.id) ? (
                                            <CheckSquare size={18} className="text-blue-600" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-900 text-sm" title={item.attachmentName}>{item.attachmentName}</div>
                                    <div className="font-mono text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                        <span className="bg-slate-100 px-1 rounded text-[10px]">ID</span>
                                        {item.batchCode}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-mono text-xs text-slate-600">{item.factoryCode || '-'}</div>
                                </td>
                                <td className="px-4 py-3">
                                    {item.specifications ? (
                                        <div className="flex items-start gap-1 text-slate-700 max-w-[140px]" title={item.specifications}>
                                            <Ruler size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs truncate">{item.specifications}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 mb-1 border border-slate-200 whitespace-nowrap">
                                        {item.category}
                                    </span>
                                    <div className="text-xs text-slate-500">{item.source}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-slate-900 font-medium text-xs truncate max-w-[130px]" title={item.store}>{item.store}</div>
                                    <div className="mt-0.5">
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-px rounded border border-slate-200">{item.region}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 w-fit">
                                        <MapPin size={10} className="text-slate-400" />
                                        {item.storageLocation}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${getInventoryStatusStyle(item.status)}`}>
                                      {item.status}
                                   </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-slate-900 text-xs">持有 <span className="font-semibold">{item.holdingDays}</span> 天</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">入库: {item.firstInboundDate}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="font-bold text-slate-900 text-sm">{item.netValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600 text-xs">
                                    {item.dailyDepreciation.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button 
                                            onClick={() => setSelectedHistoryItem(item)}
                                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                                            title="查看履历"
                                        >
                                            <History size={15} />
                                        </button>
                                        <button 
                                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                                            title="更多操作"
                                        >
                                            <MoreHorizontal size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={12} className="px-6 py-12 text-center text-slate-400 bg-slate-50">
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
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">操作人: {log.operator}</span>
                            {log.referenceNumber && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-mono flex items-center gap-1">
                                    <FileText size={10} />
                                    {getReferenceLabel(log.type, selectedHistoryItem.source)}: {log.referenceNumber}
                                </span>
                            )}
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

      {/* Bulk Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">属具批量调拨</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            已选择 {selectedItemsForTransfer.length} 项资产
                        </p>
                    </div>
                    <button onClick={() => setIsTransferModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                     {/* 1. Header Config */}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">调出仓库 (来源)</label>
                            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium truncate">
                                {sourceStores.join(', ')}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">调拨日期</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                value={transferFormData.date}
                                onChange={(e) => setTransferFormData({...transferFormData, date: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">调入仓库 (目标)</label>
                             <div className="relative">
                                 <Store className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <select 
                                    className="w-full rounded-lg border-slate-300 border pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                                    value={transferFormData.targetStore}
                                    onChange={(e) => setTransferFormData({...transferFormData, targetStore: e.target.value})}
                                >
                                    <option value="">请选择调入仓库...</option>
                                    {allStores.filter(s => !sourceStores.includes(s)).map(store => (
                                        <option key={store} value={store}>{store}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                    </div>

                    {/* 2. Items List */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                            <span>调拨资产明细</span>
                            <span className="text-xs font-normal text-slate-500">总净值: ¥{totalTransferNetValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                        </h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">编号</th>
                                        <th className="px-3 py-2 font-medium">名称</th>
                                        <th className="px-3 py-2 font-medium">存放位置</th>
                                        <th className="px-3 py-2 font-medium text-right">净值</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedItemsForTransfer.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2 font-mono text-slate-600">{item.batchCode}</td>
                                            <td className="px-3 py-2 text-slate-800">{item.attachmentName}</td>
                                            <td className="px-3 py-2 text-slate-500">{item.storageLocation}</td>
                                            <td className="px-3 py-2 text-right font-medium text-slate-700">¥{item.netValue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     {/* 3. Financials */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                         <div className="flex items-center justify-between">
                             <label className="text-sm font-medium text-slate-700">当前总净值</label>
                             <span className="text-sm font-bold text-slate-900">¥ {totalTransferNetValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">本次调拨结算金额 (¥)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-right"
                                placeholder="请输入金额"
                                value={transferFormData.settlementAmount}
                                onChange={(e) => setTransferFormData({...transferFormData, settlementAmount: Number(e.target.value)})}
                            />
                            <p className="text-xs text-slate-500 mt-1">默认为资产当前账面净值，可根据实际调拨协议修改。</p>
                        </div>
                    </div>

                    {/* 4. Remarks */}
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                         <textarea
                            className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                            rows={2}
                            placeholder="填写调拨原因或物流单号..."
                            value={transferFormData.remarks}
                            onChange={(e) => setTransferFormData({...transferFormData, remarks: e.target.value})}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                    <button 
                        onClick={() => setIsTransferModalOpen(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSubmitTransfer}
                        disabled={!transferFormData.targetStore}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowRightLeft size={18} />
                        确认调拨
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
