
import React, { useState } from 'react';
import { TransferOrder, TransferStatus, InventoryItem, InventoryStatus, InventoryHistoryRecord, InventoryHistoryType } from '../types';
import { MOCK_TRANSFER_ORDERS } from '../constants';
import { Search, Filter, ArrowLeft, Calendar, User, MapPin, Truck, CheckCircle, XCircle, Clock, FileText, X } from 'lucide-react';

interface Props {
  inventoryItems?: InventoryItem[];
  setInventoryItems?: (items: InventoryItem[]) => void;
  historyLogs?: InventoryHistoryRecord[];
  setHistoryLogs?: (logs: InventoryHistoryRecord[]) => void;
}

export const TransferView: React.FC<Props> = ({ 
  inventoryItems, 
  setInventoryItems, 
  historyLogs, 
  setHistoryLogs 
}) => {
  const [mode, setMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [orders, setOrders] = useState<TransferOrder[]>(MOCK_TRANSFER_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<TransferOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: string | null }>({
    isOpen: false,
    orderId: null
  });
  const [receiptSelectedIds, setReceiptSelectedIds] = useState<string[]>([]);

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case TransferStatus.IN_TRANSIT: return 'bg-blue-100 text-blue-700';
      case TransferStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case TransferStatus.CANCELLED: return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING: return <Clock size={16} />;
      case TransferStatus.IN_TRANSIT: return <Truck size={16} />;
      case TransferStatus.COMPLETED: return <CheckCircle size={16} />;
      case TransferStatus.CANCELLED: return <XCircle size={16} />;
      default: return null;
    }
  };

  const handleConfirmReceipt = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const order = orders.find(o => o.id === orderId) || (currentOrder?.id === orderId ? currentOrder : null);
    
    if (order && inventoryItems) {
        // Default: Select items that are NOT yet at the target store (not received)
        const unreceivedItemIds = order.items
            .filter(item => {
                const invItem = inventoryItems.find(i => i.id === item.inventoryId);
                // If inventory item store is NOT target store, assume it needs receipt
                return invItem && invItem.store !== order.targetStore;
            })
            .map(i => i.inventoryId);
            
        // If all received or logic fails, just default to all items to be safe/flexible
        setReceiptSelectedIds(unreceivedItemIds.length > 0 ? unreceivedItemIds : order.items.map(i => i.inventoryId));
        setConfirmModal({ isOpen: true, orderId });
    }
  };

  const toggleReceiptSelection = (id: string) => {
    setReceiptSelectedIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const executeConfirmation = () => {
    const orderId = confirmModal.orderId;
    if (!orderId) return;

    // Find the order
    const orderToConfirm = orders.find(o => o.id === orderId) || (currentOrder?.id === orderId ? currentOrder : null);
    
    if (orderToConfirm && inventoryItems && setInventoryItems) {
      
      if (receiptSelectedIds.length === 0) {
          alert("请至少选择一项资产进行收货确认");
          return;
      }

      // 1. Update Inventory Items (Status -> IN_STOCK, Location -> Target Store)
      const updatedInventory = inventoryItems.map(item => {
          if (receiptSelectedIds.includes(item.id)) {
              return {
                  ...item,
                  status: InventoryStatus.IN_STOCK,
                  store: orderToConfirm.targetStore,
                  region: orderToConfirm.targetRegion,
                  storageLocation: '待上架' // Reset location to pending shelving
              };
          }
          return item;
      });
      setInventoryItems(updatedInventory);

      // 2. Check if ALL items in the order are now received (either just now or previously)
      const allReceived = orderToConfirm.items.every(orderItem => {
            // Check if it was just selected OR was already at target
            if (receiptSelectedIds.includes(orderItem.inventoryId)) return true;
            
            const currentItem = inventoryItems.find(i => i.id === orderItem.inventoryId);
            return currentItem?.store === orderToConfirm.targetStore;
      });

      // 3. Update Order Status
      if (allReceived) {
        setOrders(prev => prev.map(o => 
            o.id === orderId ? { ...o, status: TransferStatus.COMPLETED } : o
        ));
        if (currentOrder && currentOrder.id === orderId) {
            setCurrentOrder(prev => prev ? { ...prev, status: TransferStatus.COMPLETED } : null);
        }
      }

      // 4. Add History Logs
      if (historyLogs && setHistoryLogs) {
          const newLogs = orderToConfirm.items
              .filter(item => receiptSelectedIds.includes(item.inventoryId))
              .map(item => ({
                id: `LOG-${Date.now()}-${item.inventoryId}`,
                inventoryId: item.inventoryId,
                type: InventoryHistoryType.TRANSFER,
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                operator: '管理员',
                details: `调拨入库确认: 已到达 [${orderToConfirm.targetStore}]。调拨单号: ${orderToConfirm.transferNumber}`
            }));
          setHistoryLogs([...newLogs, ...historyLogs]);
      }
    }
    
    // Close Modal
    setConfirmModal({ isOpen: false, orderId: null });
    setReceiptSelectedIds([]);
  };

  const filteredOrders = orders.filter(o => 
    o.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.sourceStore.includes(searchTerm) ||
    o.targetStore.includes(searchTerm)
  );

  const getOrderToConfirm = () => {
      return orders.find(o => o.id === confirmModal.orderId) || (currentOrder?.id === confirmModal.orderId ? currentOrder : null);
  }

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">属具调拨管理</h2>
          <p className="text-slate-500 mt-1">查看和管理所有属具的跨仓库调拨申请及记录。</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="搜索调拨单号、调出/调入仓库..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-2">
            <Filter size={18} />
            <span>筛选</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">调拨单号</th>
                <th className="px-6 py-4 font-semibold">状态</th>
                <th className="px-6 py-4 font-semibold">调出仓库</th>
                <th className="px-6 py-4 font-semibold">调入仓库</th>
                <th className="px-6 py-4 font-semibold">创建日期</th>
                <th className="px-6 py-4 font-semibold text-right">数量</th>
                <th className="px-6 py-4 font-semibold text-right">总金额 (¥)</th>
                <th className="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <button 
                            onClick={() => {
                                setCurrentOrder(order);
                                setMode('DETAIL');
                            }}
                            className="font-mono font-medium text-blue-600 hover:underline"
                        >
                            {order.transferNumber}
                        </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                         {getStatusIcon(order.status)}
                         {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">{order.sourceStore}</td>
                    <td className="px-6 py-4 text-slate-900">{order.targetStore}</td>
                    <td className="px-6 py-4 text-slate-500">{order.createDate}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{order.totalItems}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {order.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                             {order.status === TransferStatus.IN_TRANSIT && (
                                <button 
                                    onClick={(e) => handleConfirmReceipt(order.id, e)}
                                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-medium transition-colors whitespace-nowrap"
                                >
                                    确认收货
                                </button>
                            )}
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        未找到调拨记录
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!currentOrder) return null;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => {
                        setCurrentOrder(null);
                        setMode('LIST');
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">返回列表</span>
                </button>
                <div className="flex gap-3">
                     <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm text-sm font-medium">
                        打印单据
                    </button>
                    {currentOrder.status === TransferStatus.IN_TRANSIT && (
                        <button 
                            onClick={() => handleConfirmReceipt(currentOrder.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-sm font-medium"
                        >
                            确认收货
                        </button>
                    )}
                </div>
            </div>

            {/* Title & Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h1 className="text-2xl font-bold text-slate-900">调拨单 {currentOrder.transferNumber}</h1>
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
                                {getStatusIcon(currentOrder.status)}
                                {currentOrder.status}
                             </span>
                        </div>
                        <p className="text-slate-500">创建于 {currentOrder.createDate} · 操作人: {currentOrder.creator}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">调拨总金额</span>
                        <span className="text-3xl font-bold text-slate-900">¥ {currentOrder.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">调出仓库 (From)</p>
                            <p className="text-lg font-bold text-slate-800">{currentOrder.sourceStore}</p>
                            <p className="text-sm text-slate-500">{currentOrder.sourceRegion}</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center justify-center text-slate-300">
                        <div className="flex flex-col items-center gap-2 w-full">
                            <Truck size={24} />
                            <div className="h-0.5 bg-slate-200 w-1/2"></div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">调入仓库 (Target)</p>
                            <p className="text-lg font-bold text-slate-800">{currentOrder.targetStore}</p>
                            <p className="text-sm text-slate-500">{currentOrder.targetRegion}</p>
                        </div>
                    </div>
                </div>
                
                {currentOrder.remarks && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                        <FileText className="text-slate-400 flex-shrink-0" size={18} />
                        <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">备注说明</p>
                             <p className="text-sm text-slate-700">{currentOrder.remarks}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">调拨明细</h3>
                    <div className="text-sm text-slate-500">
                        共 {currentOrder.items.length} 项资产
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold">编号 / 序列号</th>
                                <th className="px-6 py-3 font-semibold">属具名称</th>
                                <th className="px-6 py-3 font-semibold text-right">资产净值 (¥)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentOrder.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                                        {item.batchCode}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900">
                                        {item.attachmentName}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                                        {item.netValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const confirmModalOrder = getOrderToConfirm();

  return (
    <div className="h-full">
      {mode === 'LIST' ? renderList() : renderDetail()}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 transform transition-all scale-100 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                         <Truck className="text-blue-600 w-5 h-5" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800">调拨收货确认</h3>
                </div>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                >
                  <X size={20} />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                请核对并勾选已实际到达的资产。确认后，选中资产的状态将更新为“在库”，位置将更新至当前仓库。
              </p>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                          <tr>
                              <th className="px-4 py-3 w-12 text-center">选择</th>
                              <th className="px-4 py-3">编号</th>
                              <th className="px-4 py-3">名称</th>
                              <th className="px-4 py-3 text-right">净值</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {confirmModalOrder.items.map(item => (
                              <tr key={item.inventoryId} className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleReceiptSelection(item.inventoryId)}>
                                  <td className="px-4 py-3 text-center">
                                      <input 
                                          type="checkbox" 
                                          checked={receiptSelectedIds.includes(item.inventoryId)}
                                          onChange={() => {}} // Handled by tr click
                                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                      />
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-600">{item.batchCode}</td>
                                  <td className="px-4 py-3 font-medium text-slate-800">{item.attachmentName}</td>
                                  <td className="px-4 py-3 text-right text-slate-500">¥{item.netValue.toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center text-xs text-slate-500 px-1">
                 <span>共 {confirmModalOrder.items.length} 项</span>
                 <span className="text-blue-600 font-medium">已选中 {receiptSelectedIds.length} 项</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={executeConfirmation}
                disabled={receiptSelectedIds.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认收货 ({receiptSelectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
