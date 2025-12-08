
import { Attachment, AttachmentCategory, AttachmentStatus, InventoryItem, InventorySource, InventoryHistoryRecord, InventoryHistoryType, InventoryStatus, StocktakeOrder, StocktakeStatus, TransferOrder, TransferStatus, Series, RequirementOrder, RequirementStatus, ApprovalRecord } from './types';

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

export const ATTACHMENT_CATEGORIES: Record<string, string[]> = {
  '货叉型属具': ['圆杆叉', '叉套', '加长叉', '折叠货叉', '砖叉', '调距叉', '侧移叉'],
  '夹持类属具': ['纸箱夹', '纸卷夹', '软包夹', '烟叶箱夹', '载荷稳定器', '液压式桶夹'],
  '旋转类属具': ['旋转器', '旋转抱夹'],
  '推出式属具': ['推出器', '推拉器', '前移叉'],
  '起吊类属具': ['起重臂', '集装箱吊具'],
  '箱斗式属具': ['倾翻斗', '铲斗'],
  '其它类属具': ['串杆', '带护臂挡货架']
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    batchCode: 'BAT-20230315-01',
    factoryCode: '3473280947',
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
    status: InventoryStatus.IN_STOCK,
    specifications: '夹持范围: 250-1600mm, 承载: 3000kg'
  },
  {
    id: 'INV-002',
    batchCode: 'BAT-20230110-05',
    factoryCode: '5829104432',
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
    status: InventoryStatus.RENTED,
    specifications: '侧移量: ±100mm, 宽度: 1200mm'
  },
  {
    id: 'INV-003',
    batchCode: 'BAT-20210620-11',
    factoryCode: '1938472201',
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
    status: InventoryStatus.IN_TRANSIT,
    specifications: '最大张开: 1900mm'
  },
  {
    id: 'INV-004',
    batchCode: 'BAT-20201105-03',
    factoryCode: '9081726354',
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
    status: InventoryStatus.DISPOSED,
    specifications: '长度: 2400mm, 截面: 150x60mm'
  },
   {
    id: 'INV-005',
    batchCode: 'BAT-20230801-02',
    factoryCode: '6758493021',
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
    status: InventoryStatus.LOSS,
    specifications: '适用砖块尺寸: 200-400mm'
  }
];

export const MOCK_HISTORY_LOGS: InventoryHistoryRecord[] = [
  {
    id: 'LOG-001',
    inventoryId: 'INV-001',
    type: InventoryHistoryType.INBOUND,
    date: '2022-03-15 09:30',
    operator: '张三',
    details: '采购入库，验收合格',
    referenceNumber: 'PO-20220310-001'
  },
  {
    id: 'LOG-002',
    inventoryId: 'INV-001',
    type: InventoryHistoryType.STOCKTAKE,
    date: '2022-09-20 14:15',
    operator: '李四',
    details: '季度盘点，账实相符',
    referenceNumber: 'ST-20220920-05'
  },
  {
    id: 'LOG-003',
    inventoryId: 'INV-002',
    type: InventoryHistoryType.INBOUND,
    date: '2023-01-10 10:00',
    operator: '王五',
    details: '整机随附入库',
    referenceNumber: 'EQ-FD30-8802' // Equipment Code
  },
  {
    id: 'LOG-004',
    inventoryId: 'INV-002',
    type: InventoryHistoryType.TRANSFER,
    date: '2023-03-05 11:20',
    operator: '赵六',
    details: '从 总部仓 调拨至 北京分拨仓',
    referenceNumber: 'TR-20230305-02'
  },
  {
    id: 'LOG-005',
    inventoryId: 'INV-003',
    type: InventoryHistoryType.INBOUND,
    date: '2021-06-20 08:45',
    operator: '孙七',
    details: '采购入库',
    referenceNumber: 'PO-20210601-88'
  },
  {
    id: 'LOG-006',
    inventoryId: 'INV-003',
    type: InventoryHistoryType.TRANSFER,
    date: '2022-01-15 13:30',
    operator: '周八',
    details: '跨区调拨：华东 -> 华南',
    referenceNumber: 'TR-20220115-09'
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

export const INITIAL_SERIES: Series[] = [
  {
    id: 'SER-001',
    name: '电动平衡重',
    code: '16',
    category: '工业车辆设备',
    createTime: '2024-04-24 18:35:00',
    creator: '沈成意',
    remarks: '--',
    powerSource: '电动',
    keyParameter: '额定负载',
    configurationParameters: [
      { id: 'cp1', name: '门架', dataType: '选项', options: '二节,三节', unit: '--', isRequired: true, status: '生效' },
      { id: 'cp2', name: '电池容量', dataType: '数字', options: '--', unit: 'Ah', isRequired: true, status: '生效' },
      { id: 'cp3', name: '轮胎', dataType: '选项', options: '实心,充气', unit: '--', isRequired: true, status: '生效' }
    ],
    attachments: [
      { id: 'att1', name: '侧移器', category: '货叉型属具', materialCategory: '侧移器', options: '1520, 1630', status: '生效' },
      { id: 'att2', name: '纸卷夹', category: '夹持类属具', materialCategory: '纸卷夹', options: '--', status: '生效' },
      { id: 'att3', name: '侧移叉', category: '货叉型属具', materialCategory: '货叉', options: '1800, 2000', status: '生效' }
    ],
    parameters: [
      { id: 'p1', name: '平台高度', dataType: '数字', options: '--', unit: 'm', isRequired: true, status: '生效' },
      { id: 'p2', name: '设备自重', dataType: '数字', options: '--', unit: 'kg', isRequired: true, status: '生效' },
      { id: 'p3', name: '车型大小', dataType: '选项', options: '大车,小车', unit: '--', isRequired: true, status: '生效' },
      { id: 'p4', name: '设备经营类型', dataType: '选项', options: '普通设备,特种设备', unit: '--', isRequired: true, status: '失效' },
      { id: 'p5', name: '设备尺寸长', dataType: '数字', options: '--', unit: 'm', isRequired: false, status: '失效' },
      { id: 'p6', name: '设备尺寸宽', dataType: '数字', options: '--', unit: 'm', isRequired: false, status: '失效' },
      { id: 'p7', name: '设备尺寸高', dataType: '数字', options: '--', unit: 'm', isRequired: false, status: '失效' },
      { id: 'p8', name: '实际最大举升高度', dataType: '数字', options: '--', unit: 'm', isRequired: false, status: '失效' },
      { id: 'p9', name: '额定负载', dataType: '数字', options: '--', unit: 'kg', isRequired: true, status: '生效' }
    ]
  },
  {
    id: 'SER-002',
    name: '内燃平衡重',
    code: '17',
    category: '工业车辆设备',
    createTime: '2024-04-24 18:35:00',
    creator: '沈成意',
    remarks: '--',
    powerSource: '柴油',
    configurationParameters: [],
    attachments: [],
    parameters: []
  },
  {
    id: 'SER-003',
    name: '仓储叉车',
    code: '18',
    category: '工业车辆设备',
    createTime: '2024-05-10 09:15:00',
    creator: '李四',
    remarks: '主要用于室内仓库',
    powerSource: '电动',
    configurationParameters: [],
    attachments: [],
    parameters: []
  }
];

export const MOCK_REQUIREMENT_ORDERS: RequirementOrder[] = [
  {
    id: '1',
    requestNumber: 'SSQ25120300030',
    quantity: 2,
    equipmentInfo: '电动托盘车-3000千克',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-06',
    deliveryLocation: '山东省济宁市兖...',
    requestStore: '青岛叉车服务中心',
    receiveStore: '青岛叉车服务中心',
    receiveWarehouse: '青岛叉车仓'
  },
  {
    id: '2',
    requestNumber: 'SSQ25120300022',
    quantity: 1,
    equipmentInfo: '电动平衡重-3000千克x1',
    status: RequirementStatus.APPROVED,
    requiredDate: '2026-01-01',
    deliveryLocation: '上海市闵行区颛...',
    requestStore: '上海叉车服务中心',
    receiveStore: '上海叉车服务中心',
    receiveWarehouse: '上海叉车仓'
  },
  {
    id: '3',
    requestNumber: 'SSQ25120200025',
    quantity: 3,
    equipmentInfo: '套筒型升降车-9.2米x3',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-05',
    deliveryLocation: '忠清北道清州市...',
    requestStore: '清州服务中心',
    receiveStore: '清州服务中心',
    receiveWarehouse: '韩国清州仓'
  },
  {
    id: '4',
    requestNumber: 'SSQ25120100054',
    quantity: 4,
    equipmentInfo: '电动直臂-26米x4',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-04',
    deliveryLocation: '忠清北道清州市...',
    requestStore: '清州服务中心',
    receiveStore: '清州服务中心',
    receiveWarehouse: '韩国清州仓'
  },
  {
    id: '5',
    requestNumber: 'SSQ25120100053',
    quantity: 6,
    equipmentInfo: '电动曲臂-14米x2, 电动...',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-04',
    deliveryLocation: '忠清北道清州市...',
    requestStore: '清州服务中心',
    receiveStore: '清州服务中心',
    receiveWarehouse: '韩国清州仓'
  },
  {
    id: '6',
    requestNumber: 'SSQ25120100051',
    quantity: 34,
    equipmentInfo: '剪叉-6米x34',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-04',
    deliveryLocation: '忠清北道清州市...',
    requestStore: '清州服务中心',
    receiveStore: '清州服务中心',
    receiveWarehouse: '韩国清州仓'
  },
  {
    id: '7',
    requestNumber: 'SSQ25120100050',
    quantity: 16,
    equipmentInfo: '剪叉-6米x16',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-04',
    deliveryLocation: '山东省威海市荣...',
    requestStore: '华城服务中心',
    receiveStore: '华城服务中心',
    receiveWarehouse: '韩国华城配件仓'
  },
  {
    id: '8',
    requestNumber: 'SSQ25113000006',
    quantity: 10,
    equipmentInfo: '电动直臂-20米x10',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-12-10',
    deliveryLocation: '浙江省宁波市海...',
    requestStore: '宁波服务中心',
    receiveStore: '宁波服务中心',
    receiveWarehouse: '宁波仓'
  },
  {
    id: '9',
    requestNumber: 'SSQ25112400028',
    quantity: 2,
    equipmentInfo: '电动直臂-20米x2',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-11-27',
    deliveryLocation: '江苏省如东县长...',
    requestStore: '南通第二服务中心',
    receiveStore: '南通第二服务中心',
    receiveWarehouse: '如东仓库'
  },
  {
    id: '10',
    requestNumber: 'SSQ25111700033',
    quantity: 22,
    equipmentInfo: '剪叉-14米x3,剪叉-16...',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-11-30',
    deliveryLocation: '沙特区域达曼市',
    requestStore: '达曼服务中心',
    receiveStore: '达曼服务中心',
    receiveWarehouse: '沙特达曼仓'
  },
  {
    id: '11',
    requestNumber: 'SSQ25110400027',
    quantity: 2,
    equipmentInfo: '剪叉-10米x2',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-11-07',
    deliveryLocation: '浙江省衢州市柯...',
    requestStore: '测试衢州服务中心',
    receiveStore: '测试衢州服务中心',
    receiveWarehouse: '衢州仓'
  },
  {
    id: '12',
    requestNumber: 'SSQ25110400010',
    quantity: 2,
    equipmentInfo: '电动直臂-20米x2',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-11-07',
    deliveryLocation: '浙江省杭州市临...',
    requestStore: '杭州余杭服务中心',
    receiveStore: '杭州余杭服务中心',
    receiveWarehouse: '余杭仓'
  },
  {
    id: '13',
    requestNumber: 'SSQ25102700054',
    quantity: 1,
    equipmentInfo: '剪叉-10米x1',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-10-30',
    deliveryLocation: '浙江省衢州市柯...',
    requestStore: '测试衢州服务中心',
    receiveStore: '测试衢州服务中心',
    receiveWarehouse: '衢州仓'
  },
  {
    id: '14',
    requestNumber: 'SSQ25101100010',
    quantity: 2,
    equipmentInfo: '电动平衡重-1600千克x2',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-10-31',
    deliveryLocation: '重庆市市辖区九...',
    requestStore: '重庆叉车服务中心',
    receiveStore: '重庆叉车服务中心',
    receiveWarehouse: '重庆叉车仓'
  },
  {
    id: '15',
    requestNumber: 'SSQ25100700012',
    quantity: 1,
    equipmentInfo: '电动直臂-32米x1',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-10-12',
    deliveryLocation: '广西壮族自治区...',
    requestStore: '城投华铁钦州服...',
    receiveStore: '城投华铁钦州服...',
    receiveWarehouse: '城投钦州仓'
  },
  {
    id: '16',
    requestNumber: 'SSQ25093000013',
    quantity: 2,
    equipmentInfo: '电动直臂-20米x2',
    status: RequirementStatus.APPROVED,
    requiredDate: '2025-10-03',
    deliveryLocation: '河南省开封市龙...',
    requestStore: '商丘服务中心',
    receiveStore: '商丘服务中心',
    receiveWarehouse: '开封仓'
  }
];

export const MOCK_APPROVAL_RECORDS: ApprovalRecord[] = [
  {
    id: '1',
    title: '设备采购申请',
    approvalNumber: '2025120713261862...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700007',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '赵俊',
    submitTime: '2025-12-07 13:26:18',
    startTime: '2025-12-07 13:26:18'
  },
  {
    id: '2',
    title: '设备采购申请',
    approvalNumber: '202512071302253...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700006',
    status: '审批拒绝',
    tenant: '浙江大黄蜂',
    submitter: '郑幸幸',
    submitTime: '2025-12-07 13:02:25',
    startTime: '2025-12-07 13:02:25'
  },
  {
    id: '3',
    title: '设备采购申请',
    approvalNumber: '2025120712254941...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700005',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '孙贤明',
    submitTime: '2025-12-07 12:25:49',
    startTime: '2025-12-07 12:25:49'
  },
  {
    id: '4',
    title: '设备采购申请',
    approvalNumber: '202512071222256...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700004',
    status: '审批拒绝',
    tenant: '浙江大黄蜂',
    submitter: '潘华健',
    submitTime: '2025-12-07 12:22:25',
    startTime: '2025-12-07 12:22:25'
  },
  {
    id: '5',
    title: '设备采购申请',
    approvalNumber: '2025120712180328...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700003',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '孙贤明',
    submitTime: '2025-12-07 12:18:03',
    startTime: '2025-12-07 12:18:03'
  },
  {
    id: '6',
    title: '设备采购申请',
    approvalNumber: '202512070941420...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700002',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '陈强',
    submitTime: '2025-12-07 09:41:42',
    startTime: '2025-12-07 09:41:42'
  },
  {
    id: '7',
    title: '设备采购申请',
    approvalNumber: '202512070924188...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120700001',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '林君超',
    submitTime: '2025-12-07 09:24:18',
    startTime: '2025-12-07 09:24:18'
  },
  {
    id: '8',
    title: '设备采购申请',
    approvalNumber: '202512062104553...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120600037',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '郝薪程',
    submitTime: '2025-12-06 21:04:55',
    startTime: '2025-12-06 21:04:55'
  },
  {
    id: '9',
    title: '设备采购申请',
    approvalNumber: '2025120617304281...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120600036',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '郑幸幸',
    submitTime: '2025-12-06 17:30:42',
    startTime: '2025-12-06 17:30:42'
  },
  {
    id: '10',
    title: '设备采购申请',
    approvalNumber: '2025120617215443...',
    businessType: '设备采购申请',
    businessNumber: 'SSQ25120600035',
    status: '审批通过',
    tenant: '浙江大黄蜂',
    submitter: '郑幸幸',
    submitTime: '2025-12-06 17:21:55',
    startTime: '2025-12-06 17:21:55'
  }
];
