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

document.addEventListener('DOMContentLoaded', () => {
  renderNote();
  // 编辑按钮弹窗
  const editBtn = document.getElementById('note-edit-btn');
  if (editBtn) {
    editBtn.onclick = function() {
      getAllSites().then(allSites => {
        const id = getQueryParam('id');
        const site = allSites.find(s => s.id === id);
        if (site) {
          showEditDialog(site);
        } else {
          alert('未找到该收藏网站');
        }
      });
    };
  }
}); 