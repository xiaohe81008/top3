
import React, { useState, useMemo } from 'react';
import { MOCK_REQUIREMENT_ORDERS } from '../constants';
import { RequirementStatus, RequirementOrder } from '../types';
import { Search, ChevronDown, CheckSquare, Square, Filter, RefreshCw, PlusCircle, XCircle, ChevronLeft, ChevronRight, FileText, Plus, X, User, MapPin, Calendar, Clipboard, Loader2, Settings, Battery, Zap, Ruler, Copy, Inbox, Edit2, CheckCircle, Clock, Tag, CornerDownRight, Save } from 'lucide-react';

// --- Types for Config Modal ---
type ConfigOption = {
  label: string;
  value: string;
  subOptions?: ConfigOption[];
  subSelectionType?: 'single' | 'multi';
};

type ConfigGroup = {
  category: string;
  type: 'single' | 'multi';
  options: ConfigOption[];
};

interface ConfigEditModalProps {
  item: { id: string; name: string; config: string };
  onClose: () => void;
  onSave: (id: string, newConfig: string) => void;
}

// --- ConfigEditModal Component (Ported from ApprovalRecordView) ---
const ConfigEditModal: React.FC<ConfigEditModalProps> = ({ item, onClose, onSave }) => {
  const [configText, setConfigText] = useState(item.config);
  const [isSaving, setIsSaving] = useState(false);

  // Configuration definitions
  const configGroups: ConfigGroup[] = [
    {
      category: '门架 (单选)',
      type: 'single',
      options: [
        { label: '二节3米', value: '二节3米门架' },
        { label: '二节4米', value: '二节4米门架' },
        { label: '二节4.5米', value: '二节4.5米门架' },
        { label: '三节4.5米', value: '三节4.5米门架' },
        { label: '三节4.8米', value: '三节4.8米门架' }
      ]
    },
    {
      category: '电池 (单选)',
      type: 'single',
      options: [
        { label: '48V/450AH', value: '48V/450AH电池' },
        { label: '80V/500AH', value: '80V/500AH电池' },
        { label: '80V/450AH', value: '80V/450AH电池' },
        { label: '免维护', value: '免维护电池' }
      ]
    },
    {
      category: '轮胎 (单选)',
      type: 'single',
      options: [
        { label: '实心胎', value: '实心胎' },
        { label: '充气胎', value: '充气胎' },
        { label: '无痕', value: '无痕实心胎' }
      ]
    },
    {
      category: '属具 (多选)',
      type: 'multi',
      options: [
        { 
          label: '侧移器', 
          value: '侧移器',
          subSelectionType: 'single',
          subOptions: [
            { label: '1220mm', value: '1220mm' },
            { label: '1520mm', value: '1520mm' },
            { label: '1630mm', value: '1630mm' }
          ]
        },
        { 
          label: '调距叉', 
          value: '调距叉',
          subSelectionType: 'single',
          subOptions: [
            { label: '1070mm', value: '1070mm' },
            { label: '1150mm', value: '1150mm' }
          ]
        },
        { 
            label: '纸卷夹', 
            value: '纸卷夹',
            subOptions: [
                { label: '1300mm', value: '1300mm' },
                { label: '1500mm', value: '1500mm' }
            ]
        },
        { label: '软包夹', value: '软包夹' }
      ]
    }
  ];

  // Helper to safely remove text
  const removeText = (fullText: string, target: string) => {
    let newText = fullText.replace(target, '');
    // Clean up double separators
    newText = newText.replace(/([,，])\s*[,，]/g, '$1');
    // Clean up leading/trailing separators
    newText = newText.replace(/^\s*[,，]\s*/, '').replace(/\s*[,，]\s*$/, '');
    return newText;
  };

  // Helper to safely add text
  const addText = (fullText: string, target: string) => {
    const trimmed = fullText.trim();
    const separator = trimmed.length > 0 && !/[，,。;；.]$/.test(trimmed) ? '，' : '';
    return trimmed + separator + target;
  };

  const isSelected = (text: string) => configText.includes(text);

  const handleOptionClick = (group: ConfigGroup, option: ConfigOption) => {
    setConfigText(prev => {
      let newText = prev;

      // 1. Single Select Logic: Remove siblings
      if (group.type === 'single') {
        group.options.forEach(opt => {
          if (opt.value !== option.value && newText.includes(opt.value)) {
            newText = removeText(newText, opt.value);
          }
        });
      }

      // 2. Toggle Target
      if (newText.includes(option.value)) {
        // Removing
        newText = removeText(newText, option.value);
        // Also remove any of its sub-options if present
        if (option.subOptions) {
          option.subOptions.forEach(sub => {
            if (newText.includes(sub.value)) {
              newText = removeText(newText, sub.value);
            }
          });
        }
      } else {
        // Adding
        newText = addText(newText, option.value);
      }

      return newText;
    });
  };

  const handleSubOptionClick = (parentOption: ConfigOption, subOption: ConfigOption) => {
    setConfigText(prev => {
      let newText = prev;
      
      // If parent allows only single sub-option, remove siblings
      if (parentOption.subSelectionType === 'single' && parentOption.subOptions) {
         parentOption.subOptions.forEach(opt => {
             if (opt.value !== subOption.value && newText.includes(opt.value)) {
                 newText = removeText(newText, opt.value);
             }
         });
      }

      if (newText.includes(subOption.value)) {
        newText = removeText(newText, subOption.value);
      } else {
        newText = addText(newText, subOption.value);
      }
      return newText;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(item.id, configText);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transform transition-all scale-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-800">修改配置信息</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* Editor - Read Only Display */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">配置内容预览</label>
            </div>
            <div className="w-full h-32 p-4 border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed bg-slate-50 overflow-y-auto font-mono">
                {configText || <span className="text-slate-400">暂无配置内容...</span>}
            </div>
          </div>

          {/* Quick Select */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
              <Tag size={16} className="text-blue-500" />
              <span>快捷配置选项</span>
            </label>
            <div className="grid grid-cols-1 gap-4">
              {configGroups.map((group) => (
                <div key={group.category} className="flex flex-col border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <span className="text-xs font-bold text-slate-500 mt-2 w-20 flex-shrink-0">{group.category}</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {group.options.map((opt) => {
                        const active = isSelected(opt.value);
                        return (
                          <div key={opt.value} className="flex flex-col gap-1">
                            <button
                              onClick={() => handleOptionClick(group, opt)}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-200 ${
                                active
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                              }`}
                            >
                              {opt.label}
                            </button>
                            
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Expanded Sub-options Area */}
                  {group.type === 'multi' && group.options.some(opt => isSelected(opt.value) && opt.subOptions) && (
                      <div className="mt-2 ml-0 sm:ml-24 bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-3">
                          {group.options.map(opt => {
                              if (!isSelected(opt.value) || !opt.subOptions) return null;
                              return (
                                  <div key={opt.value + '-subs'} className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 w-20 flex-shrink-0">
                                         <CornerDownRight size={12} />
                                         {opt.label}参数:
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                          {opt.subOptions.map(sub => {
                                              const subActive = isSelected(sub.value);
                                              return (
                                                  <button
                                                      key={sub.value}
                                                      onClick={() => handleSubOptionClick(opt, sub)}
                                                      className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                                                          subActive
                                                          ? 'bg-blue-100 text-blue-700 border-blue-200 font-medium'
                                                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'
                                                      }`}
                                                  >
                                                      {sub.label}
                                                  </button>
                                              )
                                          })}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition-colors text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
                <>
                 <RefreshCw size={16} className="animate-spin" /> 保存中
                </>
            ) : (
                <>
                 <Save size={16} /> 保存配置
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RequirementView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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

  const handleOrderClick = (id: string) => {
      setSelectedOrderId(id);
      setViewMode('DETAIL');
  };

  const handleBackToList = () => {
      setViewMode('LIST');
      setSelectedOrderId(null);
  };

  // --- Detail View Renderer ---
  const renderDetail = () => {
      const order = orders.find(o => o.id === selectedOrderId);
      if (!order) return null;

      // Mock Data for Detail View to match the screenshot fields
      const detail = {
          applicant: '孙贤明',
          applyTime: '2025-12-09 15:15:37',
          region: '高机销售管理部',
          storeType: '合同项目场地',
          contractNumber: '5101022512026',
          receiver: '胡楚林',
          approvalTime: '2025-12-09 16:06:13',
          remarks: '--',
          // Equipment specific mocks
          items: [
              {
                  id: '1',
                  category: '高空作业设备',
                  series: '柴油越野剪叉',
                  keyParam: '平台高度:16米',
                  powerSource: '柴动',
                  quantity: order.quantity,
                  config: '--'
              }
          ]
      };

      const InfoItem = ({ label, value, fullWidth = false }: { label: string, value: string | React.ReactNode, fullWidth?: boolean }) => (
          <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-1 md:col-span-3' : ''}`}>
              <span className="text-slate-500 text-sm">{label}:</span>
              <span className="text-slate-900 font-medium text-sm break-words">{value}</span>
          </div>
      );

      return (
        <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 bg-slate-50 z-30 flex flex-col overflow-y-auto">
            {/* Header Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToList} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-slate-800 text-lg">需求单详情</span>
                </div>
            </div>

            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                 {/* Section: Basic Info */}
                 <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 relative">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="font-bold text-slate-900 text-lg">基本信息</h3>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm">
                            审批记录
                        </button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                        <InfoItem label="采购申请单号" value={order.requestNumber} />
                        <InfoItem label="申请人" value={detail.applicant} />
                        <InfoItem label="申请时间" value={detail.applyTime} />

                        <InfoItem label="所属区域" value={detail.region} />
                        <InfoItem label="采购门店" value="高米臂车服务中心" />
                        <InfoItem label="收货地类型" value={detail.storeType} />

                        <InfoItem label="收货门店" value="青白江服务中心" />
                        <InfoItem label="收货仓库" value="青白江仓" />
                        <InfoItem label="详细地址" value={order.deliveryLocation} /> {/* Assumed mapped */}

                        <InfoItem label="进场合同编号" value={detail.contractNumber} />
                        <InfoItem label="要求到货日期" value={order.requiredDate} />
                        <div className="hidden md:block"></div> {/* Spacer to match layout if needed, or let flow */}

                        <InfoItem label="申请状态" value={order.status} />
                        <InfoItem label="授权接车人" value={detail.receiver} />
                        <div className="hidden md:block"></div>

                        <InfoItem label="备注" value={detail.remarks} />
                        <InfoItem label="审批通过时间" value={detail.approvalTime} />
                    </div>
                 </div>

                 {/* Section: Equipment Info */}
                 <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-lg mb-6">设备信息</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-t border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 w-20">序号</th>
                                    <th className="px-6 py-4">设备类别</th>
                                    <th className="px-6 py-4">设备系列</th>
                                    <th className="px-6 py-4">关键参数</th>
                                    <th className="px-6 py-4">动力源</th>
                                    <th className="px-6 py-4">数量</th>
                                    <th className="px-6 py-4">配置要求</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {detail.items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                                        <td className="px-6 py-4 text-slate-800">{item.category}</td>
                                        <td className="px-6 py-4 text-slate-800">{item.series}</td>
                                        <td className="px-6 py-4 text-slate-800">{item.keyParam}</td>
                                        <td className="px-6 py-4 text-slate-800">{item.powerSource}</td>
                                        <td className="px-6 py-4 text-slate-800">{item.quantity}</td>
                                        <td className="px-6 py-4 text-slate-500">{item.config}</td>
                                    </tr>
                                ))}
                                {/* Adding a dummy row to show table structure if only 1 item */}
                                {detail.items.length === 1 && (
                                     <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">2</td>
                                        <td className="px-6 py-4 text-slate-800">高空作业设备</td>
                                        <td className="px-6 py-4 text-slate-800">柴油越野剪叉</td>
                                        <td className="px-6 py-4 text-slate-800">平台高度:16米</td>
                                        <td className="px-6 py-4 text-slate-800">柴动</td>
                                        <td className="px-6 py-4 text-slate-800">2</td>
                                        <td className="px-6 py-4 text-slate-500">--</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  const renderList = () => (
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
                                <button onClick={() => handleOrderClick(item.id)} className="text-blue-600 hover:underline font-medium text-left">
                                    {item.requestNumber}
                                </button>
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

  return viewMode === 'LIST' ? renderList() : renderDetail();
};

interface CreateOrderModalProps {
    order: RequirementOrder;
    onClose: () => void;
    onSubmit: (id: string, config: string) => void;
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

    // State for configuration text
    const [configText, setConfigText] = useState<string>(
        '(17号) CBD30-461, 24V300Ah, 100A充电器, 685*2200支腿 (1.加装踏板围挡 2.充电口改在外侧 3.电池盖板左侧储物桶改为夹子 4.速度调低8公里/小时, 短手柄)'
    );
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenConfigModal = () => {
        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = (id: string, newConfig: string) => {
        setConfigText(newConfig);
    };

    const handleSubmitClick = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(order.id, configText);
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
                            <button 
                                onClick={handleOpenConfigModal}
                                className="text-xs px-3 py-1 border border-blue-600 text-blue-600 rounded bg-white hover:bg-blue-50 transition-colors"
                            >
                                修改配置
                            </button>
                        </div>

                        {/* Config Details */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
                            <p className="text-sm text-slate-700 leading-relaxed font-mono">
                                <span className="font-bold text-slate-900 block mb-2 font-sans">配置：</span>
                                {configText}
                            </p>
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

            {/* Render Config Edit Modal */}
            {isConfigModalOpen && (
                <ConfigEditModal 
                    item={{
                        id: order.id,
                        name: '电动托盘车 - 3000 kg',
                        config: configText
                    }}
                    onClose={() => setIsConfigModalOpen(false)}
                    onSave={handleSaveConfig}
                />
            )}
        </div>
    );
}
