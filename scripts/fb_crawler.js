#!/usr/bin/env node
/**
 * MapGo Facebook Crawler v3 - PRODUCTION
 * Strategy: TreeWalker + GraphQL intercept
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { PrismaClient } = require('/var/www/parking-hcm/node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();
const UPLOAD_DIR = '/var/www/parking-hcm/public/uploads/fb';
const COOKIE_FILE = '/var/www/parking-hcm/scripts/.fb_cookies.json';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const follow = (u, count = 0) => {
      if (count > 5) return resolve(false);
      const client = u.startsWith('https') ? https : http;
      const req = client.get(u, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.facebook.com/' },
        timeout: 20000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); return follow(res.headers.location, count + 1);
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(false); }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on('finish', () => { ws.close(); resolve(true); });
        ws.on('error', () => resolve(false));
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    };
    follow(url);
  });
}

// Parse GraphQL responses for post data using regex (handles deeply nested FB JSON)
function parseGraphQLForPosts(jsonText) {
  const posts = [];
  const seenTexts = new Set();
  
  try {
    const lines = jsonText.split('\n').filter(l => l.trim().startsWith('{'));
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        findPostsDeep(obj, posts, seenTexts, 0);
      } catch(e) {}
    }
  } catch(e) {}
  
  return posts;
}

function findPostsDeep(obj, posts, seenTexts, depth) {
  if (!obj || typeof obj !== 'object' || depth > 25) return;
  
  // Pattern 1: node with message.text (standard post)
  if (obj.message && obj.message.text && obj.message.text.length > 15) {
    const key = obj.message.text.substring(0, 80);
    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      const post = {
        text: obj.message.text,
        postId: obj.post_id || obj.id || obj.legacy_token || '',
        author: obj.actors?.[0]?.name || obj.author?.name || '',
        images: [],
        videos: []
      };
      // Search for images in entire subtree
      findMediaDeep(obj, post);
      posts.push(post);
      return;
    }
  }
  
  // Pattern 2: story node with comet_sections
  if (obj.comet_sections && obj.message) {
    const text = obj.message?.text || obj.message?.story?.message?.text || '';
    if (text.length > 15) {
      const key = text.substring(0, 80);
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        const post = { text, postId: obj.post_id || obj.id || '', author: '', images: [], videos: [] };
        findMediaDeep(obj, post);
        posts.push(post);
        return;
      }
    }
  }
  
  // Recurse
  if (Array.isArray(obj)) {
    for (const item of obj) findPostsDeep(item, posts, seenTexts, depth + 1);
  } else {
    for (const val of Object.values(obj)) {
      if (typeof val === 'object') findPostsDeep(val, posts, seenTexts, depth + 1);
    }
  }
}

function findMediaDeep(obj, post, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 20 || post.images.length >= 10) return;
  
  // Check for URI fields pointing to fbcdn
  if (typeof obj.uri === 'string' && obj.uri.includes('scontent') && !obj.uri.includes('rsrc.php')) {
    // Check if this is an actual content image (not a tiny icon)
    const w = obj.width || 0;
    const h = obj.height || 0;
    if (w > 100 || h > 100 || obj.uri.includes('_n.') || w === 0) {
      if (!post.images.includes(obj.uri)) post.images.push(obj.uri);
    }
  }
  
  // Check for video URLs
  if (typeof obj.playable_url === 'string' && obj.playable_url.includes('video')) {
    post.videos.push(obj.playable_url_quality_hd || obj.playable_url);
  }
  
  // Recurse
  if (Array.isArray(obj)) {
    for (const item of obj) findMediaDeep(item, post, depth + 1);
  } else {
    for (const val of Object.values(obj)) {
      if (typeof val === 'object') findMediaDeep(val, post, depth + 1);
    }
  }
}

// Fuzzy match
async function matchWithSpot(text) {
  const spots = await prisma.parkingSpot.findMany({ select: { id: true, name: true } });
  const tl = text.toLowerCase();
  for (const s of spots) {
    if (s.name.length > 5 && tl.includes(s.name.toLowerCase())) return s.id;
  }
  return null;
}

// Save post to DB
async function savePost(post, groupUrl) {
  if (!post.postId) post.postId = 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  
  const existing = await prisma.facebookPost.findUnique({ where: { fbPostId: String(post.postId) } }).catch(()=>null);
  if (existing) return null;

  const savedImages = [];
  for (let i = 0; i < post.images.length && i < 6; i++) {
    const filename = `fb_${post.postId}_${i+1}.jpg`;
    const dest = path.join(UPLOAD_DIR, filename);
    const ok = await downloadFile(post.images[i], dest);
    if (ok) {
      const stats = fs.statSync(dest);
      if (stats.size > 5000) {
        savedImages.push({ url: `/uploads/fb/${filename}`, type: 'image' });
      } else { try { fs.unlinkSync(dest); } catch(e) {} }
    }
    await sleep(200);
  }
  
  for (let i = 0; i < post.videos.length && i < 2; i++) {
    const filename = `fb_${post.postId}_vid_${i+1}.mp4`;
    const dest = path.join(UPLOAD_DIR, filename);
    const ok = await downloadFile(post.videos[i], dest);
    if (ok) savedImages.push({ url: `/uploads/fb/${filename}`, type: 'video' });
  }

  let matchedSpotId = post.text ? await matchWithSpot(post.text) : null;

  return prisma.facebookPost.create({
    data: {
      fbPostId: String(post.postId),
      groupUrl,
      content: post.text.substring(0, 5000),
      authorName: post.author || null,
      postDate: new Date(),
      isComment: false,
      status: matchedSpotId ? 'approved' : 'pending',
      matchedSpotId,
      images: { create: savedImages }
    }
  });
}

// ===== MAIN =====
async function main() {
  console.log('=== MapGo FB Crawler v3 (GraphQL + DOM) ===\n');

  let configs = await prisma.crawlConfig.findMany({ where: { isActive: true } });
  if (configs.length === 0) {
    configs = [await prisma.crawlConfig.create({
      data: { groupUrl: 'https://www.facebook.com/groups/209355221871987', groupName: 'BÃI GIỮ XE 24/24 TẠI SÀI GÒN', isActive: true }
    })];
  }

  const browser = await puppeteer.launch({
    executablePath: '/snap/bin/chromium', headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']
  });

  let totalNew = 0;

  for (const config of configs) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    
    // Collect GraphQL responses
    const graphqlData = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('api/graphql')) {
        try {
          const text = await response.text();
          if (text.length > 1000) graphqlData.push(text);
        } catch(e) {}
      }
    });

    try {
      // Load cookies
      if (fs.existsSync(COOKIE_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf8'));
        await page.setCookie(...cookies);
      }

      console.log(`🔍 ${config.groupName}`);
      await page.goto(config.groupUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(5000);

      // Scroll to load posts
      const scrollCount = 12;
      for (let i = 0; i < scrollCount; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(2500 + Math.random() * 1500);
        if ((i+1) % 4 === 0) console.log(`  📜 Scroll ${i+1}/${scrollCount}`);
      }
      await sleep(3000);

      console.log(`  📡 GraphQL responses: ${graphqlData.length}`);

      // Parse all GraphQL data for posts
      const allPosts = [];
      const seenTexts = new Set();
      
      for (const data of graphqlData) {
        const parsed = parseGraphQLForPosts(data);
        for (const p of parsed) {
          const key = p.text.substring(0, 80);
          if (!seenTexts.has(key) && p.text.length > 20) {
            seenTexts.add(key);
            allPosts.push(p);
          }
        }
      }

      // Also extract from DOM as fallback
      const domPosts = await page.evaluate(() => {
        const posts = [];
        const feed = document.querySelector('[role="feed"]');
        if (!feed) return posts;
        
        // Get all big images and their src
        const imgMap = new Map();
        feed.querySelectorAll('img[src*="fbcdn"]').forEach(img => {
          if (img.width > 100 || img.height > 100) {
            imgMap.set(img.src, true);
          }
        });
        
        // Get all text blocks from feed using TreeWalker
        const textBlocks = [];
        const walker = document.createTreeWalker(feed, NodeFilter.SHOW_TEXT, null, false);
        while (walker.nextNode()) {
          const text = walker.currentNode.textContent.trim();
          if (text.length > 30) {
            const parent = walker.currentNode.parentElement;
            if (parent) {
              // Get depth to find post boundaries
              let depth = 0, p = parent;
              while (p && p !== feed) { depth++; p = p.parentElement; }
              textBlocks.push({ text, depth, tag: parent.tagName });
            }
          }
        }
        
        // Group text blocks into posts (blocks at similar depth that are adjacent)
        let currentPost = { text: '', images: [] };
        let lastDepth = -1;
        
        for (const block of textBlocks) {
          // Skip UI text
          if (block.text.match(/^(Thích|Bình luận|Chia sẻ|Trả lời|Xem thêm|Không có mô tả)/)) continue;
          
          if (block.depth < 10 || Math.abs(block.depth - lastDepth) > 15) {
            // New post boundary
            if (currentPost.text.length > 30) {
              posts.push({ ...currentPost, postId: 'dom_' + Date.now() + '_' + posts.length });
            }
            currentPost = { text: block.text, images: [] };
          } else {
            currentPost.text += '\n' + block.text;
          }
          lastDepth = block.depth;
        }
        if (currentPost.text.length > 30) {
          posts.push({ ...currentPost, postId: 'dom_' + Date.now() + '_' + posts.length });
        }
        
        // Add all big images to first post that doesn't have images
        const allImgUrls = [...imgMap.keys()];
        // Distribute images to posts (rough allocation)
        const imgPerPost = Math.ceil(allImgUrls.length / Math.max(posts.length, 1));
        posts.forEach((p, i) => {
          p.images = allImgUrls.slice(i * imgPerPost, (i + 1) * imgPerPost);
        });
        
        return posts;
      });

      // Merge: prefer GraphQL posts (have better structured data), add DOM posts that are new
      for (const dp of domPosts) {
        const key = dp.text.substring(0, 80);
        if (!seenTexts.has(key) && dp.text.length > 30) {
          seenTexts.add(key);
          allPosts.push(dp);
        }
      }

      console.log(`  📊 Tổng bài viết: ${allPosts.length} (GraphQL: ${allPosts.length - domPosts.length}, DOM: ${domPosts.length})`);

      // Save to DB
      for (const post of allPosts) {
        try {
          const saved = await savePost(post, config.groupUrl);
          if (saved) {
            totalNew++;
            const preview = post.text.substring(0, 60).replace(/\n/g, ' ');
            const imgC = post.images?.length || 0;
            const vidC = post.videos?.length || 0;
            console.log(`  📝 MỚI: ${preview}... (📸${imgC} 🎬${vidC})${saved.matchedSpotId ? ' ✅MATCH' : ''}`);
          }
        } catch(e) {
          if (!e.message.includes('Unique')) console.log(`  ⚠️ ${e.message.substring(0,80)}`);
        }
      }

      await prisma.crawlConfig.update({ where: { id: config.id }, data: { lastCrawl: new Date() } });
    } catch(e) {
      console.error(`❌ ${config.groupName}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  console.log(`\n=== KẾT QUẢ ===`);
  console.log(`🆕 Bài mới: ${totalNew}`);
  console.log(`📁 Ảnh/video: ${UPLOAD_DIR}`);

  await browser.close();
  await prisma.$disconnect();
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
