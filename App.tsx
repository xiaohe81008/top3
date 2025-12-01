
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatusBadge } from './components/StatusBadge';
import { Attachment, ViewState, AttachmentCategory, InventoryItem, InventoryHistoryRecord } from './types';
import { INITIAL_ATTACHMENTS, INITIAL_INVENTORY, MOCK_HISTORY_LOGS } from './constants';
import { AttachmentForm } from './components/AttachmentForm';
import { DetailView } from './components/DetailView';
import { InventoryView } from './components/InventoryView';
import { StocktakeView } from './components/StocktakeView';
import { TransferView } from './components/TransferView';
import { SeriesView } from './components/SeriesView';
import { Plus, Filter, ChevronRight, Search, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [attachments, setAttachments] = useState<Attachment[]>(INITIAL_ATTACHMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Lifted State for Inventory and History to share between InventoryView and TransferView
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [historyLogs, setHistoryLogs] = useState<InventoryHistoryRecord[]>(MOCK_HISTORY_LOGS);

  // Derived state
  const selectedAttachment = useMemo(() => 
    attachments.find(a => a.id === selectedId), 
  [attachments, selectedId]);

  const filteredAttachments = useMemo(() => {
    return attachments.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modelNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [attachments, searchTerm, filterCategory]);

  // Handlers
  const handleSave = (data: Omit<Attachment, 'id'>) => {
    if (view === 'EDIT' && selectedId) {
      setAttachments(prev => prev.map(item => 
        item.id === selectedId ? { ...data, id: selectedId } : item
      ));
    } else {
      const newId = `ATT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setAttachments(prev => [{ ...data, id: newId }, ...prev]);
    }
    setView('LIST');
    setSelectedId(null);
  };

  const handleDelete = () => {
    if (selectedId && window.confirm('确定要删除该属具记录吗？此操作不可恢复。')) {
      setAttachments(prev => prev.filter(a => a.id !== selectedId));
      setView('LIST');
      setSelectedId(null);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'SERIES':
        return <SeriesView />;
      case 'TRANSFER':
        return (
          <TransferView 
            inventoryItems={inventoryItems}
            setInventoryItems={setInventoryItems}
            historyLogs={historyLogs}
            setHistoryLogs={setHistoryLogs}
          />
        );
      case 'STOCKTAKE':
        return <StocktakeView />;
      case 'INVENTORY':
        return (
          <InventoryView 
            inventoryItems={inventoryItems}
            setInventoryItems={setInventoryItems}
            historyLogs={historyLogs}
            setHistoryLogs={setHistoryLogs}
          />
        );
      case 'CREATE':
        return (
          <AttachmentForm 
            onSave={handleSave} 
            onCancel={() => setView('LIST')} 
          />
        );
      case 'EDIT':
        return selectedAttachment ? (
          <AttachmentForm 
            initialData={selectedAttachment} 
            onSave={handleSave} 
            onCancel={() => {
                setView('DETAIL'); // Cancel edit goes back to detail
            }} 
          />
        ) : null;
      case 'DETAIL':
        return selectedAttachment ? (
          <DetailView 
            data={selectedAttachment}
            onBack={() => {
                setView('LIST');
                setSelectedId(null);
            }}
            onEdit={() => setView('EDIT')}
            onDelete={handleDelete}
          />
        ) : null;
      case 'LIST':
      default:
        return (
          <div className="space-y-6">
            {/* List Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side: Search and Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                            placeholder="搜索属具名称、型号或编号..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={16} className="text-slate-500" />
                        </div>
                        <select 
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto pl-10 pr-10 py-2.5 appearance-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="ALL">所有分类</option>
                            <option value={AttachmentCategory.FORK}>{AttachmentCategory.FORK}</option>
                            <option value={AttachmentCategory.CLAMP}>{AttachmentCategory.CLAMP}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Button */}
                <div>
                    <button 
                        onClick={() => setView('CREATE')}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        <span>新增属具</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="overflow-auto max-h-[calc(100vh-15rem)] custom-scrollbar">
                    <table className="w-full text-sm text-left text-slate-500 relative border-collapse">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">名称 / 编号</th>
                                <th scope="col" className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">分类 & 类型</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell whitespace-nowrap bg-slate-50">供应商 / 型号</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden lg:table-cell whitespace-nowrap bg-slate-50">规格</th>
                                <th scope="col" className="px-6 py-4 font-semibold whitespace-nowrap bg-slate-50">状态</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right whitespace-nowrap bg-slate-50">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAttachments.length > 0 ? (
                                filteredAttachments.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className="bg-white hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => {
                                            setSelectedId(item.id);
                                            setView('DETAIL');
                                        }}
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{item.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{item.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900">{item.subType}</div>
                                            <div className="text-xs text-slate-500">{item.category}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                             <div className="text-slate-900">{item.supplier}</div>
                                             <div className="text-xs text-slate-500 font-mono">{item.modelNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell max-w-xs truncate" title={item.specifications}>
                                            {item.specifications}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-600 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center">
                                            <Search size={48} className="text-slate-300 mb-4" />
                                            <p className="text-lg font-medium text-slate-600">未找到相关数据</p>
                                            <p className="text-sm">请尝试调整搜索关键词或筛选条件</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {/* Pagination (Mock) */}
                <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        显示 <span className="font-semibold text-slate-900">1</span> 到 <span className="font-semibold text-slate-900">{filteredAttachments.length}</span> 条，共 <span className="font-semibold text-slate-900">{filteredAttachments.length}</span> 条记录
                    </span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border border-slate-300 rounded text-slate-400 text-sm cursor-not-allowed">上一页</button>
                        <button disabled className="px-3 py-1 border border-slate-300 rounded text-slate-400 text-sm cursor-not-allowed">下一页</button>
                    </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentView={view} onViewChange={setView} />
      
      <div className="flex-1 flex flex-col lg:pl-64 transition-all">
        <Header />
        
        <main className="flex-1 p-4 lg:p-8 mt-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
