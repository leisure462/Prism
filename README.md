# Prism Reader

> 一款基于学术羊皮纸风格设计的高颜值安卓阅读器。

## 设计哲学

Prism 的设计语言源自学术期刊在羊皮纸上的排版美学——温暖而不刺眼，克制而不冰冷。每一个像素都服务于阅读本身。

- **主色调**: Vellum White (`#faf9f5`) — 模拟宣纸的温润质感
- **字体系统**: Lora (Serif) + Inter (Sans) — 衬线标题与无衬线正文的经典搭配
- **圆角**: 9.6px 统一圆角，柔和而不过度卡通化
- **强调色**: Terra Cotta (`#d97757`) — 克制而温暖的点缀

## 功能特性

| 功能 | 状态 |
|------|------|
| TXT 文件导入与阅读 | ✅ |
| 智能章节切分 | ✅ |
| EPUB 支持 | 🚧 |
| 多主题切换 (宣纸/墨纸/羊皮/青玉) | ✅ |
| 字号/行距/段间距调节 | ✅ |
| 滑动/点击翻页 | ✅ |
| 阅读进度记忆 | ✅ |
| 书架管理 | ✅ |

## 技术栈

- React Native 0.73
- TypeScript
- React Navigation 6
- Zustand (状态管理)
- React Native Gesture Handler + Reanimated

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动 Metro
npx react-native start

# 3. 运行到安卓设备/模拟器 (需要 Android SDK)
npx react-native run-android
```

> 注意：若本地无 Android 环境，可直接推送到 GitHub，由 GitHub Actions 自动构建 APK。

## GitHub Actions 自动构建

### 配置步骤

1. **生成签名密钥** (只需执行一次):
   ```bash
   keytool -genkey -v -keystore prism-release.keystore -alias prism -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Base64 编码密钥并添加到 GitHub Secrets**:
   ```bash
   base64 -w 0 prism-release.keystore
   ```
   将输出添加到仓库 Settings → Secrets → `KEYSTORE_BASE64`

3. **添加其他 Secrets**:
   | Secret | 值 |
   |--------|-----|
   | `KEYSTORE_BASE64` | base64 编码的 keystore |
   | `KEYSTORE_PASSWORD` | keystore 密码 |
   | `KEY_ALIAS` | 别名 (如 `prism`) |
   | `KEY_PASSWORD` | 密钥密码 |

4. **发布 Release**:
   推送一个 `v*` 标签，GitHub Actions 会自动构建并发布签名 APK 到 Releases 页面。
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

## 项目结构

```
Prism/
├── .github/workflows/   # CI/CD 配置
├── android/             # Android 原生工程
├── src/
│   ├── components/      # 通用 UI 组件
│   ├── screens/         # 页面 (书架/阅读器/设置)
│   ├── navigation/      # 路由配置
│   ├── store/           # Zustand 状态管理
│   ├── parsers/         # 文件格式解析器
│   ├── utils/           # 工具函数
│   └── types/           # TypeScript 类型
├── DESIGN.md            # 设计系统文档
└── package.json
```

## License

MIT
