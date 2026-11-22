# gojue.cc

gojue 官方网站。以 eCapture 为中心，展示 eCaptureQ、eCapture Skill、eCapture Decryptor 与 ebpfmanager 的项目关系。

## 本地预览

无需安装前端依赖，也无需构建：

```sh
npm run dev
```

浏览器打开 http://127.0.0.1:4173 。也可用任意静态 HTTP 服务托管仓库根目录。页面使用 ES Modules，请通过 HTTP 打开，不要直接双击 HTML 文件。

## 交互

- 四个副项目围绕 eCapture 分布：左上 Skills、右上 Q、左下 ebpfmanager、右下 Decryptor。
- 默认隐藏副项目名称、副标题和连线说明，连线保持暗淡。
- 只有鼠标进入副项目 LOGO 的范围时，才激活对应连线、文字与 LOGO 浮动；离开 LOGO 即隐藏。页面空白区域不触发联动，连线两端与 LOGO 保持空隙。
- 主页五个 LOGO 使用黄色与奶白色立体造型、半亮面黑色细节，与计算机主题背景统一。黑色表面保留柔和高光与圆润感，主 LOGO 的两只眼睛作为独立图层继续跟随鼠标。
- 点击任一项目 LOGO（包括中心 eCapture）打开项目介绍；点击左上 gojue 品牌打开组织介绍。
- GitHub 图标右侧的“文/A”按钮切换中文和英文，覆盖首页、连线文字、项目详情、组织介绍与辅助标签。优先使用上次手动选择的语言；没有有效记录时，按浏览器语言偏好顺序选择中文或英文，都不支持时回退英文。仅手动切换会保存选择，已打开的介绍也会即时切换语言。
- 详情以抽屉展示，打开时仍可操作顶栏的语言切换。点击空白遮罩或关闭按钮即可关闭。
- 触屏点击 LOGO 打开详情。键盘可 Tab 选择、Enter 打开、Escape 关闭。
- 尊重系统“减少动态效果”设置。五个项目均使用独立 LOGO，副项目名称在 LOGO 悬停或键盘聚焦时出现。

## 文件

- `index.html`：页面结构和分层 eCapture LOGO；SVG 内叠加立体底图与可独立移动的眼睛。
- `styles/site.css`：响应式布局、场景、连接线和详情面板样式。
- `scripts/app.js`：LOGO 悬停、语言切换、详情抽屉与眼睛运动。
- `scripts/content.js`：中英文文案和项目元数据。
- `scripts/geometry.js`：连线留白与视线位移。
- `assets/`：独立场景背景、原始项目 LOGO，以及仅供主页使用的立体版本，来源见 `assets/SOURCES.txt`。
- `assets/logos/homepage-3d/`：五个主页 LOGO 的透明素材与独立眼睛图层，当前半亮面版本的生成提示词保存在 `prompts-satin.txt`，此前亮面版本的提示词保存在 `prompts.txt`。详情弹窗继续使用上一级目录中的原始 LOGO。
- `assets/landscape-prompt.txt`：场景背景的生成提示词。审核概念图保留在本地 `design/`，不随网站源码提交。

Skills 仓库原图包含白色外边框。详情弹窗用官方六边形轮廓裁去外侧白底，保留图案内部与白色镜片；Q、D 等详情 LOGO 保持原始素材。主页新素材具有独立透明背景，无需套用该裁切。

`assets/logos/ebpfmanager.svg` 是本网站任务中新设计的家族 LOGO：沿用原始蜜蜂的两只圆点眼睛、黑色眼镜、白色镜片与条纹腹部，外围用黄色芯片形状和十二个探针接口表达 eBPF 程序、探针与资源管理。透明背景，无额外圆盘或底座；不是从上游仓库下载的现有标识。该矢量版本保留用于详情弹窗，主页使用对应的半亮面立体版本。

## 检查

Node.js 20 或更新版本：

```sh
npm test
npm run check
```

几何测试覆盖桌面与窄屏连线留白、浮动安全间距和眼睛移动范围。

## 静态部署

将仓库根目录作为静态站点目录即可，无服务端或运行时密钥。GitHub Pages 可直接使用根目录；也可只发布 `index.html`、`styles/`、`scripts/`、`assets/`。

各项目的许可与贡献方式以相应 GitHub 仓库为准。
