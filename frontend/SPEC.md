# アプリ仕様書

ポートフォリオ用 3D ワールドアプリの仕様。開発者・AI エージェント向けに、現行コードの構造と責務を整理する。

---

## 目次

1. [概要](#概要)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ](#アーキテクチャ)
4. [ディレクトリ構成](#ディレクトリ構成)
5. [コンポーネント詳細](#コンポーネント詳細)
6. [設定リファレンス](#設定リファレンス)
7. [データフロー](#データフロー)
8. [レンダリングパイプライン](#レンダリングパイプライン)
9. [座標系・空間](#座標系空間)
10. [アルゴリズム](#アルゴリズム)
11. [アセット](#アセット)
12. [開発ガイド](#開発ガイド)
13. [今後の拡張](#今後の拡張)
14. [トラブルシューティング](#トラブルシューティング)

---

## 概要

| 項目        | 内容                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| **用途**    | 3D 空間内を歩き回り、本・箱・ポスト・コンピューター・クリスタルと対話できるポートフォリオ |
| **操作**    | PC: 矢印キー / Pointer, Mobile: 仮想ジョイスティック + TAP                                |
| **表示**    | ドーム + 床 + 浮遊オブジェクト 4 種 + クリスタル 4 体 + プレイヤー（Coco）                |
| **UI 方針** | オーバーレイは常に 1 つだけ開く。`shared/uiStore.ts` が全体状態の真実を持つ               |

---

## 技術スタック

| カテゴリ          | ライブラリ         | バージョン（package.json） | 用途                                             |
| ----------------- | ------------------ | -------------------------- | ------------------------------------------------ |
| フレームワーク    | Next.js            | ^16.1.6                    | App Router, Route Handler                        |
| 言語              | TypeScript         | ^5                         | 型安全                                           |
| UI                | React              | 19.2.3                     | クライアント UI                                  |
| 3D レンダリング   | @react-three/fiber | ^9.5.0                     | Canvas / `useFrame`                              |
| 3D ユーティリティ | @react-three/drei  | ^10.7.7                    | `useGLTF`, `useTexture`, `Environment`, `Loader` |
| 3D 型補助         | three-stdlib       | drei 経由                  | `GLTF`, `SkeletonUtils`                          |
| 3D エンジン       | three              | ^0.182.0                   | ジオメトリ、Raycaster、Vector 演算               |
| 状態管理          | Zustand            | ^5.0.11                    | `uiStore` で入力・近接・オーバーレイを集中管理   |
| アイコン          | react-icons        | ^5.6.0                     | Post オーバーレイ内の SNS アイコン               |
| メール送信        | Resend             | ^6.9.3                     | `/api/letter` からのメール配送                   |
| CSS               | Tailwind CSS       | ^4                         | レイアウトとオーバーレイ装飾                     |
| フォーマッタ      | Prettier           | ^3.8.1                     | コード整形                                       |

### 備考

- `@react-three/postprocessing` と `postprocessing` は `package.json` に存在するが、現行コードでは未使用。
- `react-joystick-component` も依存として残っているが、現行の `JoystickControls.tsx` は自前実装。

### パスエイリアス

- `@/*` → `./*`

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  app/page.tsx                                               │
│  ├── <World />                                              │
│  ├── <JoystickControls />   ← 仮想ジョイスティック          │
│  ├── <IntroOverlay />      ← 開始演出メッセージ            │
│  ├── <InteractionPrompt /> ← 中央 TAP 導線                 │
│  ├── <OverlayRoot />       ← overlay を 1 つだけ切替表示    │
│  └── <Loader />            ← drei ローダー                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  features/world/World.tsx                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Canvas (flat, dpr=[1,2], frameloop="always")      │   │
│  │  ├── Dome                                           │   │
│  │  ├── Environment / ambientLight / Sparkles          │   │
│  │  ├── Floor ─────────────── groundRef ─────────────┐ │   │
│  │  ├── BookObject                                   │ │   │
│  │  ├── PostObject                                   │ │   │
│  │  ├── BoxObject                                    │ │   │
│  │  ├── ComputerObject                               │ │   │
│  │  ├── Player ────────────── playerRef ────────────┤ │   │
│  │  │    └── Coco                                     │ │   │
│  │  ├── IntroCrystal + Crystal x3                     │ │   │
│  │  └── SectionImagesPreloader                        │ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  shared/uiStore.ts                                          │
│  - joystick                                                 │
│  - activeOverlay: none | dialogue | book | box | post | computer │
│  - nearbyTarget: crystal | book | box | post | computer | null   │
│  - introSequence / interactionTarget selector               │
│  - overlay 個別 state（book / box / computer）              │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴────────────────────┐
          ▼                                        ▼
┌─────────────────────────────┐      ┌─────────────────────────────┐
│ shared/InteractionPrompt.tsx│      │ shared/OverlayRoot.tsx      │
│ - interactionTarget を読む │      │ - activeOverlay を読む      │
│ - TAP から open action 実行 │      │ - 各 Overlay を 1つだけ描画 │
└─────────────────────────────┘      └─────────────────────────────┘
```

**構造方針:**

- `features/world` は 3D シーンの司令塔。
- `features/book|box|post|computer` は各機能の 3D オブジェクトとオーバーレイを同居させる。
- `shared` は横断状態と overlay/prompt の制御だけを持つ。
- 旧 `components/world`, `components/ui`, `lib/world` ベースの構成は廃止。

---

## ディレクトリ構成

```
frontend/
├── app/
│   ├── api/
│   │   └── letter/
│   │       └── route.ts                # 手紙送信 API
│   ├── globals.css                     # 全体スタイルとフォントユーティリティ
│   ├── icon.png                        # ブラウザタブ / Apple touch icon 用画像
│   ├── layout.tsx                      # フォント定義 + ルートレイアウト + metadata
│   ├── opengraph-image.jpg             # Open Graph / Twitter Card 用画像
│   └── page.tsx                        # World / IntroOverlay / Prompt / OverlayRoot / Loader
├── features/
│   ├── world/
│   │   ├── World.tsx                   # 3D シーンの組み立て
│   │   ├── Player.tsx                  # 移動・接地・カメラ追従
│   │   ├── Coco.tsx                    # プレイヤーモデルとアニメーション
│   │   ├── Crystal.tsx                 # クリスタルの徘徊と会話担当制
│   │   ├── IntroCrystal.tsx            # 開始演出専用クリスタル
│   │   ├── IntroOverlay.tsx            # 開始メッセージ
│   │   ├── DialogueOverlay.tsx         # 会話オーバーレイ
│   │   ├── JoystickControls.tsx        # 仮想ジョイスティック
│   │   ├── SectionImagesPreloader.tsx  # Box / Post / Computer 画像のプリロード
│   │   ├── preloadWorldImages.ts       # 画像プリロード処理
│   │   ├── crystalInteraction.ts       # crystal の近接・会話対象化ロジック
│   │   ├── FloatingWorldModel.tsx      # 浮遊オブジェクト共通描画
│   │   ├── Dome.tsx                    # ドーム
│   │   ├── Floor.tsx                   # 床
│   │   └── worldConfig.ts              # シーン全体の定数
│   ├── book/
│   │   ├── BookObject.tsx              # 本の 3D オブジェクト
│   │   ├── BookOverlay.tsx             # ぼうけんのしょ UI
│   │   └── bookData.ts                 # ぼうけんのしょ表示データ
│   ├── box/
│   │   ├── BoxObject.tsx               # 箱の 3D オブジェクト
│   │   ├── BoxOverlay.tsx              # アイテム BOX UI
│   │   └── boxData.ts                  # スキル・アイテムデータ
│   ├── post/
│   │   ├── PostObject.tsx              # ポストの 3D オブジェクト
│   │   ├── PostOverlay.tsx             # 手紙 UI
│   │   └── postAssets.ts               # Post 用画像 URL 一覧
│   └── computer/
│       ├── ComputerObject.tsx          # コンピューターの 3D オブジェクト
│       ├── ComputerOverlay.tsx         # 作品オーバーレイ
│       └── computerData.ts             # 作品データと画像 URL 一覧
├── shared/
│   ├── uiStore.ts                      # Zustand ストア
│   ├── InteractionPrompt.tsx           # TAP 導線
│   ├── OverlayRoot.tsx                 # overlay 出し分け
│   └── useDeviceType.ts                # 768px 未満を mobile と判定
├── public/
│   ├── computer/                       # 額縁画像・作品画像
│   ├── items/                          # BOX アイテム画像
│   ├── models/                         # GLB モデル
│   ├── post/                           # 手紙 UI 用画像
│   ├── skills/                         # BOX スキル画像
│   └── textures/                       # Matcap テクスチャ
├── SPEC.md
└── package.json
```

---

## コンポーネント詳細

### app/page.tsx

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| **責務** | ルートページの組み立て                                                                    |
| **子**   | `World`, `JoystickControls`, `IntroOverlay`, `InteractionPrompt`, `OverlayRoot`, `Loader` |

**補足:** `BoxOverlay` や `PostOverlay` の動的 import は廃止し、`OverlayRoot` が一元的に切り替える。

---

### app/layout.tsx

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| **責務** | ルートレイアウト、フォント定義、ページ共通 metadata の設定 |
| **依存** | `next/font/google`, `Metadata`                             |

**metadata:**

- `metadataBase`: `https://shogomorisawa.me`
- `title`: `Shogo Morisawa Portfolio`
- `description`: `森澤翔吾のポートフォリオサイト。`
- `alternates.canonical`: `/`
- `openGraph`: `title`, `description`, `url`, `siteName`, `locale`, `type`
- `twitter`: `summary_large_image`, `title`, `description`
- `robots`: `index`, `follow`
- `icons`: `app/icon.png`

**metadata 用アセット:**

- `app/icon.png`: タブアイコン、ショートカットアイコン、Apple touch icon に利用
- `app/opengraph-image.jpg`: Next.js App Router の metadata file convention により OG/Twitter 画像として利用

---

### World.tsx

| 項目      | 内容                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| **責務**  | Canvas 設定、環境描画、3D オブジェクトの配置                                                |
| **Props** | なし                                                                                        |
| **状態**  | `groundRef`, `playerRef`, `useDeviceType()` による `isMobile`, `crystals`（4 体の初期配置） |
| **依存**  | `useUIStore`, `worldConfig.ts`, `BookObject`, `BoxObject`, `PostObject`, `ComputerObject`   |

**Canvas 設定:**

- `flat`
- `dpr={[1, 2]}`
- `frameloop="always"`
- `key={isMobile ? "mobile" : "pc"}`
- `camera` は `CAMERA.pc` / `CAMERA.mobile` から `fov`, `position` を取得

**描画内容:**

- `Dome`
- `Environment preset="city"`
- `ambientLight intensity={2}`
- `Sparkles`（白パーティクル）
- `Floor`
- `BookObject`, `PostObject`, `BoxObject`, `ComputerObject`
- `Player`
- `IntroCrystal` x1
- `Crystal` x3
- `SectionImagesPreloader`

**挙動:**

- `activeOverlay !== "none"` の間は `shouldFreezeCrystals=true` とし、全クリスタルの `useFrame` を停止。
- 開始時は 1 体だけ `IntroCrystal` としてプレイヤー斜め前に待機し、クリック待ちの導入演出を担当する。
- 本・ポスト・箱・コンピューターは `LAYOUT` の円周 4 点に固定配置。

---

### Dome.tsx

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| **責務** | ドームモデルの表示                                                                  |
| **依存** | `STAGE.DOME_POSITION_Y`, `models/dome-transformed.glb`, `textures/dome_texture.jpg` |

**実装:** `meshMatcapMaterial` + `DoubleSide`。`position={[0, -7, 0]}`、`scale={[1.8, 1.8, 1.8]}`。

---

### Floor.tsx

| 項目      | 内容                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| **責務**  | 床の表示と `groundRef` の受け渡し                                                |
| **Props** | `groundRef`                                                                      |
| **依存**  | `STAGE.DOME_SCALE`, `models/floor-transformed.glb`, `textures/floor_texture.jpg` |

**実装:** `groundRef` は床グループに紐づき、`Player` のレイキャスト接地判定に使う。

---

### FloatingWorldModel.tsx

| 項目      | 内容                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| **責務**  | 浮遊オブジェクト共通の GLTF 描画・上下動・傾き・追加 `onFrame` 処理          |
| **Props** | `modelPath`, `meshNodeKey`, `floating`, `position?`, `rotation?`, `onFrame?` |
| **依存**  | `useGLTF`, `useFrame`                                                        |

**実装:**

- `Math.sin` で Y 軸方向の浮遊を付与。
- Z 回転に微小な揺れを付与。
- 機能固有の近接判定は `onFrame` で注入する。

---

### BookObject.tsx

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| **責務**  | 本モデルの表示と近接判定                               |
| **Props** | `FloatingWorldModel` 相当の props + `playerRef?`       |
| **依存**  | `BOOK.NEARBY_THRESHOLD`, `FLOATING.book`, `useUIStore` |

**実装:**

- `FloatingWorldModel` に `book-transformed.glb` を渡して描画。
- `activeOverlay !== "none"` の間は近接フラグを必ず落とす。
- 近接時は `setNearbyState("book", true)` を実行。

---

### BoxObject.tsx

| 項目      | 内容                                                 |
| --------- | ---------------------------------------------------- |
| **責務**  | 箱モデルの表示と近接判定                             |
| **Props** | `FloatingWorldModel` 相当の props + `playerRef?`     |
| **依存**  | `BOX.NEARBY_THRESHOLD`, `FLOATING.box`, `useUIStore` |

**実装:** `BookObject` と同様に `activeOverlay` 中は近接更新を止め、通常時だけ `setNearbyState("box", isNearby)` を差分更新する。

---

### PostObject.tsx

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| **責務**  | ポストモデルの表示と近接判定                           |
| **Props** | `FloatingWorldModel` 相当の props + `playerRef?`       |
| **依存**  | `POST.NEARBY_THRESHOLD`, `FLOATING.post`, `useUIStore` |

**実装:** `post-transformed.glb` を描画し、近接判定結果を `setNearbyState("post", isNearby)` に反映する。

---

### ComputerObject.tsx

| 項目      | 内容                                                           |
| --------- | -------------------------------------------------------------- |
| **責務**  | コンピューターモデルの表示と近接判定                           |
| **Props** | `FloatingWorldModel` 相当の props + `playerRef?`               |
| **依存**  | `COMPUTER.NEARBY_THRESHOLD`, `FLOATING.computer`, `useUIStore` |

**実装:**

- 通常時は `FLOATING.computer` を適用。
- `activeOverlay === "computer"` の間は浮遊パラメータを 0 にして静止。
- `activeOverlay !== "none"` 中は近接状態を解除。

---

### Player.tsx

| 項目      | 内容                                                          |
| --------- | ------------------------------------------------------------- |
| **責務**  | キー入力 + ジョイスティック入力の統合、移動、接地、カメラ追従 |
| **Props** | `groundRef`, `isMobile`, `playerRef`                          |
| **依存**  | `PLAYER`, `CAMERA`, `LAYOUT`, `useUIStore`, `Coco`            |

**入力:**

- キーボード: `ArrowUp/Down/Left/Right`
- ストア: `joystick`
- `activeOverlay === "dialogue"` または `"computer"` の間は移動入力を無効化

**移動:**

- `rotation.y` を左右入力で更新
- `sin/cos(rotation.y)` で前進・後退
- 半径 `BOUNDARY_RADIUS` を超えたら円周上へ補正

**接地:**

- プレイヤー頭上から床へレイキャスト
- ヒット時は `hitPoint.y + 0.5 + GROUND_OFFSET`
- 非ヒット時は `GRAVITY` で落下

**カメラ:**

- 通常時はプレイヤー背後から追従
- `dialogue` 中は `targetPosition` を中心にクリスタルを注視
- `computer` 中はコンピューター前面へ固定

**最適化:** `isMoving` と `moveDirection` は ref で前回値を保持し、不要な `setState` を減らす。

---

### Coco.tsx

| 項目      | 内容                                                            |
| --------- | --------------------------------------------------------------- |
| **責務**  | プレイヤーモデル表示、Matcap 適用、アニメーション再生           |
| **Props** | `isMoving`, `moveDirection`                                     |
| **依存**  | `models/coco.glb`, `textures/coco_texture.png`, `SkeletonUtils` |

**実装:**

- `SkeletonUtils.clone(scene)` で複製したモデルを使用。
- `Body` メッシュに `MeshMatcapMaterial` を適用。
- 移動中は最初の animation action を `setEffectiveTimeScale(moveDirection)` で再生、停止時は `action.stop()`。

---

### Crystal.tsx

| 項目      | 内容                                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| **責務**  | クリスタル表示、セクター内徘徊、会話担当制                                                   |
| **Props** | `id`, `position`, `message`, `scale?`, `sectorStart`, `sectorSize`, `playerRef`, `isFrozen?` |
| **依存**  | `CRYSTAL`, `useUIStore`, `models/crystal-transformed.glb`, `textures/crystal_texture.jpg`    |

**実装:**

- 各クリスタルは自分の担当セクター内で次の目標位置をサンプリングして移動。
- 近距離で担当になった個体だけが `activeCrystalId`, `activeMessage`, `targetPosition` を更新する。
- 近接判定と会話対象化は `crystalInteraction.ts` の helper に集約している。
- `setNearbyState("crystal", ...)` を通じて TAP 導線の最優先対象になる。
- `isFrozen=true` の間は徘徊・注視・浮遊をすべて停止。

---

### IntroCrystal.tsx

| 項目      | 内容                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| **責務**  | 初回導入用 crystal の待機、クリック待ち、帰投、通常徘徊への合流                                                        |
| **Props** | `id`, `initialPosition`, `releasePosition`, `message`, `scale?`, `sectorStart`, `sectorSize`, `playerRef`, `isFrozen?` |
| **依存**  | `useUIStore`, `crystalInteraction.ts`, `CRYSTAL`                                                                       |

**実装:**

- 開始位置は `[-3.2, 2, -3.2]` で、`box` と `computer` の間を担当する個体を使う。
- `introSequence` が `approach` の間はその場で `1.5 秒` 待機する。
- `message` の間は `introFocusPosition` を更新し、カメラ演出と `IntroOverlay` の表示を支える。
- クリックで `release` に進み、自分の担当セクター内の `releasePosition` へ戻る。
- `release` 中はプレイヤーではなく帰投先の方向を向く。
- 帰投完了後は通常の crystal と同じ近接判定・会話・徘徊ロジックへ合流する。

---

### IntroOverlay.tsx

| 項目      | 内容                                             |
| --------- | ------------------------------------------------ |
| **責務**  | 開始演出中の歓迎メッセージ表示と継続クリック待ち |
| **Props** | なし                                             |
| **依存**  | `useUIStore`                                     |

**表示条件:** `introSequence === "message"` かつ `introMessage` が存在するとき。

**表示仕様:**

- Desktop では `ようこそ！見に来てくれて嬉しいです。` を 1 行表示。
- Mobile では `ようこそ！` の後で改行し、2 行表示する。
- 吹き出しの見た目は `DialogueOverlay` と同じトーンに揃える。

**閉じ方:** 全画面クリックで `introSequence = "release"`。

---

### JoystickControls.tsx

| 項目      | 内容                                                                       |
| --------- | -------------------------------------------------------------------------- |
| **責務**  | 全画面 pointer レイヤー上で仮想ジョイスティックを表示し、`joystick` を更新 |
| **Props** | なし                                                                       |
| **依存**  | `useUIStore`                                                               |

**実装:**

- `pointerdown` 位置をベースにしてジョイスティックの中心を決定。
- 半径 `60` の円内にノブ位置をクランプ。
- `setJoystick(clampedX / RADIUS, -clampedY / RADIUS, true)` で正規化値を保存。
- `dialogue` 中は UI 自体を描画しない。

---

### InteractionPrompt.tsx

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| **責務**  | 近接対象に応じて中央の `TAP` ボタンを 1 つだけ表示 |
| **Props** | なし                                               |
| **依存**  | `useUIStore`, `selectInteractionTarget()`          |

**実装:**

- `uiStore` の selector が `interactionTarget` を返せないときは非表示。
- `interactionTarget` に応じて以下の action を実行:
  - `crystal` → `startDialogue()`
  - `book` → `openBook()`
  - `box` → `openBox()`
  - `post` → `openPost()`
  - `computer` → `openComputer()`

---

### OverlayRoot.tsx

| 項目      | 内容                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| **責務**  | `activeOverlay` を見て Overlay を 1 つだけ描画                                                 |
| **Props** | なし                                                                                           |
| **依存**  | `useUIStore`, `DialogueOverlay`, `BookOverlay`, `BoxOverlay`, `PostOverlay`, `ComputerOverlay` |

**切替対象:** `dialogue`, `book`, `box`, `post`, `computer`。

---

### DialogueOverlay.tsx

| 項目      | 内容                       |
| --------- | -------------------------- |
| **責務**  | クリスタルのメッセージ表示 |
| **Props** | なし                       |
| **依存**  | `useUIStore`               |

**表示条件:** `activeOverlay === "dialogue"` かつ `activeMessage` が存在するとき。

**閉じ方:** 背景クリックで `closeDialogue()`。

---

### BookOverlay.tsx

| 項目      | 内容                                           |
| --------- | ---------------------------------------------- |
| **責務**  | ぼうけんのしょ UI の表示                       |
| **Props** | なし                                           |
| **依存**  | `useUIStore`, `bookData.ts`, `.font-adventure` |

**表示条件:** `activeOverlay === "book"`。

**状態:**

- 一覧表示時は `selectedAdventureSlot === null`
- 詳細表示時は `selectedAdventureSlot` に応じて `getAdventureSlot()` を参照

**閉じ方:** 背景クリック、`Esc`、`とじる`。

**補足:** 詳細表示中に `Esc` を押すと overlay を閉じず一覧へ戻る。

---

### BoxOverlay.tsx

| 項目      | 内容                                                |
| --------- | --------------------------------------------------- |
| **責務**  | BOX UI の表示、menu/grid 切替、詳細表示、ページング |
| **Props** | なし                                                |
| **依存**  | `useUIStore`, `boxData.ts`, `next/image`            |

**表示条件:** `activeOverlay === "box"`。

**内部状態（store 管理）:**

- `boxView: "menu" | "grid"`
- `activeBoxCategory: "skills" | "items" | null`
- `currentBoxPage`
- `selectedBoxSlotIndex`

**表示仕様:**

- PC: 10x10 グリッド（`SLOTS_PER_PAGE = 100`）
- Mobile: 6x6 グリッド（36 スロット）
- `skills` と `items` でデータソースを切替

**データ:**

- `SKILL_ENTRIES`: レア度、斬れ味レベル、攻撃力文字列、説明、画像 URL
- `ITEM_ENTRIES`: `バクオンソー x100 → リプトン x12 → ぶたくん x1` の固定順配列
- `getBoxImageUrls()`: スキルとアイテムの画像 URL をユニーク化して返す

**補足:**

- 選択セルのハイライトは `classList` の直接更新で O(1) 反映する。
- Grid と詳細パネルの画像は `webp` を参照する。

---

### PostOverlay.tsx

| 項目      | 内容                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| **責務**  | 手紙 UI の表示、フォーム入力、送信、SNS モーダル                                 |
| **Props** | なし                                                                             |
| **依存**  | `useUIStore`, `next/image`, `react-icons/fa`, `/api/letter`, `public/post/*.png` |

**表示条件:** `activeOverlay === "post"`。

**ローカル state:**

- `name`, `email`, `message`
- `isSending`, `submitError`, `submitSuccess`
- `isStampModalOpen`

**送信:**

- `fetch("/api/letter")` に POST
- body: `name`, `email`, `message`, `meta.sentAt`, `meta.userAgent`, `meta.screenSize`, `meta.language`
- 成功時はメッセージ表示後、約 2 秒で自動クローズ
- 送信成功メッセージは `Your letter has been sent.` / `Thank you for your message.`

**閉じ方:** 背景クリック、`Esc`、手紙の外側に配置した `×` ボタン。

**レイアウト補足:**

- Mobile では手紙全体を `top: 52%` に下げ、上側の余白を確保する。
- 閉じるボタンは切手と干渉しないよう、手紙画像の外側上部に配置する。
- 切手から開くリンク一覧モーダルの見出しは `Links`。
- メール欄 placeholder は `よければメールアドレスも`。
- メッセージ欄 placeholder は `お気軽にメッセージをどうぞ。ひとことでも嬉しいです。`。

---

### ComputerOverlay.tsx

| 項目      | 内容                                          |
| --------- | --------------------------------------------- |
| **責務**  | 額縁 UI で作品画像と説明を表示                |
| **Props** | なし                                          |
| **依存**  | `useUIStore`, `computerData.ts`, `next/image` |

**表示条件:** `activeOverlay === "computer"`。

**状態:**

- store: `tabletScreenImageIndex`
- local: `showWhitePanel`, `showFrame`

**実装:**

- オープン後 `250ms` で白パネル、`600ms` で額縁と説明文を表示。
- 表示作品は `COMPUTER_WORKS[currentIndex]`。
- 作品数が 2 件以上のとき左右ボタンで循環切替。
- `href` がある作品のみクリックで外部サイトへ遷移。
- `closeComputer()` 時に `tabletScreenImageIndex` は 0 に戻る。

---

### SectionImagesPreloader.tsx

| 項目      | 内容                                                             |
| --------- | ---------------------------------------------------------------- |
| **責務**  | ワールド表示後に Box / Post / Computer 画像を 1 回だけプリロード |
| **Props** | なし                                                             |
| **依存**  | `preloadWorldImages.ts`                                          |

**実装:** `useEffect` で `preloadSectionImages()` を 1 回呼び出し、R3F 内では `<group />` を返すだけ。

---

### preloadWorldImages.ts

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| **責務** | 画像 URL を順に `new Image().src = url` で先読み            |
| **依存** | `getBoxImageUrls`, `POST_IMAGE_URLS`, `COMPUTER_IMAGE_URLS` |

---

### app/api/letter/route.ts

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| **責務** | Post オーバーレイのフォーム内容をメール送信し、JSON を返す |
| **依存** | `next/server`, `resend`                                    |

**エンドポイント:** `POST /api/letter`

**入力:** `name`, `email`, `message`, `meta`

**配送:** `Resend.emails.send()` を使い、`process.env.MY_EMAIL` へ送信。

**必要環境変数:** `RESEND_API_KEY`, `MY_EMAIL`

---

## 設定リファレンス

設定ファイルは `features/world/worldConfig.ts`。

### STAGE

| キー              | 型     | 値   | 説明            |
| ----------------- | ------ | ---- | --------------- |
| `DOME_POSITION_Y` | number | `-7` | ドームの Y 位置 |
| `DOME_SCALE`      | number | `20` | 床スケール      |

### CAMERA

| デバイス | キー            | 値           | 説明                  |
| -------- | --------------- | ------------ | --------------------- |
| pc       | `fov`           | `50`         | 視野角                |
| pc       | `distance`      | `8`          | プレイヤー追従距離    |
| pc       | `height`        | `5`          | プレイヤー追従高さ    |
| pc       | `lookAtOffsetY` | `1.5`        | 注視点の Y オフセット |
| pc       | `position`      | `[0, 5, 12]` | 初期カメラ位置        |
| mobile   | `fov`           | `55`         | 視野角                |
| mobile   | `distance`      | `6`          | プレイヤー追従距離    |
| mobile   | `height`        | `4`          | プレイヤー追従高さ    |
| mobile   | `lookAtOffsetY` | `1.5`        | 注視点の Y オフセット |
| mobile   | `position`      | `[0, 4, 10]` | 初期カメラ位置        |

### PLAYER

| キー                 | 値    | 説明               |
| -------------------- | ----- | ------------------ |
| `MOVE_SPEED`         | `5`   | 前進・後退速度     |
| `ROTATION_SPEED`     | `3`   | 旋回速度           |
| `RAYCAST_OFFSET`     | `5`   | 接地レイの開始高さ |
| `GRAVITY`            | `0.2` | 落下速度           |
| `FALL_THRESHOLD`     | `-10` | 落下停止閾値       |
| `GROUND_OFFSET`      | `0`   | 接地時補正         |
| `INITIAL_X`          | `0`   | 初期 X             |
| `INITIAL_Y`          | `10`  | 初期 Y             |
| `INITIAL_Z`          | `0`   | 初期 Z             |
| `INITIAL_ROTATION_Y` | `0`   | 初期向き           |
| `BOUNDARY_RADIUS`    | `20`  | 移動可能半径       |

### CRYSTAL

| キー         | 値   | 説明               |
| ------------ | ---- | ------------------ |
| `SPEED`      | `2`  | 徘徊速度           |
| `MIN_RADIUS` | `10` | 徘徊リング内側半径 |
| `MAX_RADIUS` | `15` | 徘徊リング外側半径 |

### BOOK / BOX / POST / COMPUTER

| セクション | キー               | 値   | 説明                         |
| ---------- | ------------------ | ---- | ---------------------------- |
| BOOK       | `NEARBY_THRESHOLD` | `15` | 本の近接判定距離             |
| BOX        | `NEARBY_THRESHOLD` | `15` | 箱の近接判定距離             |
| POST       | `NEARBY_THRESHOLD` | `15` | ポストの近接判定距離         |
| COMPUTER   | `NEARBY_THRESHOLD` | `15` | コンピューターの近接判定距離 |

### LAYOUT

| キー                 | 値    | 説明                         |
| -------------------- | ----- | ---------------------------- |
| `OBJECT_RING_RADIUS` | `30`  | 4 オブジェクトを置く円の半径 |
| `BOOK_HEIGHT`        | `4`   | 本の高さ                     |
| `POST_HEIGHT`        | `5`   | ポストの高さ                 |
| `BOX_HEIGHT`         | `5`   | 箱の高さ                     |
| `COMPUTER_HEIGHT`    | `3.5` | コンピューターの高さ         |
| `BOOK_SCALE`         | `10`  | 本のスケール                 |
| `BOX_SCALE`          | `7`   | 箱のスケール                 |
| `POST_SCALE`         | `10`  | ポストのスケール             |
| `COMPUTER_SCALE`     | `9`   | コンピューターのスケール     |

### FLOATING

| オブジェクト | `FLOAT_SPEED` | `FLOAT_AMPLITUDE` | `TILT_SPEED` | `TILT_ANGLE` |
| ------------ | ------------- | ----------------- | ------------ | ------------ |
| book         | `1.0`         | `0.3`             | `2.5`        | `0.08`       |
| post         | `1.0`         | `0.3`             | `2.5`        | `0.08`       |
| computer     | `1.2`         | `0.28`            | `2.2`        | `0.07`       |
| box          | `0.9`         | `0.32`            | `2.8`        | `0.09`       |

---

## データフロー

```
[useDeviceType] → isMobile
       ↓
[World] → camera 設定と Player props を切替

[キー入力] ─────────────┐
                        ├→ [Player] → 移動 / 回転 / 接地 / カメラ追従
[JoystickControls] ────┘
        ↓
   [uiStore.joystick]

[BookObject / BoxObject / PostObject / ComputerObject / Crystal]
        ↓
   setNearbyState(target, isNearby)
        ↓
   [uiStore.nearbyStates]
        ↓
   resolveNearbyTarget()
        ↓
   [uiStore.nearbyTarget]
        ↓
   [InteractionPrompt]
        ↓
   openBook / openBox / openPost / openComputer / startDialogue
        ↓
   [uiStore.activeOverlay]
        ↓
   [OverlayRoot]
        ↓
   DialogueOverlay / BookOverlay / BoxOverlay / PostOverlay / ComputerOverlay
```

### useUIStore（Zustand）

**グローバル入力:**

- `joystick: { x, y, isMoving }`

**全体状態:**

- `activeOverlay: "none" | "dialogue" | "book" | "box" | "post" | "computer"`
- `nearbyTarget: "book" | "box" | "post" | "computer" | "crystal" | null`
- `nearbyStates: Record<"book" | "box" | "post" | "computer" | "crystal", boolean>`
- `activeCrystalId`
- `activeMessage`
- `targetPosition`
- `introSequence: "approach" | "message" | "release" | "done"`
- `introMessage`
- `introFocusPosition`

**Book 状態:**

- `selectedAdventureSlot`

**Box 状態:**

- `boxView`
- `activeBoxCategory`
- `currentBoxPage`
- `selectedBoxSlotIndex`

**Computer 状態:**

- `tabletScreenImageIndex`

**主要 action:**

- `setJoystick`
- `setNearbyState`
- `setActiveCrystal`
- `setTargetPosition`
- `setIntroSequence`
- `setIntroMessage`
- `setIntroFocusPosition`
- `finishIntro`
- `startDialogue` / `closeDialogue`
- `openBook` / `closeBook`
- `openBox` / `closeBox`
- `openPost` / `closePost`
- `openComputer` / `closeComputer`
- `closeActiveOverlay`

### `nearbyTarget` の優先順位

`resolveNearbyTarget()` は次の順で最初に真になった対象を採用する。

1. `crystal`
2. `book`
3. `box`
4. `post`
5. `computer`

### `interactionTarget` の決定規則

- `activeOverlay !== "none"` のときは `null`
- `introSequence` が `approach` または `message` のときは `null`
- `activeCrystalId` と `activeMessage` が揃っていれば `crystal`
- それ以外は `nearbyTarget`

### Overlay の原則

- オーバーレイは 1 つだけ。
- `open*()` 系 action は `activeOverlay` を更新しつつ `nearbyTarget` をクリアする。
- `close*()` 系 action は feature ごとの補助状態も初期化する。

---

## レンダリングパイプライン

1. `page.tsx` が `World` と UI レイヤーを同時に配置
2. `World` が `Canvas` を構築し、環境・光源・3D オブジェクトを描画
3. `Player` と各オブジェクトが `useFrame` で移動・近接・カメラを更新
4. `IntroOverlay` が開始メッセージを表示し、クリック待ちを行う
5. `InteractionPrompt` が `interactionTarget` に応じた単一 TAP 導線を表示
6. `OverlayRoot` が `activeOverlay` に応じた UI を 1 つだけ描画
7. `SectionImagesPreloader` が Post / Box / Computer の画像を背後で先読み

**停止条件:**

- `activeOverlay !== "none"` の間は `Crystal` 全体を停止
- `activeOverlay === "computer"` の間は `ComputerObject` の浮遊を停止
- `introSequence === "approach"` または `"message"` の間はプレイヤー入力を停止

---

## 座標系・空間

- Three.js の右手系。Y 軸が上。
- プレイヤー移動範囲は原点中心、半径 `20` の円。
- 4 オブジェクトは半径 `30` の円周 4 点に 90 度ずつ配置。
- クリスタルは半径 `10`〜`15` のリング上を徘徊。
- プレイヤー初期位置は `(0, 10, 0)`。
- 通常カメラはプレイヤー後方上部から `lerp(0.1)` で追従する。

---

## アルゴリズム

### 接地判定

1. プレイヤー位置の上方 `RAYCAST_OFFSET` から下向きレイを飛ばす
2. `groundRef` 配下の床メッシュと交差判定する
3. ヒット時は `hitPoint.y + 0.5 + GROUND_OFFSET` を適用
4. 非ヒット時は `GRAVITY` で落下する

### 入力統合

- キーボードとジョイスティックの X/Y 入力を合算
- 長さが 1 を超える場合は正規化
- `dialogue` と `computer`、および開始演出の `approach` / `message` 中は移動入力を止める

### 近接判定

- Book / Box / Post / Computer は `group.position.distanceTo(playerPosition)` で判定
- しきい値は全て `15`
- `activeOverlay !== "none"` の間は近接状態を解除する

### クリスタル徘徊

- 各クリスタルは担当セクター内の新しい目標点をランダムに選ぶ
- `delta > 0.5` のフレームでは位置更新をせず、次の目標だけ更新してワープ感を防ぐ
- 担当制は `5m` 以内で獲得、担当中は `7m` まで維持

### 開始演出

- `IntroCrystal` はプレイヤー斜め前の開始位置で `1.5 秒` 待機する
- `message` 中は `IntroOverlay` とカメラ寄りを維持し、クリックまで待機する
- `release` では担当セクター内の `releasePosition` まで戻り、その後通常徘徊へ合流する

### Box グリッド最適化

- PC は 100 セル、Mobile は 36 セル
- 選択ハイライトは ref と `classList` で前回セル / 今回セルだけを更新

### Computer 作品切替

- `tabletScreenImageIndex` は updater 関数を受け取れる
- 表示時は `((index % length) + length) % length` で剰余正規化する
- `closeComputer()` で index は 0 に戻る

---

## アセット

| パス                              | 形式 | 用途                      | ノード名 / 備考                         |
| --------------------------------- | ---- | ------------------------- | --------------------------------------- |
| `models/coco.glb`                 | GLB  | プレイヤー（Coco）        | Scene を `SkeletonUtils.clone` して利用 |
| `models/crystal-transformed.glb`  | GLB  | クリスタル                | `Body`, `Left_Eye`                      |
| `models/dome-transformed.glb`     | GLB  | ドーム                    | `Dome`                                  |
| `models/floor-transformed.glb`    | GLB  | 床                        | `Floor`                                 |
| `models/book-transformed.glb`     | GLB  | 本                        | `Mesh_0`                                |
| `models/box-transformed.glb`      | GLB  | 箱                        | `mesh_0`                                |
| `models/post-transformed.glb`     | GLB  | ポスト                    | `mesh_0`                                |
| `models/computer-transformed.glb` | GLB  | コンピューター            | `mesh_0`                                |
| `models/*.glb`（非 transformed）  | GLB  | 元モデル                  | レガシー保持                            |
| `computer/frame.png`              | PNG  | Computer オーバーレイ額縁 | -                                       |
| `computer/oox.png`                | PNG  | 作品画像                  | 外部リンクあり                          |
| `computer/cat.png`                | PNG  | 作品画像                  | 外部リンクなし                          |
| `items/bakuonso.webp`             | WebP | BOX アイテム画像          | -                                       |
| `items/butakun.webp`              | WebP | BOX アイテム画像          | -                                       |
| `items/lipton.webp`               | WebP | BOX アイテム画像          | -                                       |
| `skills/*.webp`                   | WebP | BOX スキル画像            | `boxData.ts` 参照                       |
| `post/letter.png`                 | PNG  | 手紙 UI 背景              | -                                       |
| `post/form_input.png`             | PNG  | 入力欄背景                | -                                       |
| `post/send-button.png`            | PNG  | 送信ボタン画像            | -                                       |
| `post/stamp.png`                  | PNG  | 切手画像                  | SNS モーダル起点                        |
| `textures/coco_texture.png`       | PNG  | Coco の Matcap            | -                                       |
| `textures/crystal_texture.jpg`    | JPG  | クリスタル Matcap         | -                                       |
| `textures/dome_texture.jpg`       | JPG  | ドーム Matcap             | -                                       |
| `textures/floor_texture.jpg`      | JPG  | 床 Matcap                 | -                                       |

---

## 開発ガイド

### 構造ルール

- 新しい機能は `features/<feature>/` に浅く追加する。
- その機能固有の 3D オブジェクトとオーバーレイは同じ feature 配下に置く。
- 横断状態や複数 feature をまたぐ UI は `shared/` に置く。
- シーン全体の定数は `features/world/worldConfig.ts` に集約する。

### 状態管理ルール

- オーバーレイの開閉は `activeOverlay` で一元管理する。
- 近接対象は boolean 群を増やさず `setNearbyState()` と `nearbyTarget` に寄せる。
- feature 内だけで閉じるフォーム入力や演出 state はローカル state に置く。

### モデル追加

- `public/models/` に GLB を置く。
- 浮遊オブジェクトなら `FloatingWorldModel.tsx` を流用する。
- 近接判定が必要なら `setNearbyState()` を使う。

### 環境変数

- `RESEND_API_KEY`
- `MY_EMAIL`

未設定時は `/api/letter` が `500` を返す。

---

## 今後の拡張

- [x] オーバーレイ状態の一元化（`activeOverlay`）
- [x] 近接対象の一元化（`nearbyTarget`）
- [x] feature 単位の浅いディレクトリ構成への移行
- [x] Computer 作品データの `computerData.ts` への集約
- [ ] `/api/letter` の入力検証と rate limit
- [ ] `JoystickControls` の desktop / mobile 出し分け
- [ ] `PostOverlay` の送信エラー UX 改善

---

## トラブルシューティング

| 現象                                       | 原因                                                        | 対処                                                                       |
| ------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| プレイヤーが床をすり抜ける                 | `groundRef` が床メッシュを取れていない                      | `Floor.tsx` の ref 設定と床モデルの当たり判定を確認                        |
| 近くにいるのに TAP が出ない                | `interactionTarget` が `null`、または他対象が優先されている | `activeOverlay`, `introSequence`, `activeCrystalId`, `nearbyTarget` を確認 |
| Computer が開いても作品が出ない            | `tabletScreenImageIndex` が範囲外                           | `currentIndex` の剰余正規化と `COMPUTER_WORKS.length` を確認               |
| Box / Post / Computer 画像の初回表示が遅い | プリロード未実行                                            | `SectionImagesPreloader` が `World` 内でマウントされているか確認           |
| 手紙送信に失敗する                         | 環境変数未設定、または Resend エラー                        | `RESEND_API_KEY`, `MY_EMAIL`, API レスポンスを確認                         |
| `next build` が fonts 取得で失敗する       | `next/font/google` がネットワーク制限下で取得できない       | ネットワークあり環境でビルドするか、ローカルフォント化を検討               |

---

## ドキュメントの使い分け

| ファイル    | 用途                                |
| ----------- | ----------------------------------- |
| `README.md` | GitHub 公開向けの概要・セットアップ |
| `SPEC.md`   | 開発・AI エージェント向けの内部仕様 |
