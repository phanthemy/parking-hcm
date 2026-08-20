/**
 * MAPGO DOMAIN LAYER - ENUMS & CONSTANTS
 * Single Source of Truth for all Categories, Vehicle Types, Pricing, and Methods
 */

export enum SpotCategory {
  PARKING = 'PARKING',
  EV_CHARGING = 'EV_CHARGING',
  GAS_STATION = 'GAS_STATION',
  GARAGE = 'GARAGE',
  CAR_WASH = 'CAR_WASH',
  RESTROOM = 'RESTROOM',
  RESCUE = 'RESCUE',
  INSPECTION = 'INSPECTION',
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  SERVICE = 'SERVICE',
}

export enum SpotStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  HIDDEN = 'HIDDEN',
}

export enum VehicleType {
  CAR = 'CAR',           // Ô tô 4-7 chỗ
  BIKE = 'BIKE',         // Xe máy
  TRUCK = 'TRUCK',       // Xe tải
  BUS = 'BUS',           // Xe khách / Xe bus
  EV = 'EV',             // Xe điện
}

export enum PriceType {
  HOUR = 'HOUR',               // Giá theo giờ đầu
  NEXT_HOUR = 'NEXT_HOUR',     // Giá các giờ tiếp theo
  OVERNIGHT = 'OVERNIGHT',     // Giá gửi qua đêm
  DAY = 'DAY',                 // Giá theo ngày / ca
  MONTH = 'MONTH',             // Giá theo tháng
  KWH = 'KWH',                 // Giá sạc điện theo kWh
}

export enum PaymentMethod {
  CASH = 'CASH',                     // Tiền mặt
  VIETQR = 'VIETQR',                 // Chuyển khoản QR ngân hàng
  CARD = 'CARD',                     // Thẻ POS (Visa/Mastercard/ATM)
  VETC_EPASS = 'VETC_EPASS',         // Thu phí không dừng VETC/ePass
  MOMO = 'MOMO',                     // Ví MoMo
  ZALOPAY = 'ZALOPAY',               // ZaloPay
}

export enum VerificationMethod {
  FIELD_VISIT = 'FIELD_VISIT',             // Thực địa bởi nhân viên MapGo
  BQL_CONFIRMED = 'BQL_CONFIRMED',         // Xác nhận trực tiếp từ Ban Quản Lý
  COMMUNITY = 'COMMUNITY',                 // Xác nhận từ phản hồi tài xế
  OFFICIAL_SOURCE = 'OFFICIAL_SOURCE',     // Nguồn dữ liệu mở / Chính phủ
  UNVERIFIED = 'UNVERIFIED',               // Chưa kiểm chứng
}

export enum ImageType {
  ENTRANCE = 'ENTRANCE',       // Lối vào / Cổng bãi
  EXIT = 'EXIT',               // Lối ra
  PARKING = 'PARKING',         // Khu vực đỗ xe trong hầm / sân
  PAYMENT = 'PAYMENT',         // Bảng giá / Quầy thu ngân
  CHARGER = 'CHARGER',         // Trụ sạc xe điện
  OVERVIEW = 'OVERVIEW',       // Toàn cảnh biển hiệu
}

export enum EvConnectorType {
  CCS2 = 'CCS2',
  TYPE2 = 'TYPE2',
  GB_T = 'GB_T',
  CHADEMO = 'CHADEMO',
}
