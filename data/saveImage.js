const fs = require('fs');
const path = require('path');

/**
 * 保存 base64 图片到 data/images 目录
 * @param {string} base64Data base64字符串
 * @param {string} filename 文件名（不含路径）
 * @returns {string} 保存后的文件路径
 */
function saveBase64Image(base64Data, filename) {
  const matches = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matches) throw new Error('无效的base64图片数据');
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  const file = filename.endsWith('.' + ext) ? filename : filename + '.' + ext;
  const filePath = path.join(__dirname, 'images', file);
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  return filePath;
}

// 命令行用法: node saveImage.js <base64> <filename>
if (require.main === module) {
  const [,, base64, filename] = process.argv;
  if (!base64 || !filename) {
    console.log('用法: node saveImage.js <base64> <filename>');
    process.exit(1);
  }
  try {
    const saved = saveBase64Image(base64, filename);
    console.log('保存成功:', saved);
  } catch (e) {
    console.error('保存失败:', e.message);
    process.exit(1);
  }
}

module.exports = saveBase64Image; 