const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const DESKTOP = 'C:/Users/editor02/Desktop';
const AUDIO_DIR = path.join(DESKTOP, 'tts_v3');
const AUDIO_MERGED = path.join(DESKTOP, 'voiceover-v3.mp3');
const VIDEO_IN = path.join(DESKTOP, 'ParkingHCM-Demo-v2.webm');
const VIDEO_FINAL = path.join(DESKTOP, 'ParkingHCM-TikTok-FINAL.mp4');

// Kịch bản mới — rõ ràng, dễ hiểu
const SENTENCES = [
  'Đang ở Sài Gòn mà không biết gửi xe ở đâu?',
  'Mở ParkingHCM lên, tìm bãi xe, quán ăn, cà phê có chỗ đậu xe ngay gần bạn.',
  'Gõ tên đường hoặc tên quận, viết tắt cũng được, kết quả hiện ra ngay.',
  'Bấm Chỉ đường, app dẫn bạn đi luôn, không cần mở Google Maps.',
  'Bạn có bãi giữ xe, quán ăn, nhà hàng, nhà vệ sinh, hoặc bất kỳ dịch vụ nào có chỗ đậu xe?',
  'Bấm nút Đăng tin, điền thông tin, bấm lấy vị trí GPS, gửi lên là xong!',
  'Truy cập ngay. bãi đỗ xe chấm nextapp chấm vn. Hoặc parking chấm nextapp chấm vn.',
];

async function generateVoice() {
  console.log('🎤 Tạo giọng nam NamMinh...');
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  
  for (let i = 0; i < SENTENCES.length; i++) {
    const tts = new MsEdgeTTS();
    // Giọng NAM — NamMinhNeural
    await tts.setMetadata('vi-VN-NamMinhNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const outDir = path.join(AUDIO_DIR, `part${i}`);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    await tts.toFile(outDir, SENTENCES[i]);
    await tts.close();
    console.log(`  ✅ ${i+1}/${SENTENCES.length}: ${SENTENCES[i].substring(0,40)}...`);
  }
}

function concatAudio() {
  return new Promise((resolve, reject) => {
    console.log('🔗 Ghép audio...');
    const files = [];
    for (let i = 0; i < SENTENCES.length; i++) {
      const p = path.join(AUDIO_DIR, `part${i}`, 'audio.mp3');
      if (fs.existsSync(p)) files.push(p);
    }
    
    const listFile = path.join(AUDIO_DIR, 'filelist.txt');
    fs.writeFileSync(listFile, files.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
    
    ffmpeg()
      .input(listFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c:a libmp3lame', '-b:a 192k'])
      .output(AUDIO_MERGED)
      .on('end', () => {
        const s = fs.statSync(AUDIO_MERGED);
        console.log(`✅ Audio: ${(s.size/1024).toFixed(0)} KB`);
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

function makeVideo() {
  return new Promise((resolve, reject) => {
    console.log('🎬 Render video final...');
    
    ffmpeg()
      .input(VIDEO_IN)
      .input(AUDIO_MERGED)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-b:a 192k',
        '-ac 2',
        '-ar 44100',
        '-af', 'volume=2.0',
        '-pix_fmt yuv420p',
        '-shortest',
        '-vf', 'scale=780:1688',
        '-r 30',
        '-preset fast',
        '-movflags +faststart',
      ])
      .output(VIDEO_FINAL)
      .on('progress', (p) => {
        if (p.percent) process.stdout.write(`\r  ${Math.round(p.percent)}%`);
      })
      .on('end', () => {
        const s = fs.statSync(VIDEO_FINAL);
        console.log(`\n✅ ${VIDEO_FINAL} (${(s.size/1024/1024).toFixed(1)} MB)`);
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

(async () => {
  try {
    await generateVoice();
    await concatAudio();
    await makeVideo();
    console.log('\n🎉 VIDEO FINAL XONG!');
  } catch (err) {
    console.error('❌:', err.message || err);
  }
})();
