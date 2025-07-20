// 分类枚举配置
const CATEGORY_ENUM = [
  {
    name: '工具',
    sub: ['AI工具', '前端开发', '配色', '图片处理', '视频处理']
  },
  {
    name: '学习',
    sub: ['在线课程', '题库', '阅读', '外语']
  },
  {
    name: '设计',
    sub: ['配色', '图片处理', 'UI灵感', '图标']
  },
  {
    name: '效率',
    sub: ['日程管理', '笔记', '自动化', '时间追踪']
  }
];

if (typeof window !== 'undefined') {
  window.CATEGORY_ENUM = CATEGORY_ENUM;
}
if (typeof module !== 'undefined') {
  module.exports = CATEGORY_ENUM;
} 