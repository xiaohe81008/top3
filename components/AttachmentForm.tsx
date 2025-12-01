
import React, { useState, useEffect } from 'react';
import { Attachment, AttachmentCategory, AttachmentStatus } from '../types';
import { FORK_TYPES, CLAMP_TYPES } from '../constants';
import { Save, X, Info } from 'lucide-react';

interface Props {
  initialData?: Attachment;
  onSave: (data: Omit<Attachment, 'id'>) => void;
  onCancel: () => void;
}

export const AttachmentForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Attachment>>({
    name: '',
    code: '',
    category: AttachmentCategory.FORK,
    subType: FORK_TYPES[0],
    modelNumber: '',
    supplier: '',
    specifications: '',
    weight: 0,
    depreciationYears: 5,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: AttachmentStatus.EFFECTIVE,
    remarks: '',
    compatibleSeries: '内燃平衡重'
  });

  const [subTypeOptions, setSubTypeOptions] = useState<string[]>(FORK_TYPES);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.category === AttachmentCategory.FORK) {
      setSubTypeOptions(FORK_TYPES);
      if (!FORK_TYPES.includes(formData.subType || '')) {
        setFormData(prev => ({ ...prev, subType: FORK_TYPES[0] }));
      }
    } else {
      setSubTypeOptions(CLAMP_TYPES);
      if (!CLAMP_TYPES.includes(formData.subType || '')) {
        setFormData(prev => ({ ...prev, subType: CLAMP_TYPES[0] }));
      }
    }
  }, [formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, perform validation here
    onSave(formData as Omit<Attachment, 'id'>);
  };

  const handleChange = (field: keyof Attachment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? '编辑属具' : '新增属具'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">请填写以下基础数据信息，带 * 为必填项。</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section: Basic Info */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              基本信息
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">属具名称 *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="例如：重型纸卷夹"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">资产编号 *</label>
            <input
              required
              type="text"
              value={formData.code}
              onChange={e => handleChange('code', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="唯一资产ID"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">大类 *</label>
            <select
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {Object.values(AttachmentCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">具体类型 *</label>
            <select
              value={formData.subType}
              onChange={e => handleChange('subType', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {subTypeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Section: Technical Specs */}
          <div className="md:col-span-2 mt-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              技术规格
            </h3>
          </div>

          <div className="space-y-1">
             <label className="block text-sm font-medium text-slate-700">适配车系</label>
             <select
              value={formData.compatibleSeries}
              onChange={e => handleChange('compatibleSeries', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="内燃平衡重">内燃平衡重</option>
              <option value="电动平衡重">电动平衡重</option>
              <option value="全系列通用">全系列通用</option>
            </select>
          </div>

           <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">型号 (Model) *</label>
            <input
              required
              type="text"
              value={formData.modelNumber}
              onChange={e => handleChange('modelNumber', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">供应商 *</label>
            <input
              required
              type="text"
              value={formData.supplier}
              onChange={e => handleChange('supplier', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

           <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">规格尺寸/参数 *</label>
            <div className="relative">
                <input
                required
                type="text"
                value={formData.specifications}
                onChange={e => handleChange('specifications', e.target.value)}
                className="w-full rounded-lg border-slate-300 border pl-3 pr-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="例如：长度 1200mm, 承重 2T"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Info size={16} />
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">请详细描述关键尺寸参数，如张开度、侧移量等。</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">重量 (kg)</label>
            <input
              type="number"
              min="0"
              value={formData.weight}
              onChange={e => handleChange('weight', Number(e.target.value))}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">折旧年限 (年)</label>
            <input
              type="number"
              min="0"
              value={formData.depreciationYears}
              onChange={e => handleChange('depreciationYears', Number(e.target.value))}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

           {/* Section: Status */}
           <div className="md:col-span-2 mt-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-500 rounded-full"></span>
              状态管理
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">采购日期</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={e => handleChange('purchaseDate', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">当前状态</label>
            <select
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {Object.values(AttachmentStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">备注</label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={e => handleChange('remarks', e.target.value)}
              className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="填写维护记录、存放位置或其他说明..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-8 pt-4 border-t border-slate-100">
            <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-100 border border-slate-300 transition-colors"
            >
                取消
            </button>
            <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
                <Save size={18} />
                保存数据
            </button>
        </div>
      </form>
    </div>
  );
};