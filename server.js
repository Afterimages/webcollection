const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { API_TOKEN } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: path.join(__dirname, 'data/images') });

const SITES_PATH = path.join(__dirname, 'data/sites.json');

// 安全中间件
function checkToken(req, res, next) {
  if (req.query.token !== API_TOKEN) return res.status(403).send('无权访问');
  next();
}

// 获取所有收藏
app.get('/api/sites', (req, res) => {
  const data = fs.existsSync(SITES_PATH) ? JSON.parse(fs.readFileSync(SITES_PATH)) : [];
  res.json(data);
});

// 上传新收藏
app.post('/api/upload', upload.single('img'), (req, res) => {
  const { title, tag, note, url, category, subcategory } = req.body;
  const imgFile = req.file;
  if (!title || !tag || !note || !imgFile || !url || !category || !subcategory) return res.status(400).send('参数不全');
  const ext = path.extname(imgFile.originalname) || '.png';
  // 用标题名+日期生成图片文件名，去除特殊字符、空格
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').replace(/\s+/g, '');
  const newImgName = `${safeTitle}_${dateStr}${ext}`;
  const newSite = {
    id: 'site-' + Date.now(),
    name: title,
    tag,
    url,
    category,
    subcategory,
    img: newImgName,
    desc: note.replace(/<[^>]+>/g, '').slice(0, 30) + '...',
    note
  };
  // 重命名图片
  fs.renameSync(imgFile.path, path.join(imgFile.destination, newImgName));
  // 写入JSON
  let sites = [];
  if (fs.existsSync(SITES_PATH)) sites = JSON.parse(fs.readFileSync(SITES_PATH));
  sites.push(newSite);
  fs.writeFileSync(SITES_PATH, JSON.stringify(sites, null, 2));
  res.json({ success: true });
});

// 删除收藏
app.delete('/api/site/:id', checkToken, (req, res) => {
  const { id } = req.params;
  let sites = fs.existsSync(SITES_PATH) ? JSON.parse(fs.readFileSync(SITES_PATH)) : [];
  const site = sites.find(s => s.id === id);
  if (!site) return res.status(404).send('未找到该收藏');
  // 删除图片文件（如果有）
  if (site.img && !site.img.startsWith('data:')) {
    const imgPath = path.join(__dirname, 'data/images', site.img);
    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
  }
  // 删除数据
  sites = sites.filter(s => s.id !== id);
  fs.writeFileSync(SITES_PATH, JSON.stringify(sites, null, 2));
  res.json({ success: true });
});

// 编辑收藏
app.put('/api/site/:id', upload.single('img'), checkToken, (req, res) => {
  const { id } = req.params;
  let sites = fs.existsSync(SITES_PATH) ? JSON.parse(fs.readFileSync(SITES_PATH)) : [];
  const idx = sites.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).send('未找到该收藏');
  const { title, tag, note } = req.body;
  if (title) sites[idx].name = title.slice(0, 30);
  if (tag) sites[idx].tag = tag;
  if (note) {
    sites[idx].note = note;
    sites[idx].desc = note.replace(/<[^>]+>/g, '').slice(0, 30) + '...';
  }
  // 图片更新
  if (req.file) {
    // 校验图片类型
    if (!['.png', '.jpg', '.jpeg'].includes(path.extname(req.file.originalname).toLowerCase())) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send('仅支持png/jpg/jpeg图片');
    }
    // 删除旧图片
    if (sites[idx].img && !sites[idx].img.startsWith('data:')) {
      const oldImgPath = path.join(__dirname, 'data/images', sites[idx].img);
      if (fs.existsSync(oldImgPath)) fs.unlinkSync(oldImgPath);
    }
    const ext = path.extname(req.file.originalname) || '.png';
    const newImgName = req.file.filename + ext;
    fs.renameSync(req.file.path, path.join(req.file.destination, newImgName));
    sites[idx].img = newImgName;
  }
  fs.writeFileSync(SITES_PATH, JSON.stringify(sites, null, 2));
  res.json({ success: true });
});

// 静态图片访问
app.use('/data/images', express.static(path.join(__dirname, 'data/images')));

app.listen(3000, () => console.log('API服务已启动 http://localhost:3000')); 