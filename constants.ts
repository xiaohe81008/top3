
import { Attachment, AttachmentCategory, AttachmentStatus, InventoryItem, InventorySource, InventoryHistoryRecord, InventoryHistoryType, InventoryStatus, StocktakeOrder, StocktakeStatus, TransferOrder, TransferStatus } from './types';

export const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'ATT-2023-001',
    name: '重型纸卷夹',
    code: 'ZC-001',
    category: AttachmentCategory.CLAMP,
    subType: '纸卷夹',
    modelNumber: 'PRC-5000-X',
    supplier: '卡斯卡特 (Cascade)',
    specifications: '夹持范围: 250-1600mm, 承载: 3000kg',
    weight: 850,
    depreciationYears: 5,
    purchaseDate: '2022-03-15',
    status: AttachmentStatus.EFFECTIVE,
    remarks: '主仓库一号叉车使用，状况良好。',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    compatibleSeries: '内燃平衡重'
  },
  {
    id: 'ATT-2023-002',
    name: '侧移器',
    code: 'CY-102',
    category: AttachmentCategory.FORK,
    subType: '侧移器',
    modelNumber: 'SS-25-A',
    supplier: '考普 (Kaup)',
    specifications: '侧移量: ±100mm, 宽度: 1200mm',
    weight: 120,
    depreciationYears: 8,
    purchaseDate: '2023-01-10',
    status: AttachmentStatus.EFFECTIVE,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    compatibleSeries: '电动平衡重'
  },
  {
    id: 'ATT-2021-045',
    name: '软包夹',
    code: 'RB-045',
    category: AttachmentCategory.CLAMP,
    subType: '软包夹',
    modelNumber: 'BC-2000',
    supplier: '龙合智能',
    specifications: '最大张开: 1900mm',
    weight: 480,
    depreciationYears: 5,
    purchaseDate: '2021-06-20',
    status: AttachmentStatus.EFFECTIVE,
    remarks: '液压油管轻微渗漏，等待维修配件。',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    compatibleSeries: '内燃平衡重'
  },
  {
    id: 'ATT-2020-012',
    name: '加长货叉',
    code: 'JC-012',
    category: AttachmentCategory.FORK,
    subType: '加长叉',
    modelNumber: 'LF-2400',
    supplier: '自制/定制',
    specifications: '长度: 2400mm, 截面: 150x60mm',
    weight: 150,
    depreciationYears: 3,
    purchaseDate: '2020-11-05',
    status: AttachmentStatus.EXPIRED,
    imageUrl: 'https://picsum.photos/400/300?random=4',
    compatibleSeries: '全系列通用'
  }
];

export const FORK_TYPES = [
  '圆杆叉', '叉套', '加长叉', '折叠货叉', '砖叉', '调距叉', '侧移叉', '其他'
];

export const CLAMP_TYPES = [
  '纸箱夹', '纸卷夹', '软包夹', '烟叶箱夹', '载荷稳定器', '液压式桶夹', '其他'
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    batchCode: 'BAT-20230315-01',
    attachmentName: '重型纸卷夹',
    category: AttachmentCategory.CLAMP,
    firstInboundDate: '2022-03-15',
    holdingDays: 520,
    dailyDepreciation: 15.50,
    netValue: 12500.00,
    source: InventorySource.PURCHASE,
    region: '华东区',
    store: '上海物流中心',
    storageLocation: 'A区-01-02',
    status: InventoryStatus.IN_STOCK
  },
  {
    id: 'INV-002',
    batchCode: 'BAT-20230110-05',
    attachmentName: '侧移器',
    category: AttachmentCategory.FORK,
    firstInboundDate: '2023-01-10',
    holdingDays: 210,
    dailyDepreciation: 2.30,
    netValue: 3200.00,
    source: InventorySource.ATTACHED,
    region: '华北区',
    store: '北京分拨仓',
    storageLocation: 'B区-05-11',
    status: InventoryStatus.RENTED
  },
  {
    id: 'INV-003',
    batchCode: 'BAT-20210620-11',
    attachmentName: '软包夹',
    category: AttachmentCategory.CLAMP,
    firstInboundDate: '2021-06-20',
    holdingDays: 800,
    dailyDepreciation: 12.00,
    netValue: 8900.00,
    source: InventorySource.PURCHASE,
    region: '华南区',
    store: '广州中转场',
    storageLocation: 'C区-12-01',
    status: InventoryStatus.IN_TRANSIT
  },
  {
    id: 'INV-004',
    batchCode: 'BAT-20201105-03',
    attachmentName: '加长货叉',
    category: AttachmentCategory.FORK,
    firstInboundDate: '2020-11-05',
    holdingDays: 1020,
    dailyDepreciation: 1.50,
    netValue: 450.00,
    source: InventorySource.ATTACHED,
    region: '华东区',
    store: '杭州仓',
    storageLocation: 'D区-02-05',
    status: InventoryStatus.DISPOSED
  },
   {
    id: 'INV-005',
    batchCode: 'BAT-20230801-02',
    attachmentName: '砖叉',
    category: AttachmentCategory.FORK,
    firstInboundDate: '2023-08-01',
    holdingDays: 30,
    dailyDepreciation: 8.50,
    netValue: 6800.00,
    source: InventorySource.PURCHASE,
    region: '华西区',
    store: '成都物流园',
    storageLocation: 'E区-09-22',
    status: InventoryStatus.LOSS
  }
];

export const MOCK_HISTORY_LOGS: InventoryHistoryRecord[] = [
  {
    id: 'LOG-001',
    inventoryId: 'INV-001',
    type: InventoryHistoryType.INBOUND,
    date: '2022-03-15 09:30',
    operator: '张三',
    details: '采购入库，验收合格'
  },
  {
    id: 'LOG-002',
    inventoryId: 'INV-001',
    type: InventoryHistoryType.STOCKTAKE,
    date: '2022-09-20 14:15',
    operator: '李四',
    details: '季度盘点，账实相符'
  },
  {
    id: 'LOG-003',
    inventoryId: 'INV-002',
    type: InventoryHistoryType.INBOUND,
    date: '2023-01-10 10:00',
    operator: '王五',
    details: '整机随附入库'
  },
  {
    id: 'LOG-004',
    inventoryId: 'INV-002',
    type: InventoryHistoryType.TRANSFER,
    date: '2023-03-05 11:20',
    operator: '赵六',
    details: '从 总部仓 调拨至 北京分拨仓'
  },
  {
    id: 'LOG-005',
    inventoryId: 'INV-003',
    type: InventoryHistoryType.INBOUND,
    date: '2021-06-20 08:45',
    operator: '孙七',
    details: '采购入库'
  },
  {
    id: 'LOG-006',
    inventoryId: 'INV-003',
    type: InventoryHistoryType.TRANSFER,
    date: '2022-01-15 13:30',
    operator: '周八',
    details: '跨区调拨：华东 -> 华南'
  }
];

export const MOCK_STOCKTAKE_ORDERS: StocktakeOrder[] = [
  {
    id: 'ST-20231025-01',
    orderNumber: 'ST-20231025-01',
    store: '上海物流中心',
    region: '华东区',
    status: StocktakeStatus.COMPLETED,
    createDate: '2023-10-25',
    finishDate: '2023-10-26',
    creator: '管理员',
    totalItems: 45,
    abnormalItems: 0,
    items: []
  },
  {
    id: 'ST-20230915-02',
    orderNumber: 'ST-20230915-02',
    store: '北京分拨仓',
    region: '华北区',
    status: StocktakeStatus.COMPLETED,
    createDate: '2023-09-15',
    finishDate: '2023-09-15',
    creator: '李经理',
    totalItems: 12,
    abnormalItems: 1,
    items: []
  }
];

export const MOCK_TRANSFER_ORDERS: TransferOrder[] = [
  {
    id: 'TR-20231028-005',
    transferNumber: 'TR-20231028-005',
    sourceRegion: '华东区',
    sourceStore: '上海物流中心',
    targetRegion: '华北区',
    targetStore: '北京分拨仓',
    status: TransferStatus.IN_TRANSIT,
    createDate: '2023-10-28 14:30',
    creator: '管理员',
    totalItems: 3,
    totalAmount: 18500.00,
    remarks: '季度调拨，补充北京仓库存。',
    items: [
      {
        inventoryId: 'INV-001',
        batchCode: 'BAT-20230315-01',
        attachmentName: '重型纸卷夹',
        netValue: 12500.00
      },
      {
        inventoryId: 'INV-003',
        batchCode: 'BAT-20210620-11',
        attachmentName: '软包夹',
        netValue: 6000.00
      }
    ]
  },
  {
    id: 'TR-20231020-002',
    transferNumber: 'TR-20231020-002',
    sourceRegion: '华东区',
    sourceStore: '杭州仓',
    targetRegion: '华东区',
    targetStore: '上海物流中心',
    status: TransferStatus.COMPLETED,
    createDate: '2023-10-20 09:15',
    creator: '张三',
    totalItems: 1,
    totalAmount: 450.00,
    remarks: '退回中心仓。',
    items: [
      {
        inventoryId: 'INV-004',
        batchCode: 'BAT-20201105-03',
        attachmentName: '加长货叉',
        netValue: 450.00
      }
    ]
  }
];
