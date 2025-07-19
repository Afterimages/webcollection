// 简单模拟数据，实际应与 main.js 保持同步
const sites = [
  {
    id: 'palette-maker',
    name: 'PaletteMaker',
    note: `
      <h1>PaletteMaker 使用体验</h1>
      <p>PaletteMaker 是一款 <span class="highlight">AI智能配色</span> 工具，界面 <span class="underline">极其简洁</span>，操作流畅。</p>
      <img src="data/images/PaletteMaker.png" alt="PaletteMaker 截屏" />
      <h2>优点</h2>
      <ul>
        <li>AI自动生成色卡，灵感丰富</li>
        <li>支持导出多种格式</li>
        <li>完全免费</li>
      </ul>
      <h2>适用场景</h2>
      <p>推荐给 <span class="highlight">设计师</span>、<span class="highlight">前端开发者</span>，快速获取配色方案。</p>
    `,
  },
  {
    id: 'tongyi-tingwu',
    name: '通义听悟',
    note: `
      <h1>通义听悟体验笔记</h1>
      <p>阿里出品的 <span class="highlight">AI语音转写</span> 工具，<span class="underline">免费额度充足</span>。</p>
      <img src="data/images/TongyiTingwu.png" alt="通义听悟 截屏" />
      <h2>亮点</h2>
      <ul>
        <li>音视频转文字，准确率高</li>
        <li>自动摘要，省时省力</li>
        <li>支持多平台同步</li>
      </ul>
      <h2>适用场景</h2>
      <p>会议记录、学习笔记、采访整理等。</p>
    `,
  },
];

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
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
      return [...localSites, ...sites];
    });
}

function renderNote() {
  const id = getQueryParam('id');
  getAllSites().then(allSites => {
    const site = allSites.find(s => s.id === id);
    const noteContent = document.getElementById('note-content');
    const noteUrlRow = document.getElementById('note-url-row');
    if (!site) {
      noteContent.innerHTML = '<p>未找到该网站的印象笔记。</p>';
      noteUrlRow.innerHTML = '';
      return;
    }
    noteUrlRow.innerHTML = site.url ? `<a href="${site.url}" class="card-url" target="_blank">${site.url.replace(/^https?:\/\//, '')}</a>` : '';
    noteContent.innerHTML = site.note;
  });
}

document.addEventListener('DOMContentLoaded', renderNote); 