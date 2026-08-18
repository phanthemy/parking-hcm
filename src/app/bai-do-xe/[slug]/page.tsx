import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Mapping slug -> tên quận huyện đẹp + từ khóa SEO + nội dung độc nhất
const DISTRICT_CONFIG: Record<string, {
  name: string;
  nameVi: string;
  keywords: string[];
  description: string;
  uniqueContent: string;
}> = {
  'quan-1': {
    name: 'Quận 1',
    nameVi: 'Quận 1',
    keywords: ['bãi giữ xe Quận 1', 'bãi đỗ xe Quận 1', 'chỗ đậu xe trung tâm Sài Gòn', 'bãi giữ xe Bến Thành'],
    description: 'Tìm bãi giữ xe, chỗ đậu xe ô tô, xe máy tại Quận 1 TP.HCM. Danh sách bãi xe gần Bến Thành, Nguyễn Huệ, phố đi bộ — chỉ đường GPS real-time.',
    uniqueContent: 'Quận 1 là trung tâm hành chính và thương mại sôi động nhất Sài Gòn với mật độ phương tiện dày đặc, đặc biệt quanh các tuyến phố đi bộ Nguyễn Huệ, chợ Bến Thành, nhà hát Thành Phố và phố Tây Bùi Viện. Các bãi đỗ xe ô tô tại đây đa phần nằm dưới tầng hầm các tòa nhà phức hợp (Vincom, Takashimaya, Bitexco) hoặc các bãi gửi xe thông minh có thu phí theo giờ. MapGo cập nhật liên tục các điểm đỗ xe ô tô, xe máy khả dụng quanh Quận 1 kèm bảng giá tham khảo giúp bạn an tâm đỗ xe không lo phạt nguội.',
  },
  'quan-3': {
    name: 'Quận 3',
    nameVi: 'Quận 3',
    keywords: ['bãi giữ xe Quận 3', 'bãi đỗ xe Quận 3', 'chỗ đậu xe Quận 3'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 3 TP.HCM. Bãi xe gần Võ Văn Tần, Nam Kỳ Khởi Nghĩa — cập nhật mới nhất.',
    uniqueContent: 'Quận 3 nổi bật với các trục đường một chiều nhiều cây xanh cổ thụ như Nam Kỳ Khởi Nghĩa, Pasteur, Võ Văn Tần và Nguyễn Thị Minh Khai. Việc tìm chỗ đậu xe ô tô trên lòng đường tại Quận 3 bị kiểm soát nghiêm ngặt. Các bãi đỗ xe ô tô và bãi giữ xe máy tập trung chủ yếu quanh khu vực hồ Con Rùa, các trung tâm hội nghị tiệc cưới và bệnh viện tuyến đầu (Tai Mũi Họng, Mắt TP.HCM).',
  },
  'quan-5': {
    name: 'Quận 5',
    nameVi: 'Quận 5',
    keywords: ['bãi giữ xe Quận 5', 'bãi giữ xe Chợ Lớn', 'chỗ đậu xe Quận 5'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 5 TP.HCM (khu Chợ Lớn). Bãi xe gần Thuận Kiều Plaza, Đại lộ Hùng Vương.',
    uniqueContent: 'Quận 5 là trái tim khu vực Chợ Lớn với hoạt động buôn bán giao thương tấp nập suốt ngày đêm. Các tuyến phố như Trần Hưng Đạo, Nguyễn Trãi, Hải Thượng Lãn Ông thường xuyên có lượng xe máy và xe tải bốc dỡ hàng đông đúc. Các bãi giữ xe ô tô và bãi gửi xe máy phân bố quanh khu vực chợ Kim Biên, chợ An Đông, The Garden Mall (Thuận Kiều) và cụm bệnh viện Chợ Rẫy, Hùng Vương, Đại học Y Dược.',
  },
  'quan-7': {
    name: 'Quận 7',
    nameVi: 'Quận 7',
    keywords: ['bãi giữ xe Quận 7', 'bãi giữ xe Phú Mỹ Hưng', 'chỗ đậu xe Quận 7'],
    description: 'Tìm bãi giữ xe, chỗ đậu xe ô tô tại Quận 7 TP.HCM — khu Phú Mỹ Hưng, Crescent Mall, SC VivoCity. Chỉ đường GPS tức thì.',
    uniqueContent: 'Quận 7 sở hữu hệ thống hạ tầng giao thông hiện đại và quy hoạch thông thoáng bậc nhất khu Nam TP.HCM, đặc biệt là đô thị kiểu mẫu Phú Mỹ Hưng. Nhu cầu đỗ xe ô tô tại đây rất cao quanh các trung tâm thương mại lớn (Crescent Mall, SC VivoCity, Lotte Mart) và trung tâm triển lãm SECC. Ngoài các bãi giữ xe tầng hầm TTTM, khu vực ven hồ Bán Nguyệt và đường Nguyễn Văn Linh cũng có các bãi gửi xe bãi rộng có mái che an toàn.',
  },
  'quan-10': {
    name: 'Quận 10',
    nameVi: 'Quận 10',
    keywords: ['bãi giữ xe Quận 10', 'bãi đỗ xe Quận 10', 'chỗ đậu xe Lý Thường Kiệt'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 10 TP.HCM. Bãi xe gần Lý Thường Kiệt, Cao Thắng, bệnh viện Quận 10.',
    uniqueContent: 'Quận 10 tập trung nhiều trường đại học (Bách Khoa, Kinh Tế), cụm bệnh viện 115, Nhi Đồng 1, Vạn Hạnh Mall và các tuyến phố ẩm thực sầm uất như Sư Vạn Hạnh, Tô Hiến Thành. Các bãi gửi xe ô tô và xe máy tại Quận 10 phục vụ lưu lượng người lớn mỗi ngày, tập trung quanh các TTTM, bãi đất trống được cấp phép gần sân vận động Thống Nhất và công viên Lê Thị Riêng.',
  },
  'binh-thanh': {
    name: 'Bình Thạnh',
    nameVi: 'Quận Bình Thạnh',
    keywords: ['bãi giữ xe Bình Thạnh', 'bãi đỗ xe Bình Thạnh TP.HCM', 'chỗ đậu xe Bình Thạnh'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Bình Thạnh TP.HCM. Bãi xe gần Landmark 81, Hàng Xanh, cầu Sài Gòn.',
    uniqueContent: 'Quận Bình Thạnh là cầu nối giao thông quan trọng giữa trung tâm TP.HCM và TP Thủ Đức với các điểm nóng ngã tư Hàng Xanh, đường Điện Biên Phủ, Xô Viết Nghệ Tĩnh và khu đô thị Vinhomes Central Park (Landmark 81). Điểm đỗ xe ô tô tại Bình Thạnh có sự kết hợp giữa bãi xe hiện đại trong các tòa tháp cao tầng và các bãi giữ xe truyền thống khu vực Thanh Đa, Phan Xích Long nối dài.',
  },
  'phu-nhuan': {
    name: 'Phú Nhuận',
    nameVi: 'Quận Phú Nhuận',
    keywords: ['bãi giữ xe Phú Nhuận', 'bãi đỗ xe Phú Nhuận', 'chỗ đậu xe Phan Xích Long'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Phú Nhuận TP.HCM. Bãi xe gần Phan Xích Long, Hoàng Văn Thụ, Nguyễn Kiệm.',
    uniqueContent: 'Quận Phú Nhuận nổi tiếng là thiên đường ẩm thực và cà phê với trục đường Phan Xích Long, Huỳnh Văn Bánh và Nguyễn Văn Trỗi. Do mặt đường Phan Xích Long tập trung hàng trăm quán ăn, quán cafe nên nhu cầu tìm chỗ đậu ô tô và bãi gửi xe máy vào giờ ăn trưa và buổi tối rất cao. MapGo tổng hợp các bãi đỗ xe quanh khu vực công viên Gia Định, đường Hoa Sứ, Hoa Phượng để người dân tiện ghé quán.',
  },
  'tan-binh': {
    name: 'Tân Bình',
    nameVi: 'Quận Tân Bình',
    keywords: ['bãi giữ xe Tân Bình', 'bãi giữ xe sân bay Tân Sơn Nhất', 'chỗ đậu xe Tân Bình'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Tân Bình TP.HCM. Bãi xe gần sân bay Tân Sơn Nhất, Trường Chinh, Cộng Hòa.',
    uniqueContent: 'Quận Tân Bình là nơi tọa lạc của Cảng hàng không quốc tế Tân Sơn Nhất và các trục giao thông trọng điểm như Cộng Hòa, Trường Chinh, Hoàng Văn Thụ. Nhu cầu bãi gửi xe ô tô qua đêm, gửi xe dài ngày đi máy bay tại Tân Bình là cực lớn. MapGo cung cấp vị trí nhà xe sân bay TCP Park và các bãi giữ xe tư nhân uy tín quanh đường Bạch Đằng, Yên Thế, Hồng Hà với mức giá tiết kiệm.',
  },
  'thu-duc': {
    name: 'TP Thủ Đức',
    nameVi: 'Thành phố Thủ Đức',
    keywords: ['bãi giữ xe Thủ Đức', 'bãi đỗ xe TP Thủ Đức', 'chỗ đậu xe Thủ Đức'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại TP Thủ Đức TP.HCM — khu vực Thảo Điền, An Phú, Linh Trung. Chỉ đường GPS real-time.',
    uniqueContent: 'TP Thủ Đức có diện tích rộng lớn trải dài từ khu đô thị mới Thủ Thiêm, Thảo Điền, An Phú cho đến khu công nghệ cao và làng đại học Quốc gia. Hạ tầng bãi đỗ xe tại TP Thủ Đức rất đa dạng: từ các bãi xe hiện đại tại Vincom Mega Mall Thảo Điền, Sala Đại Quang Minh, Masteri An Phú cho đến các bãi gửi xe tải, xe container rộng rãi dọc Xa lộ Hà Nội và Vành đai 2.',
  },
  'binh-tan': {
    name: 'Bình Tân',
    nameVi: 'Quận Bình Tân',
    keywords: ['bãi giữ xe Bình Tân', 'bãi giữ xe Aeon Mall Bình Tân', 'chỗ đậu xe Bình Tân'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Bình Tân TP.HCM. Bãi xe gần Aeon Mall Bình Tân, Tên Lửa, Quốc lộ 1A.',
    uniqueContent: 'Quận Bình Tân là quận đông dân nhất TP.HCM với tâm điểm là khu đô thị Tên Lửa, TTTM Aeon Mall Bình Tân, bến xe Miền Tây và KCN Tân Tạo. Lượng phương tiện cá nhân và xe khách liên tỉnh ra vào quận mỗi ngày rất lớn. Bãi đỗ xe ô tô tại Bình Tân tập trung nhiều bãi gửi xe bãi đất có mái che giá mềm quanh đường Vành Đai Trong, Tên Lửa và khu vực Bến xe Miền Tây.',
  },
  'quan-4': {
    name: 'Quận 4',
    nameVi: 'Quận 4',
    keywords: ['bãi giữ xe Quận 4', 'bãi đỗ xe Quận 4', 'chỗ đậu xe Quận 4'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 4 TP.HCM. Bãi xe gần Tôn Đản, Khánh Hội, Bến Vân Đồn.',
    uniqueContent: 'Quận 4 được bao bọc bởi hệ thống sông rạch với các trục đường ven sông Bến Vân Đồn, Tôn Thất Thuyết và đường ẩm thực Vĩnh Khánh, Hoàng Diệu. Các dự án căn hộ cao cấp dọc Bến Vân Đồn có bãi giữ xe ngầm hiện đại, đồng thời các bãi đỗ xe ngoài trời quanh công viên Khánh Hội đáp ứng tốt nhu cầu đậu xe cho thực khách ghé ăn uống.',
  },
  'quan-6': {
    name: 'Quận 6',
    nameVi: 'Quận 6',
    keywords: ['bãi giữ xe Quận 6', 'bãi giữ xe Chợ Bình Tây', 'chỗ đậu xe Quận 6'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 6 TP.HCM. Bãi xe gần Bình Tây, Phú Lâm, Hậu Giang.',
    uniqueContent: 'Quận 6 mang đậm nét văn hóa kinh doanh Chợ Lớn với chợ đầu mối Bình Tây, bến xe Chợ Lớn, vòng xoay Phú Lâm và công viên Phú Lâm. Bãi giữ xe tại Quận 6 chủ yếu phục vụ tiểu thương và khách mua sỉ với các bãi đỗ xe ô tô tải giao hàng và bãi gửi xe máy 24/7 dọc đường Hậu Giang, Nguyễn Văn Luông.',
  },
  'quan-8': {
    name: 'Quận 8',
    nameVi: 'Quận 8',
    keywords: ['bãi giữ xe Quận 8', 'bãi đỗ xe Quận 8', 'chỗ đậu xe Quận 8'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 8 TP.HCM. Bãi xe gần Tạ Quang Bửu, Dương Bá Trạc, Phạm Thế Hiển.',
    uniqueContent: 'Quận 8 có địa hình kênh rạch chằng chịt nối liền Quận 5 và khu Nam Sài Gòn. Các điểm đỗ xe ô tô tập trung quanh khu hành chính Tạ Quang Bửu, chung cư cao tầng dọc đại lộ Võ Văn Kiệt và khu dân cư Trung Sơn giáp ranh Quận 7.',
  },
  'quan-11': {
    name: 'Quận 11',
    nameVi: 'Quận 11',
    keywords: ['bãi giữ xe Quận 11', 'bãi giữ xe Đầm Sen', 'chỗ đậu xe Quận 11'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 11 TP.HCM. Bãi xe gần Công viên Đầm Sen, Lạc Long Quân, Lê Đại Hành.',
    uniqueContent: 'Quận 11 nổi tiếng với Công viên Văn hóa Đầm Sen, đường Lạc Long Quân và TTTM The Parkson Flemington / EverRich trên đường 3/2. Vào dịp cuối tuần và ngày lễ, nhu cầu gửi xe ô tô và xe máy tham quan Đầm Sen tăng vọt, các bãi giữ xe quanh cổng Hòa Bình và Lạc Long Quân luôn sẵn sàng phục vụ.',
  },
  'quan-12': {
    name: 'Quận 12',
    nameVi: 'Quận 12',
    keywords: ['bãi giữ xe Quận 12', 'bãi đỗ xe Quận 12', 'chỗ đậu xe Quận 12'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận 12 TP.HCM. Bãi xe gần Trường Chinh, Nguyễn Ảnh Thủ, An Sương.',
    uniqueContent: 'Quận 12 là cửa ngõ giao thương phía Bắc TP.HCM với Quốc lộ 1A, Quốc lộ 22, ngã tư An Sương và công viên phần mềm Quang Trung. Nhu cầu đỗ xe ô tô, xe tải đường dài và xe công nghệ quanh khu vực Nguyễn Ảnh Thủ, Lê Văn Khương rất phổ biến với nhiều bãi đất rộng rãi.',
  },
  'tan-phu': {
    name: 'Tân Phú',
    nameVi: 'Quận Tân Phú',
    keywords: ['bãi giữ xe Tân Phú', 'bãi đỗ xe Tân Phú', 'chỗ đậu xe Tân Phú'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Tân Phú TP.HCM. Bãi xe gần Lũy Bán Bích, Aeon Mall Tân Phú, Hòa Bình.',
    uniqueContent: 'Quận Tân Phú có tốc độ đô thị hóa nhanh với điểm nhấn là Aeon Mall Tân Phú Celadon và các trục đường Lũy Bán Bích, Thoại Ngọc Hầu, Tân Kỳ Tân Quý. Bãi đỗ xe ô tô tại Tân Phú rất phát triển quanh khu đô thị Celadon City và các chợ truyền thống Tân Hương, Hiệp Tân.',
  },
  'go-vap': {
    name: 'Gò Vấp',
    nameVi: 'Quận Gò Vấp',
    keywords: ['bãi giữ xe Gò Vấp', 'bãi đỗ xe Gò Vấp', 'chỗ đậu xe Gò Vấp'],
    description: 'Tìm bãi giữ xe ô tô, xe máy tại Quận Gò Vấp TP.HCM. Bãi xe gần Nguyễn Oanh, Phan Văn Trị, Quang Trung.',
    uniqueContent: 'Gò Vấp là quận có mật độ dân cư và phương tiện lưu thông đông đúc bậc nhất Sài Gòn trên các tuyến đường Quang Trung, Phan Văn Trị, Nguyễn Oanh. Các bãi đỗ xe ô tô tập trung quanh Lotte Mart Gò Vấp, Emart Phan Văn Trị và các bãi xe tư nhân có mái che gần sân bay.',
  },

  // ===== 5 HUYỆN NGOẠI THÀNH (ĐỢT 1) =====
  'binh-chanh': {
    name: 'Bình Chánh',
    nameVi: 'Huyện Bình Chánh',
    keywords: ['bãi đỗ xe Bình Chánh', 'bãi giữ xe Bình Chánh TP.HCM', 'chỗ đậu xe Bình Chánh', 'bãi gửi xe Quốc lộ 1A Bình Chánh'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại huyện Bình Chánh: khu công nghiệp Lê Minh Xuân, Quốc lộ 1A, Tỉnh lộ 10. Bản đồ GPS real-time, cập nhật từ cộng đồng MapGo.',
    uniqueContent: 'Bình Chánh là huyện cửa ngõ phía Tây TP.HCM, tập trung nhiều khu công nghiệp lớn như Lê Minh Xuân, Vĩnh Lộc, cùng các tuyến giao thông huyết mạch như Quốc lộ 1A, Quốc lộ 50 và Tỉnh lộ 10. Do lưu lượng xe tải và xe container qua lại khu công nghiệp cao, khu vực trung tâm huyện (thị trấn Tân Túc) thường gặp tình trạng thiếu chỗ đậu xe vào giờ cao điểm sáng và chiều. Các bãi đỗ xe tại đây chủ yếu tập trung quanh chợ Bình Chánh, khu vực Bệnh viện huyện Bình Chánh và các tuyến đường dân sinh gần Quốc lộ 1A. MapGo cập nhật vị trí bãi xe theo dữ liệu cộng đồng, giúp tài xế xe tải, xe con dễ dàng tìm chỗ đậu an toàn, tránh khu vực cấm dừng đỗ dọc Quốc lộ.',
  },
  'hoc-mon': {
    name: 'Hóc Môn',
    nameVi: 'Huyện Hóc Môn',
    keywords: ['bãi đỗ xe Hóc Môn', 'bãi giữ xe Hóc Môn TP.HCM', 'chỗ đậu xe Hóc Môn', 'bãi xe chợ đầu mối Hóc Môn'],
    description: 'Tìm bãi giữ xe, bãi đỗ xe ô tô xe máy tại huyện Hóc Môn: Chợ đầu mối Hóc Môn, Quốc lộ 22, Ngã tư An Sương, Đặng Thúc Vịnh. Bản đồ GPS chính xác.',
    uniqueContent: 'Hóc Môn giữ vai trò là vùng cửa ngõ Tây Bắc kết nối TP.HCM với Tây Ninh và cửa khẩu Mộc Bài qua tuyến Quốc lộ 22. Điểm nóng giao thông lớn nhất huyện là Chợ đầu mối nông sản thực phẩm Hóc Môn trên đường Nguyễn Thị Sóc – nơi tập trung hàng nghìn lượt xe tải, xe ba gác và ô tô giao thương mỗi đêm. Ngoài ra, các trục đường Đặng Thúc Vịnh, Tô Ký và khu vực quanh Thị trấn Hóc Môn cũng có nhiều bãi đỗ xe ô tô và bãi giữ xe máy phục vụ nhu cầu sinh hoạt của cư dân các khu đô thị mới.',
  },
  'cu-chi': {
    name: 'Củ Chi',
    nameVi: 'Huyện Củ Chi',
    keywords: ['bãi đỗ xe Củ Chi', 'bãi giữ xe Củ Chi TP.HCM', 'bãi đỗ xe địa đạo Củ Chi', 'chỗ đậu xe Củ Chi'],
    description: 'Tìm bãi đỗ xe ô tô, xe du lịch tại huyện Củ Chi: Khu di tích Địa đạo Củ Chi, Tỉnh lộ 8, Quốc lộ 22 (Xa lộ Xuyên Á). Dữ liệu bản đồ GPS cập nhật mới nhất.',
    uniqueContent: 'Củ Chi là huyện ngoại thành phía Tây Bắc với tuyến Xa lộ Xuyên Á (Quốc lộ 22) xuyên suốt và điểm đến lịch sử nổi tiếng Địa đạo Bến Dược, Địa đạo Bến Đình. Nhu cầu đỗ xe tại Củ Chi mang tính đặc thù cao: xe tour du lịch, xe khách 45 chỗ và xe gia đình đổ về tham quan di tích vào cuối tuần. Các bãi đỗ xe ô tô rộng rãi phân bố chủ yếu tại khu di tích Địa đạo, khu công nghiệp Tây Bắc Củ Chi, khu vực ngã tư Tỉnh lộ 8 và trung tâm thị trấn Củ Chi.',
  },
  'nha-be': {
    name: 'Nhà Bè',
    nameVi: 'Huyện Nhà Bè',
    keywords: ['bãi đỗ xe Nhà Bè', 'bãi giữ xe Nhà Bè TP.HCM', 'chỗ đậu xe cảng Hiệp Phước', 'bãi gửi xe Nguyễn Hữu Thọ'],
    description: 'Tìm bãi đỗ xe ô tô, bãi giữ xe máy tại huyện Nhà Bè: Cảng Hiệp Phước, đường Nguyễn Hữu Thọ, Lê Văn Lương, Huỳnh Tấn Phát. Chỉ đường GPS chuẩn xác.',
    uniqueContent: 'Nhà Bè nằm ở khu vực phía Nam Sài Gòn, kết nối mật thiết với Quận 7 và cụm cảng biển quốc tế Hiệp Phước. Trục đường huyết mạch Nguyễn Hữu Thọ và Lê Văn Lương quy tụ hàng chục dự án căn hộ cao cấp, tạo ra nhu cầu gửi xe ô tô qua đêm rất lớn. Bên cạnh các bãi xe hầm chung cư, các bãi đỗ xe tải, xe container và bãi giữ xe cho công nhân chuyên gia hoạt động sôi nổi tại Khu công nghiệp Hiệp Phước và khu vực bến Phà Bình Khánh.',
  },
  'can-gio': {
    name: 'Cần Giờ',
    nameVi: 'Huyện Cần Giờ',
    keywords: ['bãi đỗ xe Cần Giờ', 'bãi giữ xe Cần Giờ TP.HCM', 'bãi xe bãi biển 30/4 Cần Giờ', 'bãi giữ xe Phà Bình Khánh'],
    description: 'Tìm bãi đỗ xe ô tô, xe du lịch tại huyện Cần Giờ: Bãi biển 30/4, Chợ Hàng Dương, Phà Bình Khánh, Khu du lịch Vàm Sát, Rừng Sác. Bản đồ chỉ đường GPS.',
    uniqueContent: 'Cần Giờ là huyện ven biển duy nhất của TP.HCM, nổi danh với Khu dự trữ sinh quyển thế giới và bãi biển 30/4. Tuyến đường huyết mạch Rừng Sác dài hơn 30km chạy thẳng từ Phà Bình Khánh đến thị trấn Cần Thạnh. Bãi đỗ xe tại Cần Giờ chủ yếu phục vụ các đoàn xe du lịch gia đình, xe phượt dã ngoại cuối tuần tại các điểm dừng chân nổi tiếng: chợ hải sản Hàng Dương, khu du lịch sinh thái Vàm Sát, đảo Khỉ và bãi biển 30/4.',
  },
};

export async function generateStaticParams() {
  return Object.keys(DISTRICT_CONFIG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = DISTRICT_CONFIG[slug];
  if (!config) return {};

  const title = `Bãi đỗ xe ${config.name} TP.HCM – Tìm chỗ đậu ô tô, xe máy gần đây | MapGo`;
  return {
    title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `https://mapgo.vn/bai-do-xe/${slug}`,
    },
    openGraph: {
      title,
      description: config.description,
      url: `https://mapgo.vn/bai-do-xe/${slug}`,
      siteName: 'MapGo.vn',
      type: 'website',
      locale: 'vi_VN',
    },
  };
}

export default async function BaiXeDistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = DISTRICT_CONFIG[slug];
  if (!config) notFound();

  // Lấy bãi xe theo quận từ DB
  let spots: { id: string; slug: string | null; name: string; address: string; carSlots: number | null; bikeSlots: number | null; type: string; pricePerHour: number | null }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: { in: ['PARKING_LOT', 'parking'] },
        OR: [
          { address: { contains: config.name } },
          { address: { contains: config.nameVi } },
        ],
      },
      select: { id: true, slug: true, name: true, address: true, carSlots: true, bikeSlots: true, type: true, pricePerHour: true },
      take: 40,
    });
  } catch (e) {
    console.error('Landing page DB error:', e);
  }

  const ALL_DISTRICTS = Object.entries(DISTRICT_CONFIG);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>MapGo.vn</Link>
        <span>›</span>
        <Link href="/bai-do-xe-tphcm" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Bãi đỗ xe TP.HCM</Link>
        <span>›</span>
        <span style={{ color: '#cbd5e1' }}>{config.name}</span>
      </nav>

      {/* H1 */}
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        🅿️ Bãi đỗ xe {config.name} – Tìm chỗ đậu xe gần bạn
      </h1>
      
      {/* H2 */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#a5b4fc', marginBottom: 20, lineHeight: 1.5 }}>
        Bản đồ tiện ích tìm bãi đỗ xe ô tô, xe máy khu vực {config.name}, TP.HCM
      </h2>

      {/* Unique Content Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 28,
        lineHeight: 1.8,
        color: '#cbd5e1',
        fontSize: 15,
      }}>
        {config.uniqueContent}
      </div>

      {/* CTA button */}
      <div style={{ marginBottom: 36 }}>
        <Link
          href={`/?q=${encodeURIComponent(config.name)}&type=PARKING_LOT`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'transform 0.2s',
          }}
        >
          📍 Xem bản đồ bãi xe {config.name}
        </Link>
      </div>

      {/* Danh sách bãi xe */}
      {spots.length > 0 ? (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: 16,
            borderLeft: '4px solid #6366f1',
            paddingLeft: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Danh sách bãi đỗ xe tại {config.name}</span>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>{spots.length} địa điểm</span>
          </h3>

          <div style={{ display: 'grid', gap: 12 }}>
            {spots.map((spot) => (
              <Link
                key={spot.id}
                href={`/bai-xe/${spot.slug || spot.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 4 }}>
                    🅿️ {spot.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    📍 {spot.address}
                  </div>
                  {spot.pricePerHour && (
                    <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 4, fontWeight: 500 }}>
                      💵 Từ {new Intl.NumberFormat('vi-VN').format(spot.pricePerHour)}đ/giờ (tham khảo)
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  {spot.carSlots ? (
                    <span style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      🚗 {spot.carSlots} chỗ ô tô
                    </span>
                  ) : (
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      Bãi gửi xe
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>
                    Chỉ đường →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
          color: '#94a3b8',
          marginBottom: 40
        }}>
          <p style={{ margin: '0 0 12px 0' }}>Đang cập nhật thêm bãi giữ xe tại {config.name}.</p>
          <Link href="/" style={{ color: '#818cf8', fontWeight: 600 }}>← Về trang chủ xem toàn bộ bản đồ</Link>
        </div>
      )}

      {/* Internal links — các Quận khác */}
      <div style={{
        marginTop: 48,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '24px'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#ffffff' }}>
          📍 Tìm bãi đỗ xe ở các Quận / Huyện khác (22 Quận Huyện TP.HCM)
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_DISTRICTS.filter(([s]) => s !== slug).map(([s, cfg]) => (
            <Link
              key={s}
              href={`/bai-do-xe/${s}`}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#c7d2fe',
                fontSize: 14,
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              {cfg.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Cross-links to category pages */}
      <div style={{
        marginTop: 24,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '24px'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#ffffff' }}>
          🔍 Tiện ích khác tại {config.name}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/quan-an/co-bai-xe" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🍜 Quán ăn có bãi xe
          </Link>
          <Link href="/cafe/co-bai-xe" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ☕ Cafe có bãi xe
          </Link>
          <Link href="/nha-ve-sinh/gan-day" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🚻 Nhà vệ sinh gần đây
          </Link>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div style={{
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.6,
        textAlign: 'center'
      }}>
        ⚠️ <em>Thông tin bãi đỗ xe được tổng hợp từ dữ liệu cộng đồng người dùng MapGo.vn, mang tính chất tham khảo. Vui lòng kiểm tra biển báo và giá thực tế tại điểm đỗ trước khi sử dụng.</em>
      </div>

      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Bãi đỗ xe ${config.name} TP.HCM`,
            description: config.description,
            url: `https://mapgo.vn/bai-do-xe/${slug}`,
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 15).map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              url: `https://mapgo.vn/bai-xe/${s.slug || s.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}
