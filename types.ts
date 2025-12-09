

export enum AttachmentCategory {
  FORK = '货叉型属具',
  CLAMP = '夹持类属具'
}

export enum AttachmentStatus {
  EFFECTIVE = '生效中',
  EXPIRED = '已失效'
}

export enum InventoryStatus {
  IN_STOCK = '在库',
  RENTED = '已出租',
  IN_TRANSIT = '在途',
  DISPOSED = '已处置',
  LOSS = '盘亏'
}

export enum InventorySource {
  PURCHASE = '单独采购',
  ATTACHED = '整机随附'
}

export enum InventoryHistoryType {
  INBOUND = '入库',
  OUTBOUND = '出库',
  TRANSFER = '调拨',
  STOCKTAKE = '盘点',
  MAINTENANCE = '维修'
}

export enum StocktakeStatus {
  DRAFT = '草稿',
  IN_PROGRESS = '盘点中',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export enum TransferStatus {
  PENDING = '待处理',
  IN_TRANSIT = '运输中',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export enum RequirementStatus {
  APPROVED = '审批通过',
  ORDERED = '已下单',
  CANCELLED = '已取消'
}

export interface InventoryHistoryRecord {
  id: string;
  inventoryId: string; // Link to InventoryItem
  type: InventoryHistoryType;
  date: string;
  operator: string;
  details: string; // Description of the change
  referenceNumber?: string; // e.g. PO Number, Order ID, Equipment Code
}

export interface Attachment {
  id: string;
  name: string; // 属具名称
  code: string; // 资产编号
  category: AttachmentCategory; // 分类
  subType: string; // 具体类型 (e.g., 纸箱夹, 侧移器)
  modelNumber: string; // 型号
  supplier: string; // 供应商
  specifications: string; // 规格尺寸
  weight: number; // 重量 (kg)
  depreciationYears: number; // 标准折旧年限
  purchaseDate: string; // 采购日期
  status: AttachmentStatus; // 状态
  remarks?: string; // 备注
  imageUrl?: string; // 图片链接
  compatibleSeries?: string; // 适配车系 (e.g. 内燃平衡重, 电动平衡重)
}

export interface InventoryItem {
  id: string;
  batchCode: string; // 批次码
  factoryCode?: string; // 原厂编码
  attachmentName: string; // 属具名称
  category: AttachmentCategory; // 类目
  firstInboundDate: string; // 首次入库日期
  holdingDays: number; // 持有天数
  dailyDepreciation: number; // 日折旧额 (RMB)
  netValue: number; // 净值 (RMB)
  source: InventorySource; // 来源
  region: string; // 区域
  store: string; // 门店
  storageLocation: string; // 存放地
  status: InventoryStatus; // 库存状态
  specifications?: string; // 规格参数
}

export interface StocktakeItem {
  inventoryId?: string; // Optional for surplus items
  batchCode: string;
  attachmentName: string;
  category: string;
  storageLocation: string;
  
  systemStatus: InventoryStatus | null; // Null if surplus
  actualStatus: InventoryStatus;
  
  remarks?: string;
  
  // Tracking fields
  isSurplus: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED';
}

export interface StocktakeOrder {
  id: string;
  orderNumber: string; // e.g., ST-20231027-001
  store: string; // Target Warehouse/Store
  region: string; 
  status: StocktakeStatus;
  createDate: string;
  creator: string;
  finishDate?: string;
  totalItems: number;
  abnormalItems: number; // Count of items where system != actual
  items: StocktakeItem[];
}

export interface TransferItem {
  inventoryId: string;
  batchCode: string;
  attachmentName: string;
  netValue: number;
}

export interface TransferOrder {
  id: string;
  transferNumber: string; // e.g., TR-20231028-005
  sourceRegion: string;
  sourceStore: string;
  targetRegion: string;
  targetStore: string;
  status: TransferStatus;
  createDate: string;
  creator: string;
  totalItems: number;
  totalAmount: number;
  remarks?: string;
  items: TransferItem[];
}

export interface RequirementOrder {
  id: string;
  requestNumber: string; // 采购申请单号 SSQ...
  quantity: number; // 申请数量
  equipmentInfo: string; // 设备信息
  status: RequirementStatus; // 申请状态
  requiredDate: string; // 要求到货日期
  deliveryLocation: string; // 收货地
  requestStore: string; // 申请门店
  receiveStore: string; // 收货门店
  receiveWarehouse: string; // 收货仓库
}

export interface SeriesParameter {
  id: string;
  name: string; // 字段名称
  dataType: string; // 数据类型: 数字, 选项, 文本
  options: string; // 选择项枚举值
  unit: string; // 单位
  isRequired: boolean; // 是否必填
  status: '生效' | '失效'; // 生效状态
}

export interface SeriesAttachment {
  id: string;
  name: string; // 属具名称
  category: string; // 属具分类 (e.g. 货叉型属具)
  materialCategory: string; // 关联物料类目 (e.g. 侧移器, 软包夹)
  options: string; // 选择项枚举值 (e.g. 1520, 1630)
  status: '生效' | '失效';
}

export interface Series {
  id: string;
  name: string; // 系列名称
  code: string; // 系列编码
  category: string; // 所属品类
  createTime: string; // 创建时间
  creator: string; // 创建人
  remarks?: string; // 备注
  
  // Extended Fields
  powerSource?: string; // 动力源
  configurationParameters?: SeriesParameter[]; // 配置参数列表 (New)
  attachments?: SeriesAttachment[]; // 属具信息列表 (New)
  parameters?: SeriesParameter[]; // 常用参数列表
  keyParameter?: string; // 关键参数名称
}

export interface ApprovalRecord {
  id: string;
  title: string;
  approvalNumber: string; // 审批单号
  businessType: string; // 业务类型
  businessNumber: string; // 业务单号
  status: string; // 状态
  tenant: string; // 租户
  submitter: string; // 提交人
  submitTime: string; // 提交时间
  startTime: string; // 开始审核时间
}

export interface ApprovalTimelineNode {
  id: string;
  role: string;
  name: string; // e.g. "忻云(张光继)"
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INITIATED' | 'PROCESSING'; // "已通过", "审批中"
  statusLabel: string; // "已通过", "发起申请"
  time: string;
  duration?: string; // "耗时: 12小时"
  avatar?: string; // or just initial
  comments?: string;
  isCurrent?: boolean;
}

export interface ApprovalDetailItem {
  id: string;
  name: string;
  quantity: number;
  config: string; // The long configuration string
}

export interface ApprovalDetail {
  id: string; // links to ApprovalRecord.id
  recordId: string;
  title: string;
  
  // Header Info
  submitter: string;
  submitTime: string;
  printId: string; // "2025120820105550398"

  // Application Info Section
  deliveryLocation: string;
  receiveWarehouse: string;
  totalCount: number;
  requiredDate: string;

  items: ApprovalDetailItem[];
  
  timeline: ApprovalTimelineNode[];
}

export type ViewState = 'DASHBOARD' | 'LIST' | 'DETAIL' | 'EDIT' | 'CREATE' | 'INVENTORY' | 'STOCKTAKE' | 'TRANSFER' | 'SERIES' | 'REQUIREMENT' | 'APPROVAL';
