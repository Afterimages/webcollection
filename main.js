// 示例数据，实际应从 /data 目录动态加载
const sites = [
  {
    id: 'palette-maker',
    name: 'PaletteMaker',
    desc: 'AI智能配色工具，轻松生成灵感色卡',
    tag: '免费',
    img: 'data/images/PaletteMaker.png',
    note: 'PaletteMaker 是一款非常好用的配色工具，支持AI自动生成色卡，界面简洁，适合设计师和前端开发者。',
  },
  {
    id: 'tongyi-tingwu',
    name: '通义听悟',
    desc: '阿里出品的AI语音转写与摘要工具',
    tag: '白嫖',
    img: 'data/images/TongyiTingwu.png',
    note: '通义听悟支持音视频转文字，自动摘要，免费额度充足，适合会议记录和学习笔记。',
  },
];

const API_TOKEN = 'your_secret_token';

function createCard(site, isSelected) {
  const card = document.createElement('div');
  card.className = 'site-card' + (isSelected ? ' batch-selected' : '');
  card.onclick = () => {
    window.location.href = `note.html?id=${site.id}`;
  };
  card.innerHTML = `
    <div class="card-url-row"><a href="${site.url || '#'}" class="card-url" target="_blank" onclick="event.stopPropagation()">${site.url ? site.url.replace(/^https?:\/\//, '') : ''}</a></div>
    <div class="card-img-wrap">
      <div class="card-bookmark card-tag-${site.tag}"><span class="bookmark-text">${site.tag}</span></div>
      <img src="${site.img}" alt="${site.name}" class="card-img" />
    </div>
    <div class="card-content">
      <div class="card-title">${site.name}</div>
      <div class="card-desc">${site.desc}</div>
    </div>
  `;
  // 批量选择框
  const selectBox = document.createElement('input');
  selectBox.type = 'checkbox';
  selectBox.className = 'card-select';
  selectBox.checked = !!isSelected;
  selectBox.onclick = (e) => { e.stopPropagation(); toggleSelect(site.id); };
  card.appendChild(selectBox);
  // 管理按钮（所有卡片都显示）
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const editBtn = document.createElement('button');
  editBtn.className = 'card-btn';
  editBtn.textContent = '编辑';
  editBtn.onclick = (e) => { e.stopPropagation(); showEditDialog(site); };
  const delBtn = document.createElement('button');
  delBtn.className = 'card-btn';
  delBtn.textContent = '删除';
  delBtn.onclick = (e) => { e.stopPropagation(); showDeleteDialog(site); };
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  card.appendChild(actions);
  return card;
}

function getAllSites() {
  return fetch('http://localhost:3000/api/sites')
    .then(res => res.json())
    .then(apiSites => {
      return apiSites.map(site => ({
        ...site,
        img: site.img.startsWith('data:') ? site.img : `http://localhost:3000/data/images/${site.img}`
      }));
    })
    .catch(() => {
      const localSites = JSON.parse(localStorage.getItem('sites') || '[]');
      return [...sites, ...localSites];
    });
}

let selectedIds = [];
function toggleSelect(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter(sid => sid !== id);
  } else {
    selectedIds.push(id);
  }
  renderCards();
  renderBatchBar();
}
function clearSelect() {
  selectedIds = [];
  renderCards();
  renderBatchBar();
}

function renderCards() {
  const cardList = document.getElementById('card-list');
  cardList.innerHTML = '';
  getAllSites().then(allSites => {
    allSites.forEach(site => {
      cardList.appendChild(createCard(site, selectedIds.includes(site.id)));
    });
  });
}

// 批量操作工具栏
function renderBatchBar() {
  let bar = document.getElementById('batch-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'batch-bar';
    bar.className = 'batch-bar';
    document.body.appendChild(bar);
  }
  if (selectedIds.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.innerHTML = `<span>已选${selectedIds.length}项</span>
    <button class='dialog-btn' onclick='batchDelete()'>批量删除</button>
    <button class='dialog-btn' onclick='selectAll()'>全选</button>
    <button class='dialog-btn' onclick='clearSelect()'>取消选择</button>`;
  bar.style.display = '';
}
window.batchDelete = function() {
  if (!confirm('确认批量删除选中项？')) return;
  Promise.all(selectedIds.map(id => fetch(`http://localhost:3000/api/site/${id}?token=${API_TOKEN}`, { method: 'DELETE' })))
    .then(() => { clearSelect(); renderCards(); })
    .catch(() => { alert('批量删除失败'); });
};

function selectAll() {
  getAllSites().then(allSites => {
    selectedIds = allSites.map(site => site.id);
    renderCards();
    renderBatchBar();
  });
}

// 弹窗管理
function showDialog(html) {
  document.getElementById('dialog-mask').style.display = '';
  const dialog = document.getElementById('dialog-container');
  dialog.innerHTML = html;
  dialog.style.display = '';
}
function closeDialog() {
  document.getElementById('dialog-mask').style.display = 'none';
  document.getElementById('dialog-container').style.display = 'none';
}
document.getElementById('dialog-mask').onclick = closeDialog;

// 删除弹窗
function showDeleteDialog(site) {
  showDialog(`
    <div class='dialog-title'>确认删除？</div>
    <div style='text-align:center;color:#e87ea1;margin-bottom:1.2em;'>${site.name}</div>
    <div class='dialog-actions'>
      <button class='dialog-btn' onclick='closeDialog()'>取消</button>
      <button class='dialog-btn' style='background:#e87ea1;color:#fff;' onclick='confirmDelete("${site.id}")'>删除</button>
    </div>
  `);
}
window.closeDialog = closeDialog;
window.confirmDelete = function(id) {
  fetch(`http://localhost:3000/api/site/${id}?token=${API_TOKEN}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => { closeDialog(); renderCards(); })
    .catch(err => { alert('删除失败\n' + (err.message || '')); });
};

// 编辑弹窗
function showEditDialog(site) {
  showDialog(`
    <div class='dialog-title'>编辑收藏</div>
    <form id='edit-form'>
      <label>标题<input type='text' name='title' value='${site.name.replace(/'/g, '&#39;')}' maxlength='30' required style='width:100%;margin:0.5em 0 1em 0;'/></label>
      <label>网址<input type='url' name='url' value='${site.url ? site.url.replace(/'/g, '&#39;') : ''}' maxlength='200' required placeholder='请输入网站网址，如 https://example.com' style='width:100%;margin-bottom:1em;'/></label>
      <label>标签<select name='tag' style='width:100%;margin-bottom:1em;'>
        <option value='免费' ${site.tag==='免费'?'selected':''}>免费</option>
        <option value='白嫖' ${site.tag==='白嫖'?'selected':''}>白嫖</option>
        <option value='收费' ${site.tag==='收费'?'selected':''}>收费</option>
      </select></label>
      <label>更换图片<input type='file' name='img' accept='image/*' style='margin-bottom:1em;'/></label>
      <label>网站印象笔记
        <div id='edit-toolbar' class='editor-toolbar'></div>
        <div id='edit-editor' class='editor' contenteditable='true' style='min-height:90px;border-radius:10px;border:1.5px solid #fcdda3;background:#fbf2d2;padding:0.7em;font-size:1em;color:#444;outline:none;width:100%;margin-top:0.3em;margin-bottom:1em;transition:border 0.2s;'>${site.note}</div>
      </label>
      <div class='dialog-actions'>
        <button type='button' class='dialog-btn' onclick='closeDialog()'>取消</button>
        <button type='submit' class='dialog-btn' style='background:#e87ea1;color:#fff;'>保存</button>
      </div>
    </form>
  `);
  // 富文本工具栏
  const toolbar = document.getElementById('edit-toolbar');
  const editor = document.getElementById('edit-editor');
  const tools = [
    { icon: 'B', title: '加粗', cmd: 'bold' },
    { icon: 'H1', title: '大标题', cmd: 'formatBlock', arg: 'H1' },
    { icon: 'H2', title: '小标题', cmd: 'formatBlock', arg: 'H2' },
    { icon: '<u>U</u>', title: '下划线', cmd: 'underline' },
    { icon: '高亮', title: '高亮', custom: 'highlight' },
    { icon: '🖼️', title: '插入图片', custom: 'image' },
  ];
  tools.forEach(tool => {
    const btn = document.createElement('button');
    btn.innerHTML = tool.icon;
    btn.title = tool.title;
    btn.type = 'button';
    btn.onclick = (e) => {
      e.preventDefault();
      if (tool.cmd) {
        document.execCommand(tool.cmd, false, tool.arg || null);
        editor.focus();
      } else if (tool.custom === 'highlight') {
        const sel = window.getSelection();
        if (!sel.isCollapsed) {
          document.execCommand('insertHTML', false, `<span class='highlight'>${sel}</span>`);
        }
        editor.focus();
      } else if (tool.custom === 'image') {
        const url = prompt('请输入图片URL');
        if (url) {
          // 插入带样式的图片
          document.execCommand('insertHTML', false, `<img src='${url}' style='max-width:100%;height:auto;border-radius:12px;margin:1em 0;' />`);
        }
        editor.focus();
      }
    };
    toolbar.appendChild(btn);
  });
  // 编辑区内图片支持缩放
  editor.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG') {
      const img = e.target;
      const newW = prompt('输入图片最大宽度(px)，如300，留空为100%：', img.style.maxWidth ? img.style.maxWidth.replace('px','').replace('%','') : '100');
      if (newW !== null) {
        img.style.maxWidth = newW ? (isNaN(newW) ? newW : newW + 'px') : '100%';
        img.style.height = 'auto';
      }
    }
  });
  document.getElementById('edit-form').onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    fd.set('note', editor.innerHTML);
    fetch(`http://localhost:3000/api/site/${site.id}?token=${API_TOKEN}`, {
      method: 'PUT',
      body: fd
    })
      .then(res => res.json())
      .then(() => { closeDialog(); renderCards(); })
      .catch(() => { alert('保存失败'); });
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  // 添加按钮跳转
  const addBtn = document.querySelector('.nav-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.location.href = 'upload.html';
    });
  }
}); 