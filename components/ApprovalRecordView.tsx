
import React, { useState } from 'react';
import { MOCK_APPROVAL_RECORDS, MOCK_APPROVAL_DETAIL } from '../constants';
import { ChevronDown, PlusCircle, RefreshCw, Filter, ChevronLeft, ChevronRight, XCircle, Search, User, FileText, CheckCircle, Clock, MoreHorizontal, Printer, X, Inbox, Copy, Edit2, Settings, Tag, Save, CornerDownRight } from 'lucide-react';
import { ApprovalDetailItem } from '../types';

interface ConfigEditModalProps {
  item: ApprovalDetailItem;
  onClose: () => void;
  onSave: (id: string, newConfig: string) => void;
}

// Define types for the configuration structure
type ConfigOption = {
  label: string;
  value: string;
  subOptions?: ConfigOption[]; // For nested options like attachment specs
  subSelectionType?: 'single' | 'multi'; // Default to single for sub-options like dimensions
};

type ConfigGroup = {
  category: string;
  type: 'single' | 'multi';
  options: ConfigOption[];
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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

export const ApprovalRecordView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [activeTab, setActiveTab] = useState<'PROCESSING' | 'REJECTED' | 'COMPLETED' | 'FORWARDED'>('COMPLETED');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Modal State
  const [editingItem, setEditingItem] = useState<ApprovalDetailItem | null>(null);

  // Mock Detail Data (In real app, this would be fetched based on ID)
  // We keep a local state copy to support the mock edit functionality
  const [detailData, setDetailData] = useState(MOCK_APPROVAL_DETAIL);

  // Filter states
  const [filters, setFilters] = useState({
    businessType: '',
    businessNumber: '',
    status: '',
    approvalNumber: '',
    title: '',
    tenant: '',
    submitTime: ''
  });

  const filteredRecords = MOCK_APPROVAL_RECORDS; 

  const handleRecordClick = (id: string) => {
    setSelectedRecordId(id);
    setViewMode('DETAIL');
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setSelectedRecordId(null);
  };

  const handleOpenEdit = (item: ApprovalDetailItem) => {
    setEditingItem(item);
  };

  const handleSaveConfig = (id: string, newConfig: string) => {
    // Update the local mock data
    const updatedItems = detailData.items.map(item => 
        item.id === id ? { ...item, config: newConfig } : item
    );
    setDetailData({ ...detailData, items: updatedItems });
  };

  const renderList = () => (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      {/* 1. Header Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex gap-8 px-6 pt-2">
        {['审批中', '已驳回', '已完成', '转派记录'].map((tabLabel, index) => {
            const tabKey = ['PROCESSING', 'REJECTED', 'COMPLETED', 'FORWARDED'][index] as any;
            return (
                <button 
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tabKey ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    {tabLabel}
                </button>
            );
        })}
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mx-1 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1.5 cursor-pointer hover:border-blue-400 transition-colors group">
             <XCircle size={14} className="text-slate-400 mr-2 group-hover:text-red-500" />
             <span className="text-slate-500 mr-2">业务类型 |</span>
             <span className="text-blue-600 font-medium flex items-center">
                 设备采购申请 <ChevronDown size={14} className="ml-1" />
             </span>
        </div>
        {['业务单号', '状态', '审批单号', '审批标题', '租户', '提交时间', '更多'].map(label => (
            <div key={label} className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
                <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
                <span className="text-slate-700 mr-2">{label}</span>
            </div>
        ))}
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
                        <th className="px-4 py-3 w-16 whitespace-nowrap">序号</th>
                        <th className="px-4 py-3 whitespace-nowrap">审批标题</th>
                        <th className="px-4 py-3 whitespace-nowrap">审批单号</th>
                        <th className="px-4 py-3 whitespace-nowrap">业务类型</th>
                        <th className="px-4 py-3 whitespace-nowrap">业务单号</th>
                        <th className="px-4 py-3 whitespace-nowrap">状态</th>
                        <th className="px-4 py-3 whitespace-nowrap">租户</th>
                        <th className="px-4 py-3 whitespace-nowrap">提交人</th>
                        <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-100">
                            提交时间 <ChevronDown size={12} className="inline ml-1" />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-100">
                            开始审核时间 <ChevronDown size={12} className="inline ml-1" />
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                            <td className="px-4 py-3">
                                <button onClick={() => handleRecordClick(item.id)} className="text-blue-600 hover:underline text-left font-medium">
                                    {item.title}
                                </button>
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.approvalNumber}</td>
                            <td className="px-4 py-3 text-slate-700">{item.businessType}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.businessNumber}</td>
                            <td className="px-4 py-3 text-slate-700">{item.status}</td>
                            <td className="px-4 py-3 text-slate-600">{item.tenant}</td>
                            <td className="px-4 py-3 text-slate-700">{item.submitter}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.submitTime}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.startTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-4 text-xs text-slate-500 bg-slate-50">
             <span>共 {filteredRecords.length} 条</span>
             <div className="flex items-center gap-2">
                 <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-white disabled:opacity-50 bg-white">
                     <ChevronLeft size={12} />
                 </button>
                 <button className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white border border-blue-600 rounded font-medium">1</button>
                 <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-white disabled:opacity-50 bg-white">
                     <ChevronRight size={12} />
                 </button>
             </div>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    // Use state data to reflect updates
    const detail = detailData; 
    
    return (
        <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 bg-slate-50 z-30 flex flex-col">
            {/* Header Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToList} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                             <User size={16} className="text-slate-400" />
                            <span className="font-bold text-slate-800 text-sm">{detail.submitter}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 text-sm font-mono">{detail.submitTime}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100">
                        <FileText size={14} /> 
                        <span className="font-mono">{detail.printId}</span>
                        <Copy size={12} className="ml-1" />
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Scrollable Detail Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    
                    {/* Section: Application Info */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">申请信息</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs">收货地:</span>
                                <span className="text-slate-800 font-medium break-words">{detail.deliveryLocation}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs">收货仓库:</span>
                                <span className="text-slate-800 font-medium break-words">{detail.receiveWarehouse}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs">总数:</span>
                                <span className="text-slate-800 font-medium">{detail.totalCount}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs">要求到货日期:</span>
                                <span className="text-slate-800 font-medium">{detail.requiredDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Items List */}
                    {detail.items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden group hover:border-blue-200 transition-colors">
                             <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                                        <span className="text-slate-500 text-sm">(申请{item.quantity}台)</span>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="text-blue-600 border border-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-1"
                                    >
                                        <Edit2 size={12} />
                                        修改配置
                                    </button>
                                </div>
                                <div className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-3 rounded border border-slate-100">
                                    <span className="text-slate-400 font-bold mr-2">配置:</span>
                                    {item.config}
                                </div>

                                {/* Stock Info Split View */}
                                <div className="flex flex-col md:flex-row border-t border-slate-100 pt-6 gap-6">
                                    <div className="flex-1 md:border-r border-slate-100 md:pr-6">
                                        <h5 className="font-bold text-slate-700 text-sm mb-4">附近门店</h5>
                                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                            <Inbox size={32} strokeWidth={1.5} />
                                            <span className="text-xs">暂无附近门店数据</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 md:pl-2">
                                         <h5 className="font-bold text-slate-700 text-sm mb-4">待租/总库存</h5>
                                          <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                             <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
                                             <span className="text-xs">数据加载中...</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Right: Fixed Timeline Sidebar */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] hidden lg:flex">
                    <div className="flex border-b border-slate-200">
                        <button className="flex-1 py-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-blue-50/50">审批流程</button>
                        <button className="flex-1 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">仅看评论(0)</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                         <div className="flex justify-end mb-6">
                             <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">总耗时: 12 小时</span>
                         </div>
                         
                         <div className="relative pl-2 pb-10">
                            {/* Connector Line */}
                            <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-slate-100"></div>

                            {detail.timeline.map((node, index) => {
                                const isLast = index === detail.timeline.length - 1;
                                return (
                                <div key={node.id} className="relative mb-8 last:mb-0 pl-10 group">
                                    {/* Node Dot */}
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-colors ${
                                        node.status === 'APPROVED' ? 'border-green-500 text-green-500' :
                                        node.status === 'PROCESSING' ? 'border-blue-500 text-blue-500' :
                                        node.status === 'INITIATED' ? 'border-green-500 text-green-500' :
                                        'border-slate-300 text-slate-300'
                                    }`}>
                                        {node.status === 'APPROVED' && <CheckCircle size={14} className="fill-green-500 text-white" />}
                                        {node.status === 'INITIATED' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>}
                                        {node.status === 'PROCESSING' && (
                                             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                                        )}
                                        {node.statusLabel === '已通过' && node.status === 'APPROVED' && <CheckCircle size={14} className="fill-green-500 text-white" />}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-slate-800">{node.role}</span>
                                            {node.time && <span className="text-xs text-slate-400 font-mono">{node.time.split(' ')[1]}</span>}
                                        </div>
                                        {node.time && <div className="text-[10px] text-slate-400 font-mono mb-0.5">{node.time.split(' ')[0]}</div>}

                                        <div className="flex items-center justify-between">
                                             <div className={`text-xs font-medium px-2 py-0.5 rounded w-fit ${
                                                node.status === 'APPROVED' || node.status === 'INITIATED' ? 'bg-green-50 text-green-600' : 
                                                node.status === 'PROCESSING' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                                            }`}>
                                                {node.statusLabel}
                                            </div>
                                            {node.duration && (
                                                <div className="text-[10px] text-slate-400">耗时: {node.duration}</div>
                                            )}
                                        </div>
                                        
                                        {node.name && node.role !== node.name && (
                                            <div className="text-xs text-slate-500 mt-1">操作人: {node.name}</div>
                                        )}
                                    </div>
                                </div>
                            )})}
                         </div>
                    </div>
                </div>
            </div>

            {/* Config Edit Modal */}
            {editingItem && (
                <ConfigEditModal 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                    onSave={handleSaveConfig}
                />
            )}
        </div>
    );
  };

  return viewMode === 'LIST' ? renderList() : renderDetail();
};
