// 分类枚举配置
const CATEGORY_ENUM = [
  {
    name: '工具',
    sub: [
      'AI工具',
      '视频处理',
      '绘图工具',
      '文档工具',
      '开发工具',
      '阅读工具',
      '设计工具',
      '通信工具',
      '文件传输',
      '编辑器',
      '网络工具',
      'OCR工具',
      '职业规划',
      '系统工具'
    ]
  },
  {
    name: '学习',
    sub: [
      '编程学习',
      '深度学习',
      '打字练习',
      '网络安全'
    ]
  },
  {
    name: '设计',
    sub: [
      '配色',
      '服装设计'
    ]
  },
  {
    name: '开发',
    sub: [
      '开源项目',
      '脚本工具',
      '编程环境'
    ]
  },
  {
    name: '学术',
    sub: [
      '搜索工具',
      '期刊查询',
      '科研导航',
      '基金信息',
      '科研工具',
      '引用工具',
      '论文讨论',
      '论文库'
    ]
  },
  {
    name: '资源',
    sub: [
      '电子书',
      '图片资源',
      '档案资源'
    ]
  },
  {
    name: '教程',
    sub: [
      '网络教程'
    ]
  },
  {
    name: '技术',
    sub: [
      '破解论坛'
    ]
  }
];

if (typeof window !== 'undefined') {
  window.CATEGORY_ENUM = CATEGORY_ENUM;
}
if (typeof module !== 'undefined') {
  module.exports = CATEGORY_ENUM;
} 