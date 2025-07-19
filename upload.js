// 图片预览
const imgInput = document.getElementById('site-img');
const imgPreview = document.getElementById('img-preview');
imgInput.addEventListener('change', function() {
  imgPreview.innerHTML = '';
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      imgPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// 富文本编辑工具栏
const toolbar = document.getElementById('editor-toolbar');
const editor = document.getElementById('editor');
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
  btn.onclick = () => {
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
      if (url) document.execCommand('insertImage', false, url);
      editor.focus();
    }
  };
  toolbar.appendChild(btn);
});

// 表单提交
const form = document.getElementById('upload-form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const file = imgInput.files[0];
  const title = document.getElementById('site-title').value.trim();
  const tag = document.getElementById('site-tag').value;
  const note = editor.innerHTML.trim();
  const url = document.getElementById('site-url').value.trim();
  if (!file || !title || !tag || !note || !url) {
    alert('请完整填写所有内容');
    return;
  }
  const formData = new FormData();
  formData.append('img', file);
  formData.append('title', title);
  formData.append('tag', tag);
  formData.append('note', note);
  formData.append('url', url);
  fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert('上传成功！');
      // 如果在iframe或弹窗中，尝试关闭并刷新父页面
      if (window.parent && window.parent !== window) {
        window.parent.location.reload();
        window.close && window.close();
      } else {
        window.location.href = 'index.html';
        window.location.reload();
      }
    })
    .catch(() => {
      alert('上传失败，请检查服务端是否启动');
    });
}); 