
import React, { useState, useMemo } from 'react';
import { MOCK_REQUIREMENT_ORDERS } from '../constants';
import { RequirementStatus, RequirementOrder } from '../types';
import { Search, ChevronDown, CheckSquare, Square, Filter, RefreshCw, PlusCircle, XCircle, ChevronLeft, ChevronRight, FileText, Plus, X, User, MapPin, Calendar, Clipboard, Loader2, Settings, Battery, Zap, Ruler } from 'lucide-react';

export const RequirementView: React.FC = () => {
  const [orders, setOrders] = useState<RequirementOrder[]>(MOCK_REQUIREMENT_ORDERS);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ORDERED' | 'ALL'>('PENDING');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [creationOrder, setCreationOrder] = useState<RequirementOrder | null>(null);

  // Filters (Mock state)
  const [filters, setFilters] = useState({
    requestStore: '',
    applicant: '',
    status: RequirementStatus.APPROVED,
    dateRange: ''
  });

  const handleSelectAll = () => {
    if (selectedIds.length === MOCK_REQUIREMENT_ORDERS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MOCK_REQUIREMENT_ORDERS.map(o => o.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreateOrder = (order: RequirementOrder) => {
    setCreationOrder(order);
  };

  const handleSubmitOrder = (orderId: string, updatedConfig?: string) => {
      // Simulate API call and update local state
      const updatedOrders = orders.map(o => 
          o.id === orderId ? { ...o, status: RequirementStatus.ORDERED } : o
      );
      setOrders(updatedOrders);
      setCreationOrder(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      
      {/* 1. Header Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex gap-8 px-6 pt-2">
        <button 
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PENDING' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            待下单
        </button>
        <button 
            onClick={() => setActiveTab('ORDERED')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ORDERED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            已下单
        </button>
        <button 
            onClick={() => setActiveTab('ALL')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ALL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            全部
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mx-1 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
            <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
            <span className="text-slate-700 mr-2">采购申请单</span>
            <input type="text" className="bg-transparent outline-none w-20 text-slate-800 placeholder-slate-400" />
        </div>
        
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">申请门店</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">申请人</span>
        </div>

        <div className="flex items-center bg-blue-50 border border-blue-200 rounded px-2 py-1.5 cursor-pointer transition-colors group">
             <XCircle size={14} className="text-blue-500 mr-2 hover:text-red-500" />
             <span className="text-slate-500 mr-2">申请状态 |</span>
             <span className="text-blue-600 font-medium flex items-center">
                 审批通过 <ChevronDown size={14} className="ml-1" />
             </span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">申请时间</span>
        </div>

        <button className="text-blue-600 hover:text-blue-700 font-medium ml-2">清空</button>
        
        <div className="flex-1"></div>
        <div className="flex gap-2">
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><RefreshCw size={16} /></button>
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Filter size={16} /></button>
        </div>
      </div>

      {/* 3. Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col mx-1">
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3 w-12 text-center border-r border-slate-200">
                            <button onClick={handleSelectAll} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                {selectedIds.length > 0 && selectedIds.length === orders.length ? (
                                    <CheckSquare size={16} className="text-blue-600" />
                                ) : (
                                    <Square size={16} />
                                )}
                            </button>
                        </th>
                        <th className="px-4 py-3 w-16 whitespace-nowrap">序号</th>
                        <th className="px-4 py-3 whitespace-nowrap">采购申请</th>
                        <th className="px-4 py-3 whitespace-nowrap">申请数量</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">设备信息</th>
                        <th className="px-4 py-3 whitespace-nowrap">申请状态</th>
                        <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-100">
                            要求到货日期 <ChevronDown size={12} className="inline ml-1" />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">收货地</th>
                        <th className="px-4 py-3 whitespace-nowrap">申请门店</th>
                        <th className="px-4 py-3 whitespace-nowrap">收货门店</th>
                        <th className="px-4 py-3 whitespace-nowrap">收货仓库</th>
                        <th className="px-4 py-3 whitespace-nowrap bg-slate-50 sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-slate-200 text-center">
                            操作
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-center border-r border-slate-100">
                                <button onClick={() => handleSelectOne(item.id)} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                    {selectedIds.includes(item.id) ? (
                                        <CheckSquare size={16} className="text-blue-600" />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                </button>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                            <td className="px-4 py-3">
                                <a href="#" className="text-blue-600 hover:underline font-medium">{item.requestNumber}</a>
                            </td>
                            <td className="px-4 py-3 text-slate-800">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-800 truncate max-w-[250px]" title={item.equipmentInfo}>
                                {item.equipmentInfo}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    item.status === RequirementStatus.APPROVED ? 'bg-blue-50 text-blue-700' :
                                    item.status === RequirementStatus.ORDERED ? 'bg-green-50 text-green-700' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.requiredDate}</td>
                            <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={item.deliveryLocation}>
                                {item.deliveryLocation}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.requestStore}</td>
                            <td className="px-4 py-3 text-slate-600">{item.receiveStore}</td>
                            <td className="px-4 py-3 text-slate-600">{item.receiveWarehouse}</td>
                            <td className="px-4 py-3 sticky right-0 bg-white border-l border-slate-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.02)] text-center">
                                {item.status === RequirementStatus.APPROVED ? (
                                    <button 
                                        onClick={() => handleCreateOrder(item)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                                    >
                                        创建订单
                                    </button>
                                ) : (
                                    <span className="text-slate-400 text-xs cursor-default">查看订单</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-4 text-xs text-slate-500 bg-slate-50">
             <span>共 {orders.length} 条</span>
             <div className="flex items-center gap-2">
                 <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-white disabled:opacity-50 bg-white">
                     <ChevronLeft size={12} />
                 </button>
                 <button className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white border border-blue-600 rounded font-medium">1</button>
                 <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-white disabled:opacity-50 bg-white">
                     <ChevronRight size={12} />
                 </button>
             </div>
             <div className="flex items-center gap-2">
                <select className="border border-slate-300 rounded px-1 py-0.5 bg-white text-slate-600 outline-none h-6">
                    <option>50 条/页</option>
                    <option>100 条/页</option>
                </select>
                <span>前往</span>
                <input type="text" className="w-8 border border-slate-300 rounded px-1 py-0.5 text-center outline-none h-6 bg-white" defaultValue="1" />
                <span>页</span>
             </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {creationOrder && (
          <CreateOrderModal 
            order={creationOrder} 
            onClose={() => setCreationOrder(null)} 
            onSubmit={handleSubmitOrder}
          />
      )}
    </div>
  );
};

interface CreateOrderModalProps {
    order: RequirementOrder;
    onClose: () => void;
    onSubmit: (id: string, config: string) => void;
}

// Helper interface for structured configuration
interface StructuredConfig {
    model: string;
    battery: string;
    charger: string;
    legs: string;
    additionalOptions: string[];
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ order, onClose, onSubmit }) => {
    // Mocking specific detail fields not in the main table data for high fidelity
    const details = {
        applicant: '薛寓',
        applyTime: '2025-12-03 16:35:28',
        receiver: '林样照',
        projectName: '云邦物流济宁兖州电动搬运车租赁(3702042511036)',
        remarks: '--'
    };

    // Initialize structured configuration state
    const [configData, setConfigData] = useState<StructuredConfig>({
        model: '(17号) CBD30-461',
        battery: '24V300Ah',
        charger: '100A充电器',
        legs: '685*2200支腿',
        additionalOptions: [
            '加装踏板围挡',
            '充电口改在外侧',
            '电池盖板左侧储物桶改为夹子',
            '速度调低8公里/小时, 短手柄'
        ]
    });

    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [tempConfigData, setTempConfigData] = useState<StructuredConfig>(configData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to generate text representation
    const getConfigText = (data: StructuredConfig) => {
        const optionsText = data.additionalOptions.length > 0 
            ? `(${data.additionalOptions.map((opt, idx) => `${idx + 1}.${opt}`).join(' ')})`
            : '';
        return `${data.model}, ${data.battery}, ${data.charger}, ${data.legs} ${optionsText}`;
    };

    const handleEditConfig = () => {
        setTempConfigData({ ...configData });
        setIsEditingConfig(true);
    };

    const handleSaveConfig = () => {
        setConfigData(tempConfigData);
        setIsEditingConfig(false);
    };

    const handleCancelEditConfig = () => {
        setIsEditingConfig(false);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...tempConfigData.additionalOptions];
        newOptions[index] = value;
        setTempConfigData({ ...tempConfigData, additionalOptions: newOptions });
    };

    const handleAddOption = () => {
        setTempConfigData({ 
            ...tempConfigData, 
            additionalOptions: [...tempConfigData.additionalOptions, ''] 
        });
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = tempConfigData.additionalOptions.filter((_, i) => i !== index);
        setTempConfigData({ ...tempConfigData, additionalOptions: newOptions });
    };

    const handleSubmitClick = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(order.id, getConfigText(configData));
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Modal Header Area */}
                <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <Clipboard size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-900">采购申请 {order.requestNumber}</h2>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100 rounded">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">叉车-鲁豫区域/青岛叉车服务中心</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-y-2 gap-x-8 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-slate-400 mb-1">申请人:</span>
                            <span className="font-medium text-slate-800">{details.applicant}</span>
                        </div>
                        <div className="flex flex-col">
                             <span className="text-slate-400 mb-1">申请时间:</span>
                             <span className="font-medium text-slate-800">{details.applyTime}</span>
                        </div>
                         <div className="flex flex-col">
                             <span className="text-slate-400 mb-1">授权接车人:</span>
                             <span className="font-medium text-slate-800">{details.receiver}</span>
                        </div>
                         <div className="flex flex-col">
                             <span className="text-slate-400 mb-1">要求到货日期:</span>
                             <span className="font-medium text-slate-800">{order.requiredDate}</span>
                        </div>
                        <div className="flex flex-col md:col-span-2">
                             <span className="text-slate-400 mb-1">收货地址:</span>
                             <span className="font-medium text-slate-800">{order.deliveryLocation} <span className="bg-slate-200 px-1 rounded text-[10px] ml-1">项目名称</span></span>
                        </div>
                        <div className="flex flex-col md:col-span-1">
                             <span className="text-slate-400 mb-1">收货门店:</span>
                             <span className="font-medium text-slate-800">{order.receiveStore}</span>
                        </div>
                        <div className="flex flex-col md:col-span-3">
                             <span className="text-slate-400 mb-1">项目名称:</span>
                             <span className="font-medium text-slate-800">{details.projectName}</span>
                        </div>
                        <div className="flex flex-col">
                             <span className="text-slate-400 mb-1">备注:</span>
                             <span className="font-medium text-slate-800">{details.remarks}</span>
                        </div>
                    </div>
                </div>

                {/* Modal Body: Split Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar: Equipment List */}
                    <div className="w-64 border-r border-slate-200 flex flex-col bg-white">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 font-medium text-sm text-slate-700">
                            {order.equipmentInfo.split('-')[0] || '设备列表'}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {/* Selected Item */}
                            <div className="p-3 bg-blue-50 border-l-4 border-blue-600 cursor-pointer">
                                <div className="text-sm font-bold text-slate-800">电动托盘车 - 3000 kg</div>
                            </div>

                            {/* Inventory Status Section within Sidebar */}
                            <div className="mt-4 px-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                    <span>库存情况</span>
                                </div>
                                <div className="relative mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="请输入供应商" 
                                        className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={12} className="text-slate-400" />
                                            <span className="text-slate-700">力达</span>
                                        </div>
                                        <span className="text-slate-500">(22台)</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer bg-slate-100">
                                         <div className="flex items-center gap-2">
                                            <ChevronDown size={12} className="text-slate-600" />
                                            <span className="text-slate-900 font-medium">CBD30-461 (高速版)</span>
                                        </div>
                                        <span className="text-slate-600 font-medium">(22台)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Configuration */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6">
                        {/* Equipment Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">电动托盘车 - 3000 kg <span className="text-sm font-normal text-slate-500">(电动)</span></h3>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500">申请台量: </span>
                                <span className="font-bold text-slate-900">{order.quantity} 台</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            {!isEditingConfig ? (
                                <button 
                                    onClick={handleEditConfig}
                                    className="text-xs px-3 py-1 border border-blue-600 text-blue-600 rounded bg-white hover:bg-blue-50 transition-colors"
                                >
                                    修改配置
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSaveConfig}
                                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        保存配置
                                    </button>
                                    <button 
                                        onClick={handleCancelEditConfig}
                                        className="text-xs px-3 py-1 border border-slate-300 text-slate-600 rounded bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Config Details */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
                            {isEditingConfig ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                                <Settings size={14} /> 型号规格
                                            </label>
                                            <input 
                                                type="text"
                                                className="w-full text-sm border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                value={tempConfigData.model}
                                                onChange={(e) => setTempConfigData({...tempConfigData, model: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                                <Battery size={14} /> 电池参数
                                            </label>
                                            <input 
                                                type="text"
                                                className="w-full text-sm border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                value={tempConfigData.battery}
                                                onChange={(e) => setTempConfigData({...tempConfigData, battery: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                                <Zap size={14} /> 充电器
                                            </label>
                                            <input 
                                                type="text"
                                                className="w-full text-sm border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                value={tempConfigData.charger}
                                                onChange={(e) => setTempConfigData({...tempConfigData, charger: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                                <Ruler size={14} /> 支腿规格
                                            </label>
                                            <input 
                                                type="text"
                                                className="w-full text-sm border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                value={tempConfigData.legs}
                                                onChange={(e) => setTempConfigData({...tempConfigData, legs: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">加装项 / 改装要求</label>
                                            <button 
                                                onClick={handleAddOption}
                                                className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                <Plus size={12} /> 添加条目
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {tempConfigData.additionalOptions.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <span className="text-xs text-slate-400 font-mono w-4">{idx + 1}.</span>
                                                    <input 
                                                        type="text"
                                                        className="flex-1 text-sm border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                        placeholder="输入具体的配置说明..."
                                                    />
                                                    <button 
                                                        onClick={() => handleRemoveOption(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    <span className="font-bold text-slate-900 block mb-2">配置：</span>
                                    {getConfigText(configData)}
                                </p>
                            )}
                        </div>

                        {/* Add Device Area */}
                        <div className="border-2 border-dashed border-blue-200 rounded-lg h-40 flex items-center justify-center bg-blue-50/20 hover:bg-blue-50/50 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-2 text-blue-600 font-medium">
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                <span>添加采购设备</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSubmitClick}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                提交中...
                            </>
                        ) : (
                            '提交'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
