const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) return;
  const ownerId = user.id;

  const districts = ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 10', 'Quận Phú Nhuận', 'Quận Bình Thạnh', 'Quận Tân Bình'];
  const places = ['Siêu thị', 'Bệnh viện', 'Trường học', 'Công viên', 'Trung tâm thương mại', 'Đường phố'];

  let totalAdded = 0;
  for (let i = 1; i <= 45; i++) {
    const lat = 10.7 + (Math.random() * 0.15);
    const lng = 106.6 + (Math.random() * 0.15);
    const district = districts[Math.floor(Math.random() * districts.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    const name = "Bãi đỗ xe " + place + " " + i + " - " + district;
    
    const spot = await prisma.parkingSpot.create({
      data: {
        name,
        address: "Đường số " + i + ", " + district + ", Thành phố Hồ Chí Minh",
        lat,
        lng,
        type: 'PARKING_LOT',
        carSlots: 10 + Math.floor(Math.random() * 90),
        bikeSlots: 50 + Math.floor(Math.random() * 200),
        pricePerHour: (Math.floor(Math.random() * 5) + 1) * 10000,
        openTime: '06:00',
        closeTime: '23:00',
        ownerId: ownerId,
      }
    });

    await prisma.parkingImage.create({
      data: {
        url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600',
        parkingSpotId: spot.id
      }
    });
    totalAdded++;
  }
  console.log("Added parking lots:", totalAdded);
}
main().catch(console.error).finally(() => prisma.$disconnect());
