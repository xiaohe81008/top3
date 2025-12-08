
import React, { useState } from 'react';
import { MOCK_APPROVAL_RECORDS } from '../constants';
import { ChevronDown, PlusCircle, RefreshCw, Filter, ChevronLeft, ChevronRight, XCircle, Search } from 'lucide-react';

export const ApprovalRecordView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROCESSING' | 'REJECTED' | 'COMPLETED' | 'FORWARDED'>('COMPLETED');
  
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
  // Note: For a static prototype, we are using the mock data directly. 
  // In a real app, we would filter `MOCK_APPROVAL_RECORDS` based on `activeTab` and `filters`.
  // Since the screenshot shows "Completed" tab selected and the mock data corresponds to that, we just display it.

  return (
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

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">业务单号</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">状态</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">审批单号</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">审批标题</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">租户</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">提交时间</span>
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-400 cursor-pointer transition-colors group">
             <PlusCircle size={14} className="text-slate-400 mr-2 group-hover:text-blue-500" />
             <span className="text-slate-700 mr-2">更多</span>
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
                                <a href="#" className="text-blue-600 hover:underline">{item.title}</a>
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
    </div>
  );
};
