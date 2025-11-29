import React from 'react';
import { Attachment } from '../types';
import { StatusBadge } from './StatusBadge';
import { Edit2, ArrowLeft, Trash2, Calendar, Scale, Ruler, Building, Tag } from 'lucide-react';

interface Props {
  data: Attachment;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DetailView: React.FC<Props> = ({ data, onBack, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回列表</span>
        </button>
        <div className="flex gap-3">
             <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
                <Trash2 size={18} />
                <span>删除</span>
            </button>
            <button 
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all active:scale-95"
            >
                <Edit2 size={18} />
                <span>编辑信息</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Quick Stats */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="aspect-video w-full bg-slate-100 rounded-lg overflow-hidden relative">
                    {data.imageUrl ? (
                        <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">暂无图片</div>
                    )}
                    <div className="absolute top-4 right-4">
                        <StatusBadge status={data.status} />
                    </div>
                </div>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
                    <p className="text-slate-500 font-mono text-sm mt-1">{data.code}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">关键指标</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Scale size={20} />
                            <span className="text-sm">重量</span>
                        </div>
                        <span className="font-semibold text-slate-900">{data.weight} kg</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Calendar size={20} />
                            <span className="text-sm">折旧年限</span>
                        </div>
                        <span className="font-semibold text-slate-900">{data.depreciationYears} 年</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Tag size={20} />
                            <span className="text-sm">分类</span>
                        </div>
                        <span className="font-semibold text-slate-900">{data.category}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building size={18} className="text-blue-500" />
                        设备详情
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                     <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">具体类型</label>
                        <p className="mt-1 text-base text-slate-900 font-medium">{data.subType}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">型号</label>
                        <p className="mt-1 text-base text-slate-900 font-medium">{data.modelNumber}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">供应商</label>
                        <p className="mt-1 text-base text-slate-900 font-medium">{data.supplier}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">采购日期</label>
                        <p className="mt-1 text-base text-slate-900 font-medium">{data.purchaseDate}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <Ruler size={14} />
                            规格尺寸
                        </label>
                        <p className="mt-2 text-base text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {data.specifications}
                        </p>
                    </div>
                     <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">备注信息</label>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                            {data.remarks || '无备注信息'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Maintenance Log Placeholder (To show functionality depth) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-75">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">维护记录 (演示)</h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">即将上线</span>
                </div>
                <div className="p-6">
                    <div className="border-l-2 border-slate-200 pl-4 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                            <p className="text-xs text-slate-500">2023-10-01</p>
                            <p className="text-sm font-medium text-slate-800">例行检查完成</p>
                        </div>
                         <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                            <p className="text-xs text-slate-500">2023-01-10</p>
                            <p className="text-sm font-medium text-slate-800">设备入库</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
