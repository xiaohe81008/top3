import React, { useState } from 'react';
import { Series, SeriesParameter, SeriesAttachment } from '../types';
import { INITIAL_SERIES, ATTACHMENT_CATEGORIES } from '../constants';
import { Plus, Search, ChevronDown, RotateCw, Settings, XCircle, PlusCircle, X, ChevronLeft, ChevronRight, Save, Trash2, Edit } from 'lucide-react';

export const SeriesView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [seriesList, setSeriesList] = useState<Series[]>(INITIAL_SERIES);
  
  // Filters state (List View)
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCreator, setFilterCreator] = useState('');

  // Form state
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState<Partial<Series>>({});

  // --- List View Logic ---
  const filteredList = seriesList.filter(item => 
    item.name.toLowerCase().includes(filterName.toLowerCase()) &&
    item.code.toLowerCase().includes(filterCode.toLowerCase()) &&
    item.category.toLowerCase().includes(filterCategory.toLowerCase()) &&
    item.creator.toLowerCase().includes(filterCreator.toLowerCase())
  );

  const handleClearFilters = () => {
    setFilterName('');
    setFilterCode('');
    setFilterCategory('');
    setFilterCreator('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该系列吗？')) {
      setSeriesList(seriesList.filter(s => s.id !== id));
    }
  };

  const handleOpenCreate = () => {
    setEditingSeries(null);
    setFormData({
      name: '',
      code: '',
      category: '工业车辆设备',
      remarks: '',
      powerSource: '电动',
      configurationParameters: [],
      attachments: [],
      parameters: [],
      keyParameter: ''
    });
    setViewMode('FORM');
  };

  const handleOpenEdit = (series: Series) => {
    setEditingSeries(series);
    // Deep copy to prevent direct mutation
    setFormData(JSON.parse(JSON.stringify(series)));
    setViewMode('FORM');
  };

  // --- Form View Logic ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSeries) {
      // Edit logic
      const updated = seriesList.map(s => 
        s.id === editingSeries.id 
          ? { ...s, ...formData } as Series 
          : s
      );
      setSeriesList(updated);
    } else {
      // Create logic
      const newSeries: Series = {
        id: `SER-${Date.now()}`,
        name: formData.name || '',
        code: formData.code || '',
        category: formData.category || '工业车辆设备',
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        creator: '管理员',
        remarks: formData.remarks,
        powerSource: formData.powerSource,
        configurationParameters: formData.configurationParameters || [],
        attachments: formData.attachments || [],
        parameters: formData.parameters || [],
        keyParameter: formData.keyParameter
      };
      setSeriesList([...seriesList, newSeries]);
    }
    setViewMode('LIST');
  };

  const toggleParameterStatus = (paramId: string) => {
    const params = formData.parameters || [];
    const updatedParams = params.map(p => 
        p.id === paramId ? { ...p, status: p.status === '生效' ? '失效' as const : '生效' as const } : p
    );
    setFormData({ ...formData, parameters: updatedParams });
  };

  const removeParameter = (paramId: string) => {
    const params = formData.parameters || [];
    const updatedParams = params.filter(p => p.id !== paramId);
    setFormData({ ...formData, parameters: updatedParams });
  };

  // Mock adding a parameter (In real app, this would open a selection modal)
  const handleAddParameterMock = () => {
    const newParam: SeriesParameter = {
        id: `param-${Date.now()}`,
        name: '新增长度参数',
        dataType: '数字',
        options: '--',
        unit: 'm',
        isRequired: false,
        status: '生效'
    };
    setFormData({ ...formData, parameters: [...(formData.parameters || []), newParam] });
  };

  // --- Config Parameters Logic ---
  const toggleConfigParameterStatus = (paramId: string) => {
    const params = formData.configurationParameters || [];
    const updatedParams = params.map(p => 
        p.id === paramId ? { ...p, status: p.status === '生效' ? '失效' as const : '生效' as const } : p
    );
    setFormData({ ...formData, configurationParameters: updatedParams });
  };

  const removeConfigParameter = (paramId: string) => {
    const params = formData.configurationParameters || [];
    const updatedParams = params.filter(p => p.id !== paramId);
    setFormData({ ...formData, configurationParameters: updatedParams });
  };

  const handleAddConfigParameterMock = () => {
    const examples = [
        { name: '门架', dataType: '选项', options: '二节门架,三节门架', unit: '--' },
        { name: '电池容量', dataType: '数字', options: '--', unit: 'Ah' },
        { name: '轮胎', dataType: '选项', options: '实心胎,充气胎', unit: '--' }
    ];
    // logic to pick one not in list or random
    const random = examples[Math.floor(Math.random() * examples.length)];
    
    const newParam: SeriesParameter = {
        id: `config-param-${Date.now()}`,
        name: random.name,
        dataType: random.dataType,
        options: random.options,
        unit: random.unit,
        isRequired: true,
        status: '生效'
    };
    setFormData({ ...formData, configurationParameters: [...(formData.configurationParameters || []), newParam] });
  };

  // --- Attachments Logic ---
  const toggleAttachmentStatus = (attId: string) => {
    const atts = formData.attachments || [];
    const updated = atts.map(a => 
      a.id === attId ? { ...a, status: a.status === '生效' ? '失效' as const : '生效' as const } : a
    );
    setFormData({ ...formData, attachments: updated });
  };

  const removeAttachment = (attId: string) => {
    const atts = formData.attachments || [];
    const updated = atts.filter(a => a.id !== attId);
    setFormData({ ...formData, attachments: updated });
  };

  const handleAddAttachmentMock = () => {
    const categories = Object.keys(ATTACHMENT_CATEGORIES);
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const items = ATTACHMENT_CATEGORIES[randomCat];
    const randomItem = items[Math.floor(Math.random() * items.length)];

    // Generate mock values for new fields
    const materialCats = ['侧移器', '软包夹', '货叉', '纸卷夹', '推出器'];
    const randomMatCat = materialCats[Math.floor(Math.random() * materialCats.length)];
    const randomOptions = ['1520, 1630', '1800, 2000', '--', '1000, 1200'][Math.floor(Math.random() * 4)];

    const newAtt: SeriesAttachment = {
        id: `att-${Date.now()}`,
        name: randomItem,
        category: randomCat,
        materialCategory: randomMatCat,
        options: randomOptions,
        status: '生效'
    };
    setFormData({ ...formData, attachments: [...(formData.attachments || []), newAtt] });
  };

  // --- Render Methods ---
  const renderList = () => (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">系列管理</h2>
          <p className="text-slate-500 mt-1">维护叉车及属具的适配系列信息。</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
        {/* Filter Item: Series Name */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <div className="text-slate-500 mr-2 flex items-center cursor-pointer">
            <XCircle size={14} className="hover:text-red-500 transition-colors" onClick={() => setFilterName('')} />
          </div>
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap mr-2">系列名称 |</span>
          <input 
            type="text" 
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-24"
            placeholder="全部"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
           <ChevronDown size={14} className="text-slate-400 ml-1" />
        </div>

        {/* Filter Item: Series Code */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
           <div className="text-slate-500 mr-2 flex items-center cursor-pointer">
             <PlusCircle size={14} className="text-slate-400" />
           </div>
           <span className="text-sm font-medium text-slate-700 whitespace-nowrap mr-2">系列编码</span>
           <input 
            type="text" 
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-24"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
          />
        </div>

        {/* Filter Item: Category */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
           <div className="text-slate-500 mr-2 flex items-center cursor-pointer">
             <PlusCircle size={14} className="text-slate-400" />
           </div>
           <span className="text-sm font-medium text-slate-700 whitespace-nowrap mr-2">设备品类</span>
           <input 
            type="text" 
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-24"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
        </div>

         {/* Filter Item: Creator */}
         <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
           <div className="text-slate-500 mr-2 flex items-center cursor-pointer">
             <PlusCircle size={14} className="text-slate-400" />
           </div>
           <span className="text-sm font-medium text-slate-700 whitespace-nowrap mr-2">创建人</span>
           <input 
            type="text" 
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-24"
            value={filterCreator}
            onChange={(e) => setFilterCreator(e.target.value)}
          />
        </div>

        <button 
          onClick={handleClearFilters}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2"
        >
          清空
        </button>

        <div className="flex-1"></div>

        {/* Action Buttons */}
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} />
          新增系列
        </button>
        <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          排序设置
        </button>
         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
           <RotateCw size={18} />
         </button>
         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
           <Settings size={18} />
         </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">序号</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">系列名称</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">系列编码</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">所属品类</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors">
                    创建时间 <ChevronDown size={12} className="inline ml-1" />
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">创建人</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">备注</th>
                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{item.name}</td>
                    <td className="px-6 py-4 text-slate-900">{item.code}</td>
                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.createTime}</td>
                    <td className="px-6 py-4 text-slate-600">{item.creator}</td>
                    <td className="px-6 py-4 text-slate-500">{item.remarks || '--'}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                     暂无数据
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-4 text-sm text-slate-500">
             <span>共 {filteredList.length} 条</span>
             <div className="flex items-center gap-2">
                 <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">
                     <ChevronLeft size={14} />
                 </button>
                 <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded font-medium">1</button>
                 <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">
                     <ChevronRight size={14} />
                 </button>
             </div>
             <div className="flex items-center gap-2">
                <select className="border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-600 outline-none">
                    <option>50 条/页</option>
                    <option>100 条/页</option>
                </select>
                <span>前往</span>
                <input type="text" className="w-12 border border-slate-200 rounded px-2 py-1 text-center outline-none" />
                <span>页</span>
             </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6 pb-20">
       {/* Form Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setViewMode('LIST')}
                    className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                 >
                     <ChevronLeft size={24} />
                 </button>
                <h2 className="text-2xl font-bold text-slate-900">{editingSeries ? '编辑系列' : '新增系列'}</h2>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* 1. Basic Info */}
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-6">基础信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="text-red-500 mr-1">*</span>所属品类
                        </label>
                        <select 
                            className="w-full rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="工业车辆设备">工业车辆设备</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="text-red-500 mr-1">*</span>系列名称
                        </label>
                        <input 
                            type="text" 
                            className="w-full rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                             <span className="text-red-500 mr-1">*</span>系列编码
                        </label>
                        <input 
                            type="text" 
                            className="w-full rounded bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-500 outline-none"
                            value={formData.code}
                            readOnly={!!editingSeries}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                        <input 
                            type="text" 
                            className="w-full rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                            placeholder="请输入..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Public Params */}
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-6">公共参数</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="text-red-500 mr-1">*</span>动力源
                        </label>
                        <select 
                            className="w-full rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                            value={formData.powerSource}
                            onChange={(e) => setFormData({...formData, powerSource: e.target.value})}
                        >
                            <option value="电动">电动</option>
                            <option value="柴油">柴油</option>
                            <option value="手动">手动</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2.5 Config Params (New Section) */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-slate-800">配置参数</h3>
                     <button 
                        type="button" 
                        onClick={handleAddConfigParameterMock}
                        className="text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-100 text-slate-700"
                    >
                         <Plus size={16} /> 选择配置参数
                     </button>
                </div>
                <div className="text-xs text-slate-500 mb-3">包含: 门架、电池容量、轮胎等</div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200">序号</th>
                                <th className="px-4 py-3 border-b border-slate-200">字段名称</th>
                                <th className="px-4 py-3 border-b border-slate-200">数据类型</th>
                                <th className="px-4 py-3 border-b border-slate-200">选择项枚举值</th>
                                <th className="px-4 py-3 border-b border-slate-200">单位</th>
                                <th className="px-4 py-3 border-b border-slate-200">是否必填</th>
                                <th className="px-4 py-3 border-b border-slate-200">生效状态</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(formData.configurationParameters && formData.configurationParameters.length > 0) ? (
                                formData.configurationParameters.map((param, idx) => (
                                    <tr key={param.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{param.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{param.dataType}</td>
                                        <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{param.options}</td>
                                        <td className="px-4 py-3 text-slate-600">{param.unit}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${param.isRequired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-slate-700">{param.isRequired ? '是' : '否'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${param.status === '生效' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-slate-700">{param.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button 
                                                type="button"
                                                onClick={() => toggleConfigParameterStatus(param.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                {param.status === '生效' ? '失效' : '生效'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => removeConfigParameter(param.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        暂无配置参数，请点击上方按钮添加
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* 2.6 Attachment Info (New Section) */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-slate-800">属具信息</h3>
                     <button 
                        type="button" 
                        onClick={handleAddAttachmentMock}
                        className="text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-100 text-slate-700"
                    >
                         <Plus size={16} /> 选择属具
                     </button>
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200">序号</th>
                                <th className="px-4 py-3 border-b border-slate-200">属具名称</th>
                                {/* Removed 'Attachment Category' column here */}
                                <th className="px-4 py-3 border-b border-slate-200">关联物料类目</th>
                                <th className="px-4 py-3 border-b border-slate-200">选择项枚举值</th>
                                {/* Removed 'Effective Status' column here */}
                                <th className="px-4 py-3 border-b border-slate-200 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(formData.attachments && formData.attachments.length > 0) ? (
                                formData.attachments.map((att, idx) => (
                                    <tr key={att.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{att.name}</td>
                                        {/* Removed 'Attachment Category' cell here */}
                                        <td className="px-4 py-3 text-slate-600">{att.materialCategory || '--'}</td>
                                        <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{att.options || '--'}</td>
                                        {/* Removed 'Effective Status' cell here */}
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button 
                                                type="button"
                                                onClick={() => removeAttachment(att.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        暂无属具信息，请点击上方按钮添加
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Common Params Table */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-slate-800">常用参数</h3>
                     <button 
                        type="button" 
                        onClick={handleAddParameterMock}
                        className="text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-100 text-slate-700"
                    >
                         <Plus size={16} /> 选择关联参数
                     </button>
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200">序号</th>
                                <th className="px-4 py-3 border-b border-slate-200">字段名称</th>
                                <th className="px-4 py-3 border-b border-slate-200">数据类型</th>
                                <th className="px-4 py-3 border-b border-slate-200">选择项枚举值</th>
                                <th className="px-4 py-3 border-b border-slate-200">单位</th>
                                <th className="px-4 py-3 border-b border-slate-200">是否必填</th>
                                <th className="px-4 py-3 border-b border-slate-200">生效状态</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(formData.parameters && formData.parameters.length > 0) ? (
                                formData.parameters.map((param, idx) => (
                                    <tr key={param.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{param.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{param.dataType}</td>
                                        <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{param.options}</td>
                                        <td className="px-4 py-3 text-slate-600">{param.unit}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${param.isRequired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-slate-700">{param.isRequired ? '是' : '否'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${param.status === '生效' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-slate-700">{param.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button 
                                                type="button"
                                                onClick={() => toggleParameterStatus(param.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                {param.status === '生效' ? '失效' : '生效'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => removeParameter(param.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        暂无参数，请点击上方按钮添加
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Key Params */}
            <div className="p-6 border-b border-slate-100">
                 <h3 className="text-sm font-bold text-slate-800 mb-6">关键参数</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="text-red-500 mr-1">*</span>参数名称
                        </label>
                        <select 
                            className="w-full rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                            value={formData.keyParameter}
                            onChange={(e) => setFormData({...formData, keyParameter: e.target.value})}
                        >
                            <option value="">请选择...</option>
                            {formData.parameters?.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 5. Plate Info (Placeholder) */}
            <div className="p-6 pb-12">
                 <h3 className="text-sm font-bold text-slate-800 mb-6">铭牌信息</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 opacity-50">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">铭牌类型</label>
                        <input type="text" disabled className="w-full rounded bg-slate-100 border border-slate-200 px-3 py-2 text-sm" placeholder="暂未开放" />
                    </div>
                 </div>
            </div>
        </form>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <button 
                onClick={() => setViewMode('LIST')}
                className="px-6 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
                取消
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition-colors"
            >
                提交
            </button>
        </div>
    </div>
  );

  return viewMode === 'LIST' ? renderList() : renderForm();
};