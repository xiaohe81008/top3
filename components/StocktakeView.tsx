
import React, { useState, useMemo, useEffect } from 'react';
import { StocktakeOrder, StocktakeStatus, StocktakeItem, InventoryStatus, AttachmentCategory } from '../types';
import { MOCK_STOCKTAKE_ORDERS, INITIAL_INVENTORY } from '../constants';
import { Plus, Search, Calendar, ChevronRight, FileText, X, Save, AlertTriangle, CheckCircle, Package, ArrowLeft, Filter, ScanLine, Upload, FileSpreadsheet, PlusCircle, RefreshCw } from 'lucide-react';

export const StocktakeView: React.FC = () => {
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'EXECUTE' | 'DETAIL'>('LIST');
  const [orders, setOrders] = useState<StocktakeOrder[]>(MOCK_STOCKTAKE_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Creation Form State
  const [newOrderRegion, setNewOrderRegion] = useState('');
  const [newOrderStore, setNewOrderStore] = useState('');
  const [currentOrder, setCurrentOrder] = useState<StocktakeOrder | null>(null);

  // Execution State
  const [executeSearchTerm, setExecuteSearchTerm] = useState('');
  const [newSurplusItem, setNewSurplusItem] = useState<{name: string, code: string}>({ name: '', code: '' });

  // Derived Regions and Stores
  const uniqueRegions = useMemo(() => [...new Set(INITIAL_INVENTORY.map(i => i.region))], []);
  const availableStores = useMemo(() => {
    if (!newOrderRegion) return [];
    return [...new Set(INITIAL_INVENTORY.filter(i => i.region === newOrderRegion).map(i => i.store))];
  }, [newOrderRegion]);

  const handleStartStocktake = () => {
    if (!newOrderRegion || !newOrderStore) return;

    const inventoryInStore = INITIAL_INVENTORY.filter(i => i.store === newOrderStore);
    
    // Create snapshot items
    const newItems: StocktakeItem[] = inventoryInStore.map(item => ({
      inventoryId: item.id,
      batchCode: item.batchCode,
      attachmentName: item.attachmentName,
      category: item.category,
      storageLocation: item.storageLocation,
      systemStatus: item.status,
      actualStatus: item.status, // Default to system status initially
      isSurplus: false,
      verificationStatus: 'PENDING', // Initially pending
    }));

    const newOrder: StocktakeOrder = {
      id: `ST-${Date.now()}`,
      orderNumber: `ST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orders.length + 1}`,
      store: newOrderStore,
      region: newOrderRegion,
      status: StocktakeStatus.IN_PROGRESS,
      createDate: new Date().toISOString().split('T')[0],
      creator: '管理员',
      totalItems: inventoryInStore.length,
      abnormalItems: 0,
      items: newItems
    };

    setCurrentOrder(newOrder);
    setExecuteSearchTerm('');
    setMode('EXECUTE');
  };

  const handleFinishStocktake = () => {
    if (!currentOrder) return;
    
    // Calculate abnormalities (system != actual)
    // Note: Surplus items are always abnormalities in a sense (system was null, actual is something)
    const abnormalities = currentOrder.items.filter(i => 
        (i.systemStatus !== i.actualStatus) || i.isSurplus
    ).length;
    
    const completedOrder: StocktakeOrder = {
      ...currentOrder,
      status: StocktakeStatus.COMPLETED,
      finishDate: new Date().toISOString().split('T')[0],
      abnormalItems: abnormalities
    };

    setOrders([completedOrder, ...orders]);
    setMode('LIST');
    setNewOrderRegion('');
    setNewOrderStore('');
    setCurrentOrder(null);
  };

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentOrder && executeSearchTerm) {
        const term = executeSearchTerm.trim().toLowerCase();
        
        // Find item in current order
        const itemIndex = currentOrder.items.findIndex(
            i => i.batchCode.toLowerCase() === term || i.attachmentName.toLowerCase() === term
        );

        if (itemIndex >= 0) {
            // Found: Mark as Verified
            const updatedItems = [...currentOrder.items];
            updatedItems[itemIndex].verificationStatus = 'VERIFIED';
            // Default actual status to system status if not already changed? 
            // Usually scan implies presence, so it defaults to system status unless manually changed later.
            setCurrentOrder({ ...currentOrder, items: updatedItems });
            setExecuteSearchTerm(''); // Clear input
        } else {
            // Not found in system -> Prompt to add surplus?
            // For now, just clear and maybe show a toast (simulated)
            alert('系统未找到该资产，请在下方“盘盈登记”添加。');
        }
    }
  };

  const handleAddSurplus = () => {
    if (!currentOrder || !newSurplusItem.code || !newSurplusItem.name) return;
    
    const newItem: StocktakeItem = {
        batchCode: newSurplusItem.code,
        attachmentName: newSurplusItem.name,
        category: AttachmentCategory.FORK, // Default
        storageLocation: '未知',
        systemStatus: null,
        actualStatus: InventoryStatus.IN_STOCK,
        isSurplus: true,
        verificationStatus: 'VERIFIED'
    };

    setCurrentOrder({
        ...currentOrder,
        items: [...currentOrder.items, newItem]
    });
    setNewSurplusItem({ name: '', code: '' });
  };

  const toggleVerification = (index: number) => {
      if (!currentOrder) return;
      const updatedItems = [...currentOrder.items];
      const current = updatedItems[index].verificationStatus;
      updatedItems[index].verificationStatus = current === 'PENDING' ? 'VERIFIED' : 'PENDING';
      setCurrentOrder({ ...currentOrder, items: updatedItems });
  };

  const getStatusColor = (status: StocktakeStatus) => {
    switch (status) {
      case StocktakeStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case StocktakeStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-600';
      case StocktakeStatus.COMPLETED: return 'bg-green-100 text-green-600';
      case StocktakeStatus.CANCELLED: return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Render Functions
  const renderList = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">属具盘点</h2>
          <p className="text-slate-500 mt-1">管理和查看各仓库的属具盘点任务及历史记录。</p>
        </div>
        <button 
          onClick={() => setMode('CREATE')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>新建盘点单</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="搜索盘点单号、仓库..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">盘点单号</th>
                <th className="px-6 py-4 font-semibold">仓库 / 区域</th>
                <th className="px-6 py-4 font-semibold">状态</th>
                <th className="px-6 py-4 font-semibold">盘点数量</th>
                <th className="px-6 py-4 font-semibold">差异数</th>
                <th className="px-6 py-4 font-semibold">创建信息</th>
                <th className="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.filter(o => 
                o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                o.store.includes(searchTerm)
              ).map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{order.store}</div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block">{order.region}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{order.totalItems}</td>
                  <td className="px-6 py-4">
                    {order.abnormalItems > 0 ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle size={14} /> {order.abnormalItems}
                        </span>
                    ) : (
                        <span className="text-green-600 flex items-center gap-1">
                             <CheckCircle size={14} /> 无差异
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Calendar size={14} className="text-slate-400" />
                        {order.createDate}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 pl-6">by {order.creator}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => {
                            setCurrentOrder(order);
                            setMode('DETAIL');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">新建库存盘点</h3>
                <button onClick={() => setMode('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">选择区域</label>
                    <select 
                        className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={newOrderRegion}
                        onChange={(e) => {
                            setNewOrderRegion(e.target.value);
                            setNewOrderStore('');
                        }}
                    >
                        <option value="">请选择区域...</option>
                        {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">选择仓库/门店</label>
                    <select 
                        className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-slate-100"
                        value={newOrderStore}
                        onChange={(e) => setNewOrderStore(e.target.value)}
                        disabled={!newOrderRegion}
                    >
                        <option value="">请选择门店...</option>
                        {availableStores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {newOrderRegion && availableStores.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">该区域下暂无库存记录。</p>
                    )}
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-3 items-start mt-4">
                    <FileText size={20} className="flex-shrink-0 mt-0.5" />
                    <p>创建盘点单后，系统将锁定该仓库当前的库存快照。请确保线下实物已整理完毕。</p>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                <button 
                    onClick={() => setMode('LIST')}
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    取消
                </button>
                <button 
                    onClick={handleStartStocktake}
                    disabled={!newOrderStore}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    开始盘点
                </button>
            </div>
        </div>
    </div>
  );

  const renderDetail = () => {
    // Re-use logic for Detail view if needed, but for now focusing on Execute view
    return renderList(); // Placeholder, Detail view code exists in previous state if not overwritten
  };

  const renderExecute = () => {
    if (!currentOrder) return null;

    // Statistics
    const totalCount = currentOrder.items.filter(i => !i.isSurplus).length;
    const verifiedCount = currentOrder.items.filter(i => !i.isSurplus && i.verificationStatus === 'VERIFIED' && i.systemStatus === i.actualStatus && i.actualStatus !== InventoryStatus.LOSS).length;
    const pendingCount = currentOrder.items.filter(i => !i.isSurplus && i.verificationStatus === 'PENDING').length;
    const lossCount = currentOrder.items.filter(i => !i.isSurplus && i.actualStatus === InventoryStatus.LOSS).length;
    const surplusCount = currentOrder.items.filter(i => i.isSurplus).length;

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans">
            {/* 1. Header (Dark) */}
            <div className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-lg z-20 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-wide">属具资产盘点</h1>
                        <p className="text-xs text-slate-400">支持扫码枪录入、Excel/CSV导入核对</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">盘点日期</span>
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded border border-slate-700 text-sm">
                            {currentOrder.createDate}
                            <Calendar size={14} className="text-slate-400" />
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                             if(window.confirm('确定退出盘点吗？已扫描进度将保留。')) {
                                setMode('LIST');
                                setCurrentOrder(null);
                            }
                        }}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* 2. Sidebar */}
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
                    <div className="p-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">选择盘点仓库</label>
                        <div className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center justify-between cursor-not-allowed opacity-80">
                            {currentOrder.store}
                            <ChevronRight size={16} className="text-slate-400 rotate-90" />
                        </div>
                    </div>

                    <div className="px-6 pb-6 border-b border-slate-100">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                <span className="text-sm font-bold text-slate-700">盘点进度</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span className="text-sm font-medium text-slate-600">盘平 (Matched)</span>
                                    </div>
                                    <span className="font-bold text-green-600">{verifiedCount}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-600">待核对 (Pending)</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{pendingCount}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <X size={18} className="text-red-500" />
                                        <span className="text-sm font-medium text-slate-600">盘亏 (Loss)</span>
                                    </div>
                                    <span className="font-bold text-red-500">{lossCount}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Plus size={18} className="text-blue-500" />
                                        <span className="text-sm font-medium text-slate-600">盘盈 (Surplus)</span>
                                    </div>
                                    <span className="font-bold text-blue-500">{surplusCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1"></div>
                    <div className="p-4 text-xs text-slate-400 text-center">
                        EquipMaster Stocktake v1.0
                    </div>
                </div>

                {/* 3. Main Content */}
                <div className="flex-1 flex flex-col bg-slate-50 p-6 overflow-hidden">
                    {/* Top Input Bar */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ScanLine className="text-slate-400" size={20} />
                            </div>
                            <input 
                                type="text"
                                autoFocus
                                className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400"
                                placeholder="在此处扫码或输入序列号回车..."
                                value={executeSearchTerm}
                                onChange={(e) => setExecuteSearchTerm(e.target.value)}
                                onKeyDown={handleScan}
                            />
                        </div>
                        <button className="h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm whitespace-nowrap">
                            <Upload size={18} />
                            导入盘点单 (Excel/CSV)
                        </button>
                        <button className="h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm whitespace-nowrap">
                            <FileSpreadsheet size={18} />
                            模板
                        </button>
                    </div>

                    {/* List Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <Search size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-800">账面资产核对</h3>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-medium">应有 {totalCount} 项</span>
                    </div>

                    {/* List Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-auto custom-scrollbar flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase sticky top-0 z-10 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">资产序列号</th>
                                        <th className="px-6 py-4">类型</th>
                                        <th className="px-6 py-4">当前状态</th>
                                        <th className="px-6 py-4 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {currentOrder.items.map((item, idx) => {
                                        if (item.isSurplus) return null; // Show surplus separately or in this list? Screenshot suggests list is "Book Assets".
                                        
                                        // Filter if typing but not hitting enter yet (optional live filter)
                                        if (executeSearchTerm && 
                                            !item.batchCode.toLowerCase().includes(executeSearchTerm.toLowerCase()) && 
                                            !item.attachmentName.toLowerCase().includes(executeSearchTerm.toLowerCase())) {
                                            // return null; // Uncomment to live filter
                                        }

                                        const isVerified = item.verificationStatus === 'VERIFIED';

                                        return (
                                            <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isVerified ? 'bg-green-50/30' : ''}`}>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-800">
                                                    {item.batchCode}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                                                        {item.attachmentName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isVerified ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                                                            <CheckCircle size={12} className="text-slate-400" />
                                                            已核对
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                            待核对
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => toggleVerification(idx)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                                    >
                                                        切换状态
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {currentOrder.items.filter(i => !i.isSurplus).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">该仓库暂无账面数据</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                         {/* Surplus Section Footer */}
                        <div className="bg-blue-50/50 border-t border-blue-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Plus size={18} className="text-blue-600" />
                                <h3 className="font-bold text-slate-800">盘盈登记 (新增/异常资产)</h3>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">已扫描 {surplusCount} 项</span>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm whitespace-nowrap pt-2">
                                    手动添加:
                                </div>
                                <select 
                                    className="h-10 px-3 rounded border border-blue-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400 w-48"
                                    value={newSurplusItem.name}
                                    onChange={(e) => setNewSurplusItem({...newSurplusItem, name: e.target.value})}
                                >
                                    <option value="">选择属具类型...</option>
                                    <option value="重型纸卷夹">重型纸卷夹</option>
                                    <option value="侧移器">侧移器</option>
                                    <option value="软包夹">软包夹</option>
                                    <option value="加长货叉">加长货叉</option>
                                    <option value="其他">其他</option>
                                </select>
                                <input 
                                    type="text" 
                                    className="h-10 px-3 rounded border border-blue-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                    placeholder="输入序列号..."
                                    value={newSurplusItem.code}
                                    onChange={(e) => setNewSurplusItem({...newSurplusItem, code: e.target.value})}
                                />
                                <button 
                                    onClick={handleAddSurplus}
                                    className="h-10 px-6 bg-blue-200 text-blue-800 font-medium rounded hover:bg-blue-300 transition-colors text-sm"
                                >
                                    添加
                                </button>
                            </div>
                            
                            {/* Surplus List Preview */}
                            {surplusCount > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {currentOrder.items.filter(i => i.isSurplus).map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200">
                                            {item.attachmentName} - {item.batchCode}
                                            <button className="hover:bg-blue-200 rounded p-0.5"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Footer Actions Bar */}
            <div className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-20 flex-shrink-0">
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                             setNewOrderRegion('');
                             setNewOrderStore('');
                             // A reset logic here if needed
                        }}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        重置所有状态 (清空)
                    </button>
                    <p className="text-xs text-slate-400 w-48 leading-relaxed">
                        点击“重置”将所有资产状态恢复为“待核对”。
                    </p>
                </div>
                <div className="flex gap-4">
                    <button 
                         onClick={() => {
                             if(window.confirm('确定退出？')) setMode('LIST');
                         }}
                        className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleFinishStocktake}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-lg flex items-center gap-2"
                    >
                        <Save size={18} />
                        提交盘点结果
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full">
      {mode === 'LIST' && renderList()}
      {mode === 'DETAIL' && renderDetail()}
      {mode === 'CREATE' && (
        <>
            {renderList()} {/* Background */}
            {renderCreateModal()}
        </>
      )}
      {mode === 'EXECUTE' && renderExecute()}
    </div>
  );
};
