/**
 * MAPGO REAL-DATA FAQ & SUMMARY GENERATOR
 * Generates dynamic, context-aware FAQs and price tables from database attributes
 */

import { RealSpotData } from './nodes';

export function generateDynamicSpotFaqs(spot: RealSpotData): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  // 1. FAQ Giờ mở cửa / 24/7
  if (spot.parkingDetail?.is247) {
    faqs.push({
      question: `${spot.name} có mở cửa 24/24 không?`,
      answer: `Có, ${spot.name} hoạt động 24/7, phục vụ gửi xe cả ngày lẫn đêm và có bảo vệ trực suốt ca.`,
    });
  } else if (spot.parkingDetail?.openTime && spot.parkingDetail?.closeTime) {
    faqs.push({
      question: `Giờ mở cửa và đóng cửa của ${spot.name} là khi nào?`,
      answer: `${spot.name} mở cửa từ ${spot.parkingDetail.openTime} và đóng cửa lúc ${spot.parkingDetail.closeTime} hàng ngày.`,
    });
  }

  // 2. FAQ Giá gửi xe
  if (spot.pricingList && spot.pricingList.length > 0) {
    const carPrice = spot.pricingList.find(p => p.vehicleType === 'CAR' && p.priceType === 'HOUR');
    const bikePrice = spot.pricingList.find(p => p.vehicleType === 'BIKE' && p.priceType === 'HOUR');
    const overnightPrice = spot.pricingList.find(p => p.priceType === 'OVERNIGHT');

    let priceDetails = `Bảng giá gửi xe tại ${spot.name}: `;
    if (carPrice) priceDetails += `Ô tô: ${carPrice.amount.toLocaleString('vi-VN')}đ/giờ. `;
    if (bikePrice) priceDetails += `Xe máy: ${bikePrice.amount.toLocaleString('vi-VN')}đ/lượt. `;
    if (overnightPrice) priceDetails += `Gửi qua đêm: ${overnightPrice.amount.toLocaleString('vi-VN')}đ. `;

    faqs.push({
      question: `Giá gửi xe tại ${spot.name} là bao nhiêu?`,
      answer: priceDetails.trim(),
    });
  } else if (spot.pricePerHour && spot.pricePerHour > 0) {
    faqs.push({
      question: `Giá gửi xe tại ${spot.name} tính như thế nào?`,
      answer: `Giá gửi xe tham khảo tại ${spot.name} từ ${spot.pricePerHour.toLocaleString('vi-VN')}đ/giờ.`,
    });
  }

  // 3. FAQ Giới hạn chiều cao
  if (spot.parkingDetail?.heightLimit) {
    const limit = spot.parkingDetail.heightLimit;
    faqs.push({
      question: `Xe ô tô SUV, bán tải có vào được ${spot.name} không?`,
      answer: `${spot.name} có giới hạn chiều cao trần/hầm là ${limit}m. Hầu hết các dòng xe sedan, SUV 5-7 chỗ và bán tải phổ thông đều có thể ra vào thuận tiện nếu chiều cao dưới ${limit}m.`,
    });
  }

  // 4. FAQ Trạm sạc xe điện
  if (spot.parkingDetail?.hasEvCharging) {
    faqs.push({
      question: `${spot.name} có trạm sạc cho ô tô điện không?`,
      answer: `Có, ${spot.name} được trang bị trụ sạc xe điện, thuận tiện cho tài xế vừa đỗ xe vừa nạp năng lượng.`,
    });
  } else {
    faqs.push({
      question: `${spot.name} có hỗ trợ sạc xe điện không?`,
      answer: `Hiện tại ${spot.name} chưa có trụ sạc xe điện chuyên dụng. Quý khách có thể xem các trạm sạc gần nhất trên ứng dụng MapGo.`,
    });
  }

  return faqs;
}
