# アプリ仕様書

ポートフォリオ用 3D ワールドアプリの完全仕様。開発者・AI エージェント向けの文脈として参照する。

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

| 項目 | 内容 |
|------|------|
| **用途** | 3D 空間内でキャラクター（ココ）を操作できるインタラクティブなポートフォリオ |
| **操作** | PC: 矢印キー / Mobile: 仮想ジョイスティック（画面右下） |
| **シーン** | ドーム（壁）+ 床 + 本 + 箱 + ポスト + コンピューター + プレイヤー。第三者視点カメラで追従 |

---

## 技術スタック

| カテゴリ | ライブラリ | バージョン（package.json） | 用途 |
|----------|------------|---------------------------|------|
| フレームワーク | Next.js | ^16.1.6 | App Router, SSR/CSR |
| 3D レンダリング | React Three Fiber | ^9.5.0 | React 用 Three.js ラッパー |
| 3D ユーティリティ | @react-three/drei | ^10.7.7 | useGLTF, useTexture, Environment 等 |
| 3D ユーティリティ | three-stdlib | drei 経由 | GLTF 型、gltfjsx 生成コードで使用 |
| 3D エンジン | Three.js | ^0.182.0 | レンダリング基盤 |
| 状態管理 | Zustand | ^5.0.11 | 入力状態の共有（キーボード/ジョイスティック） |
| UI コンポーネント | react-joystick-component | ^6.2.1 | 仮想ジョイスティック |
| 言語 | TypeScript | ^5 | 型安全 |

### パスエイリアス

- `@/*` → `./*`（tsconfig.json の baseUrl: ".", paths: { "@/*": ["./*"] }）

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  app/page.tsx                                               │
│  ├── <World />                                              │
│  ├── <JoystickControls />  ← 仮想ジョイスティック（画面右下）  │
│  ├── <InteractionUI />     ← 会話UI（Tap/メッセージ）         │
│  ├── <AdventureBookUI />   ← ぼうけんのしょUI               │
│  ├── <BoxUI />             ← アイテムBOX UI（動的 import）   │
│  └── <Loader />            ← drei ローダー（進捗バー）         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  components/world/World.tsx                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Canvas (flat, dpr=[1,2], camera, frameloop)       │   │
│  │  ├── Dome                                           │   │
│  │  ├── Environment (preset=city)                      │   │
│  │  ├── ambientLight                                   │   │
│  │  ├── Sparkles (白パーティクル)                       │   │
│  │  ├── Floor ──────────── groundRef ─────────────────┐ │   │
│  │  ├── Book (浮遊表示 + 近接判定)                     │   │
│  │  ├── Box (左側配置)                                 │   │
│  │  ├── Post (奥側配置)                                │   │
│  │  ├── Computer (手前側配置)                          │   │
│  │  ├── Player ─────────── groundRef ────────────────┤ │   │
│  │  │    └── Coco (モデル+アニメーション)               │   │
│  │  └── Crystal ×4  ← ランダム配置/吹き出し              │   │
│  └─────────────────────────────────────────────────────┘   │
│  groundRef を Floor と Player で共有。useDeviceType で      │
│  isMobile を判定し、CAMERA と Player に渡す                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Dome.tsx    │    │  Floor.tsx   │    │  Player.tsx  │
│  - dome-transformed │    │  - floor-transformed │    │  - Coco 子   │
│  - Matcap    │    │  - Matcap    │    │  - キー+ジョイ │
│  - scale 1.8 │    │  - scale 20  │    │  - 接地判定   │
│  - Y=-7      │    │  - groundRef │    │  - カメラ追従 │
└──────────────┘    └──────────────┘    └──────────────┘
          │
          ▼
┌──────────────┐
│ Crystal.tsx  │
│ - crystal-transformed │
│ - Matcap    │
│ - 浮遊+距離で表示 │
└──────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  hooks/useDeviceType.ts  ← 768px 未満で isMobile             │
│  components/world/ui/JoystickControls.tsx                   │
│  components/ui/InteractionUI.tsx                            │
│  components/ui/AdventureBookUI.tsx                          │
│  components/ui/BoxUI.tsx                                    │
│  lib/world/store.ts (Zustand: input + dialogue + book + box) │
│  lib/world/adventureBookData.ts（ぼうけんのしょ定義）        │
│  lib/world/boxData.ts（BOX 表示データ）                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
frontend/
├── app/
│   ├── page.tsx              # ルートページ。World + JoystickControls + UI群を表示
│   ├── layout.tsx            # ルートレイアウト（Geist + DotGothic16 フォント変数）
│   ├── globals.css           # グローバルCSS（font-adventure クラスを定義）
│   └── favicon.ico
├── components/world/
│   ├── World.tsx             # メイン。Canvas + シーン構成
│   ├── Dome.tsx               # ドーム（壁）
│   ├── Floor.tsx              # 床
│   ├── Book.jsx               # 本モデル（浮遊アニメーション）
│   ├── Box.jsx                # 箱モデル
│   ├── Post.jsx               # ポストモデル
│   ├── Computer.jsx           # コンピューターモデル
│   ├── Player.tsx             # プレイヤー（移動・入力・接地・カメラ）
│   ├── Coco.tsx               # ココモデル表示・アニメーション（gltfjsx 生成）
│   ├── Crystal.tsx            # クリスタル（徘徊・対話）
│   └── ui/
│       └── JoystickControls.tsx  # 仮想ジョイスティック（動的配置）
├── components/ui/
│   ├── InteractionUI.tsx      # 会話UI（Tap/メッセージ + 本へのTAP導線）
│   ├── AdventureBookUI.tsx    # ぼうけんのしょUI（スロット選択/詳細）
│   └── BoxUI.tsx              # アイテムBOX UI（メニュー/可変グリッド）
├── hooks/
│   └── useDeviceType.ts      # PC/Mobile 判定（768px 未満でモバイル）
├── lib/world/
│   ├── config.ts             # STAGE, CAMERA, PLAYER, LAYOUT, FLOATING 定数
│   ├── store.ts              # Zustand。入力 + 対話 + 本UI + BoxUI状態
│   ├── adventureBookData.ts  # ぼうけんのしょ表示データ
│   └── boxData.ts            # BoxUI表示データ（スキル/アイテム）
├── public/
│   ├── models/
│   │   ├── coco-transformed.glb   # Coco の旧変換モデル（現状は未使用）
│   │   ├── crystal-transformed.glb # クリスタル。gltfjsx 用に変換済み
│   │   ├── dome-transformed.glb  # ドーム（Dome）。gltfjsx 用に変換済み
│   │   ├── floor-transformed.glb # 床（Floor）。gltfjsx 用に変換済み
│   │   ├── book-transformed.glb # 本（Book）。gltfjsx 用に変換済み
│   │   ├── box-transformed.glb # 箱（Box）。gltfjsx 用に変換済み
│   │   ├── post-transformed.glb # ポスト（Post）。gltfjsx 用に変換済み
│   │   ├── computer-transformed.glb # コンピューター（Computer）。gltfjsx 用に変換済み
│   │   ├── coco.glb               # プレイヤー（Coco）で使用
│   │   ├── crystal.glb, dome.glb, floor.glb, book.glb, box.glb, post.glb, computer.glb  # 元モデル（レガシー）
│   └── textures/
│       ├── coco_texture.png   # Coco Body の Matcap
│       ├── crystal_texture.jpg # クリスタル Matcap
│       ├── dome_texture.jpg  # ドーム用 Matcap
│       └── floor_texture.jpg # 床用 Matcap
├── SPEC.md                   # 本ドキュメント
└── package.json
```

---

## コンポーネント詳細

### World.tsx

| 項目 | 内容 |
|------|------|
| **責務** | Canvas の設定、環境・照明、子コンポーネントの組み立て |
| **Props** | なし |
| **状態** | `groundRef`（Floor と Player に渡す）、`playerRef`（Player/Book/Box/Crystal に渡す）、`useDeviceType()` で isMobile、`crystals`（4体のリング配置）、`boxView` と `isAdventureBookOpen`（overlay判定） |
| **子** | Dome, Environment, ambientLight, Sparkles, Floor, Book（`playerRef`）, Box（`playerRef`）, Post, Computer, Player, Crystal ×4 |

**Canvas 設定:**
- `flat`: 物理ベースのライティングを無効化（フラットシェーディング）
- `dpr={[1, 2]}`: デバイスピクセル比 1〜2 で自動調整
- `key={isMobile ? "mobile" : "pc"}`: デバイス切り替え時に Canvas を再マウントしてカメラ設定を反映
- `frameloop`: `boxView !== "closed"` または `isAdventureBookOpen` の間は `"demand"` に切り替え、3D更新を停止してUI表示時の負荷を削減
- `camera`: useDeviceType で isMobile を取得し、CAMERA.mobile / CAMERA.pc から fov, position を取得
- `Environment`: `environmentIntensity={2}`
- `ambientLight`: `intensity={2}`
- `Sparkles`: `count=1000`, `scale=35`, `position={[0,6,0]}` の白パーティクルを常時描画

**背景:** 親 div の `bg-black`（Tailwind）で黒背景。Canvas 内に `<color attach="background">` はなし。
**レイアウト定数:** Book/Box/Post/Computer の位置・スケールは `LAYOUT`（`lib/world/config.ts`）から取得。90°ごとの円形配置を使用。
**クリスタル配置:** `useMemo` で 4体を生成。リング（半径 10〜15）を 4 等分し、各セクター内で初期位置を生成。`id` を付与して Crystal に渡し、メッセージは固定4文を順番に割り当て。

---

### Dome.tsx

| 項目 | 内容 |
|------|------|
| **責務** | ドームモデルの表示 |
| **Props** | なし |
| **依存** | STAGE.DOME_POSITION_Y, dome-transformed.glb（gltfjsx 生成） |

**モデル:** `models/dome-transformed.glb` の `nodes.Dome`。gltfjsx で生成。`as unknown as GLTFResult` で型アサーション  
**マテリアル:** meshMatcapMaterial（useTexture で dome_texture.jpg）, `side={DoubleSide}`, `color="#ffffff"`  
**位置:** `[0, DOME_POSITION_Y, 0]`（床の下端と揃えるため Y=-7）  
**スケール:** [1.8, 1.8, 1.8]  
**プリロード:** `useGLTF.preload("/models/dome-transformed.glb")`

---

### Floor.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 床モデルの表示、接地判定用 groundRef の設定 |
| **Props** | `groundRef: React.RefObject<THREE.Object3D \| null>` |
| **依存** | STAGE.DOME_SCALE, floor-transformed.glb（gltfjsx 生成） |

**モデル:** `models/floor-transformed.glb` の `nodes.Floor`。gltfjsx で生成。`as unknown as GLTFResult` で型アサーション  
**マテリアル:** meshMatcapMaterial（useTexture で floor_texture.jpg）, `color="#ffffff"`  
**スケール:** `[DOME_SCALE, DOME_SCALE, DOME_SCALE]`（20）  
**groundRef:** ルートの `<group ref={groundRef}>` に設定  
**プリロード:** `useGLTF.preload("/models/floor-transformed.glb")`

---

### Book.jsx

| 項目 | 内容 |
|------|------|
| **責務** | 本モデルの表示、浮遊アニメーション、プレイヤー近接判定（本TAP表示用） |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など）+ `playerRef` |
| **依存** | book-transformed.glb, `BOOK.NEARBY_THRESHOLD`, useInputStore |

**モデル:** `models/book-transformed.glb` の `nodes.Mesh_0` を使用（未取得時は `null` を返して描画しない）  
**浮遊+傾き:** パラメータは `FLOATING.book` を使用。`useFrame` で Y と Z 回転を更新  
**近接判定:** `useFrame` で本とプレイヤー距離を計算し、`dist < BOOK.NEARBY_THRESHOLD` なら `setIsBookNearby(true)`。`isTalking` または `isAdventureBookOpen` 中は判定を無効化  
**配置:** World から `position={[LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOOK_HEIGHT, 0]}`、`scale={LAYOUT.BOOK_SCALE}`、`rotation={[0, 0, 0]}`  
**参照:** `World` から `playerRef` を受け取り、未指定時は `state.camera.position` をフォールバックとして使用  
**プリロード:** `useGLTF.preload("/models/book-transformed.glb")`

---

### Box.jsx

| 項目 | 内容 |
|------|------|
| **責務** | 箱モデルの表示、浮遊アニメーション、プレイヤー近接判定（Box TAP表示用） |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など）+ `playerRef` |
| **依存** | box-transformed.glb, `BOX.NEARBY_THRESHOLD`, useInputStore |

**モデル:** `models/box-transformed.glb` の `nodes.mesh_0` を使用（未取得時は `null` を返して描画しない）  
**浮遊+傾き:** パラメータは `FLOATING.box` を使用。`useFrame` で Y と Z 回転を更新  
**近接判定:** `useFrame` で箱とプレイヤー距離を計算し、`dist < BOX.NEARBY_THRESHOLD` なら `setIsBoxNearby(true)`。`boxView !== "closed"` の間は更新を停止  
**配置:** World から `position={[-LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOX_HEIGHT, 0]}`、`scale={LAYOUT.BOX_SCALE}`、`rotation={[0, Math.PI / 2, 0]}`  
**参照:** `World` から `playerRef` を受け取り、未指定時は `state.camera.position` をフォールバックとして使用  
**プリロード:** `useGLTF.preload("/models/box-transformed.glb")`

---

### Post.jsx

| 項目 | 内容 |
|------|------|
| **責務** | ポストモデルの表示と浮遊アニメーション |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など） |
| **依存** | post-transformed.glb |

**モデル:** `models/post-transformed.glb` の `nodes.mesh_0` を使用（未取得時は `null` を返して描画しない）  
**浮遊+傾き:** パラメータは `FLOATING.post` を使用。`useFrame` で Y と Z 回転を更新  
**配置:** World から `position={[0, LAYOUT.POST_HEIGHT, LAYOUT.OBJECT_RING_RADIUS]}`、`scale={LAYOUT.POST_SCALE}`、`rotation={[0, Math.PI, 0]}`  
**プリロード:** `useGLTF.preload("/models/post-transformed.glb")`

---

### Computer.jsx

| 項目 | 内容 |
|------|------|
| **責務** | コンピューターモデルの表示と浮遊アニメーション |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など） |
| **依存** | computer-transformed.glb |

**モデル:** `models/computer-transformed.glb` の `nodes.mesh_0` を使用（未取得時は `null` を返して描画しない）  
**浮遊+傾き:** パラメータは `FLOATING.computer` を使用。`useFrame` で Y と Z 回転を更新  
**配置:** World から `position={[0, LAYOUT.COMPUTER_HEIGHT, -LAYOUT.OBJECT_RING_RADIUS]}`、`scale={LAYOUT.COMPUTER_SCALE}`（回転指定なし）  
**プリロード:** `useGLTF.preload("/models/computer-transformed.glb")`

---

### Player.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 入力処理、移動・回転、接地判定、境界制限、カメラ追従。Coco に isMoving/moveDirection を渡す |
| **Props** | `groundRef`, `isMobile: boolean`（useDeviceType の結果。CAMERA 切り替え用）, `playerRef`（World からの参照） |
| **依存** | PLAYER の全定数、CAMERA（isMobile で pc/mobile を切り替え）、Coco |

**構造:** `<group ref={playerRef}>` 内に `<Coco />` を配置。移動・接地・カメラは Player が担当し、モデル表示・アニメーションは Coco に委譲  
**初期位置:** `<group position={[PLAYER.INITIAL_X, PLAYER.INITIAL_Y, PLAYER.INITIAL_Z]}>` で生成  
**初期向き:** `useFrame` 内で初回のみ `player.rotation.y = PLAYER.INITIAL_ROTATION_Y` を適用  
**入力:** キーボード（ArrowUp/Down/Left/Right）+ ジョイスティック（useInputStore 経由）。両方を合算して適用。会話中（`isTalking`）は入力無効化  
**接地:** `hitPoint.y + PLAYER_HEIGHT_OFFSET (0.5) + GROUND_OFFSET` で Y 位置を設定（BoundingBox 計算は廃止）  
**カメラ:** 通常は isMobile に応じて CAMERA.mobile / CAMERA.pc を使用。会話中は targetPosition を正面から見る位置に移動して注視（距離 5）

---

### Coco.tsx

| 項目 | 内容 |
|------|------|
| **責務** | ココモデルの表示、Body への Matcap 適用、アニメーション制御 |
| **Props** | `isMoving: boolean`, `moveDirection: number`（1: 前進, -1: 後退） |
| **依存** | coco.glb, coco_texture.png, three-stdlib (SkeletonUtils) |

**モデル:** `models/coco.glb` を読み込み、`SkeletonUtils.clone` でシーンをクローン  
**マテリアル:** `Body` メッシュに `MeshMatcapMaterial` を適用し、`textures/coco_texture.png` を使用  
**アニメーション:** Player から渡された isMoving, moveDirection で `setEffectiveTimeScale(moveDirection)` と `stop()` を制御  
**forwardRef:** useImperativeHandle で内部 group を親に公開可能。現状 Player は ref を渡さず、`<group ref={group}>` 内の子として Coco を配置するため、group の transform が Coco に適用される  
**デバッグログ:** 初回にオブジェクト/メッシュ/マテリアル一覧を `console.log` 出力  
**プリロード:** `useGLTF.preload("/models/coco.glb")` で初回表示を高速化

---

### JoystickControls.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 仮想ジョイスティック UI の表示、useInputStore への入力反映 |
| **Props** | なし |
| **依存** | useInputStore |

**配置:** `fixed inset-0 z-50`（全画面）。タッチ位置にジョイスティックを動的表示  
**操作:** `basePos` をタップ地点に設定し、`onPointerMove` で `(current - base) / RADIUS` を計算  
**入力マッピング:** y → 前後（上=前, 下=後）、x → 旋回（右=正, 左=負）。`setJoystick(x, y, true)`  
**終了:** `onPointerUp/Cancel` で `setJoystick(0,0,false)` と UI を消去  
**会話時:** `isTalking` の間は描画しない

---

### useDeviceType

| 項目 | 内容 |
|------|------|
| **責務** | PC/Mobile の判定（画面幅ベース） |
| **戻り値** | `isMobile: boolean` |
| **判定基準** | `window.innerWidth < 768`（Tailwind の md ブレークポイント） |

**挙動:** 初回マウント時と resize イベントで再判定。World と Player で CAMERA の切り替えに使用。

---

## 設定リファレンス

### STAGE

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| DOME_POSITION_Y | number | -7 | ドームの Y 位置。床の下端と揃える |
| DOME_SCALE | number | 20 | 床のスケール |

### CAMERA

| デバイス | キー | 型 | 値 | 説明 |
|----------|------|-----|-----|------|
| pc | fov | number | 50 | 視野角（度） |
| pc | distance | number | 8 | カメラとプレイヤーの距離（Player で使用） |
| pc | height | number | 5 | カメラの高さ（Player で使用） |
| pc | lookAtOffsetY | number | 1.5 | 注視点をプレイヤーより上にずらす（空を多く写す） |
| pc | position | [x,y,z] | [0,5,12] | 初期カメラ位置（Canvas で使用） |
| mobile | fov | number | 55 | 視野角（度） |
| mobile | distance | number | 6 | カメラとプレイヤーの距離 |
| mobile | height | number | 4 | カメラの高さ |
| mobile | lookAtOffsetY | number | 1.5 | 注視点オフセット |
| mobile | position | [x,y,z] | [0,4,10] | 初期カメラ位置 |

### PLAYER

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| MOVE_SPEED | number | 5.0 | 前進・後退の速度 |
| ROTATION_SPEED | number | 3.0 | 旋回速度（rad/s） |
| CAMERA_DISTANCE | number | 8 | （非推奨）カメラ距離は CAMERA.pc/mobile.distance を使用 |
| CAMERA_HEIGHT | number | 5 | （非推奨）カメラ高さは CAMERA.pc/mobile.height を使用 |
| RAYCAST_OFFSET | number | 5 | 接地レイの始点オフセット（プレイヤー頭上） |
| GRAVITY | number | 0.2 | 落下加速度 |
| FALL_THRESHOLD | number | -10 | これ以下で落下停止 |
| GROUND_OFFSET | number | 0 | 接地時の Y オフセット（めり込み防止） |
| INITIAL_X | number | 0 | 開始時の X 座標 |
| INITIAL_Y | number | 10 | 開始時の高さ（床ロード前の落下防止） |
| INITIAL_Z | number | 0 | 開始時の Z 座標 |
| INITIAL_ROTATION_Y | number | 0 | 開始時の向き（Y 軸回転・rad。0 で +Z 方向） |
| BOUNDARY_RADIUS | number | 20 | 移動可能な最大半径（XZ 平面での原点からの距離） |

### CRYSTAL

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| SPEED | number | 2.0 | クリスタルの移動速度 |
| MIN_RADIUS | number | 10 | リング内側の半径 |
| MAX_RADIUS | number | 15 | リング外側の半径 |

### BOOK

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| NEARBY_THRESHOLD | number | 15 | 本オブジェクトを「近い」と判定する閾値（TAP表示用） |

### BOX

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| NEARBY_THRESHOLD | number | 15 | Boxオブジェクトを「近い」と判定する閾値（TAP表示用） |

### LAYOUT

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| OBJECT_RING_RADIUS | number | 30 | オブジェクトを配置する円の半径 |
| BOOK_HEIGHT | number | 4 | Book の高さ（Y） |
| POST_HEIGHT | number | 5 | Post の高さ（Y） |
| BOX_HEIGHT | number | 5 | Box の高さ（Y） |
| COMPUTER_HEIGHT | number | 3.5 | Computer の高さ（Y） |
| BOOK_SCALE | number | 10 | Book のスケール |
| BOX_SCALE | number | 7 | Box のスケール |
| POST_SCALE | number | 10 | Post のスケール |
| COMPUTER_SCALE | number | 9 | Computer のスケール |

### FLOATING

| オブジェクト | FLOAT_SPEED | FLOAT_AMPLITUDE | TILT_SPEED | TILT_ANGLE |
|-------------|-------------|-----------------|------------|------------|
| book | 1.0 | 0.3 | 2.5 | 0.08 |
| post | 1.0 | 0.3 | 2.5 | 0.08 |
| computer | 1.2 | 0.28 | 2.2 | 0.07 |
| box | 0.9 | 0.32 | 2.8 | 0.09 |

---

## データフロー

```
[useDeviceType] → isMobile (768px 未満で true)
       ↓
[World] → Canvas key, camera (fov, position), Player/Crystal に isMobile/refs を渡す
       ↓
[Player] → CAMERA.pc / CAMERA.mobile で distance, height, lookAtOffsetY を切り替え

[キー入力] ──────────────┐
                        ├→ Player (keys + joystick を統合)
[JoystickControls] ─────┤
  → useInputStore       │
  (joystick {x,y,isMoving}) 
                        ↓
[useFrame] → 移動・回転・接地判定・境界制限・カメラ更新
                ↓
[Player] → isMoving, moveDirection を Coco に渡す → アニメーション制御
                ↓
[groundRef] ← Floor が ref を設定
                ↓
[raycaster.intersectObjects(groundRef)] → 床との交点 → player.position.y

[Crystal] → playerRef の位置を参照して距離判定
        → activeCrystalId/activeMessage/targetPosition を更新
[Book] → playerRef の位置を参照して距離判定
      → isBookNearby を更新
[Box] → playerRef の位置を参照して距離判定
     → isBoxNearby を更新
[InteractionUI] → activeCrystalId/isTalking/isBookNearby/isBoxNearby を参照
               → クリスタル優先で TAP を表示（次点で本TAP、次にBoxTAP）
               → setIsAdventureBookOpen(true) で本UIを開く
[page.tsx] → boxView !== "closed" のとき BoxUI を動的表示
[AdventureBookUI] → isAdventureBookOpen/selectedAdventureSlot を参照
                 → スロット選択/詳細表示/閉じる を制御
[BoxUI] → boxView/activeBoxCategory/currentBoxPage/selectedBoxSlotIndex を参照
       → menu/grid 遷移、詳細更新、ページ切替を制御
```

**useInputStore（Zustand）:**
- `joystick: { x, y, isMoving }` — ジョイスティックの -1〜1 の値と操作中フラグ
- `activeCrystalId: string | null` — 近距離で担当になったクリスタル
- `isTalking: boolean` — 会話中フラグ
- `activeMessage: string | null` — 表示中メッセージ
- `targetPosition: [x,y,z] | null` — 会話時のカメラターゲット
- `isBookNearby: boolean` — 本が近距離かどうか（本TAP表示トリガー）
- `isAdventureBookOpen: boolean` — ぼうけんのしょ UI の開閉状態
- `selectedAdventureSlot: AdventureSlotId | null` — 選択中セーブスロット（1/2/3）
- `isBoxNearby: boolean` — Boxが近距離かどうか（BoxTAP表示トリガー）
- `boxView: "closed" | "menu" | "grid"` — BoxUI の表示フェーズ
- `activeBoxCategory: "skills" | "items" | null` — BoxUI の選択カテゴリ
- `currentBoxPage: number` — 現在ページ（1始まり）
- `selectedBoxSlotIndex: number` — 選択中スロット（未選択は -1）
- JoystickControls が setJoystick で更新、Player が joystick を購読して移動に反映
- Crystal が `activeCrystalId`/`activeMessage`/`targetPosition` を更新
- Book が `isBookNearby` を更新
- Box が `isBoxNearby` を更新
- InteractionUI が `activeCrystalId`/`isTalking`/`isBookNearby`/`isBoxNearby` を参照して UI を制御
- AdventureBookUI が `isAdventureBookOpen`/`selectedAdventureSlot` を参照して表示を制御
- BoxUI が `boxView`/`activeBoxCategory`/`currentBoxPage`/`selectedBoxSlotIndex` を参照して表示を制御

**groundRef の流れ:**
1. World で `useRef` 作成
2. Floor に渡す → `<group ref={groundRef}>` で床メッシュの親に紐づく
3. Player に渡す → レイキャストの対象として使用

---

### Crystal.tsx

| 項目 | 内容 |
|------|------|
| **責務** | クリスタルモデルの表示、徘徊AI、距離と会話状態によるUI表示 |
| **Props** | `id: string`, `position: [x,y,z]`, `message: string`, `scale?: number | [x,y,z]`, `sectorStart: number`, `sectorSize: number`, `playerRef` |
| **依存** | crystal-transformed.glb, crystal_texture.jpg, useInputStore |

**モデル:** `models/crystal-transformed.glb` の `nodes.Body`, `nodes.Left_Eye`  
**マテリアル:** Body は `meshMatcapMaterial` + `crystal_texture.jpg`、Eye は `meshBasicMaterial`  
**徘徊:** リング（半径 10〜15）内の担当セクターから目的地を直接サンプリング。SPEED=2.0  
**タブ復帰時:** `delta > 0.5` を一時停止復帰とみなし、ワープを避けて「現在位置から新しい目的地のみ再設定」  
**浮遊:** `useFrame` で `y = initialPos.y + sin(t*2)*0.5`  
**対話UI:** 近距離で担当になった個体のみ `activeCrystalId` をセットし、`activeMessage`/`targetPosition` を更新。UI は InteractionUI が表示  
**向き補正:** モデルの正面が -Z とずれるため Y 軸 -90度補正をかけて lookAt に整合

---

### InteractionUI.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 会話開始/終了の UI 表示、メッセージ表示、本TAP導線の表示 |
| **Props** | なし |
| **依存** | useInputStore |

**Tap ボタン（クリスタル）:** `activeCrystalId` があり `isTalking=false` のとき表示。クリック時に `stopPropagation()`  
**Tap ボタン（Box）:** `activeCrystalId` がなく `isBookNearby=false` かつ `isBoxNearby=true` のとき表示。クリックで `setBoxView("menu")`  
**Tap ボタン（本）:** `activeCrystalId` がない状態で `isBookNearby=true` かつ `isTalking=false` のとき表示。クリックで `setIsAdventureBookOpen(true)`  
**会話モード:** `isTalking=true` で全画面オーバーレイ + メッセージ表示。クリックで終了  

---

### AdventureBookUI.tsx

| 項目 | 内容 |
|------|------|
| **責務** | ぼうけんのしょUIの表示制御（スロット一覧/詳細画面/クローズ） |
| **Props** | なし |
| **依存** | useInputStore, `adventureBookData.ts`, `.font-adventure` |

**表示条件:** `isAdventureBookOpen=true` のとき全画面オーバーレイを表示  
**スロット一覧:** `ADVENTURE_SLOTS`（1〜3）を表示し、各行のサブラベルには職業名（`job`）を表示。選択で `selectedAdventureSlot` を更新  
**詳細画面:** `getAdventureSlot(selectedAdventureSlot)` から `level/job/location/hp/mp/skills/description` を表示（`description` は複数行テキスト対応）  
**クローズ:** 背景クリック、`Esc` キー、`とじる` ボタンで閉じる。`Esc` は詳細表示中なら一覧に戻る  
**フォント:** `DotGothic16` を `--font-adventure` として読み込み、`.font-adventure` 経由で適用

---

### BoxUI.tsx

| 項目 | 内容 |
|------|------|
| **責務** | アイテムBOX UI の表示制御（menu/grid 切り替え、詳細表示、ページング） |
| **Props** | なし |
| **依存** | useInputStore, `boxData.ts` |

**表示条件:** `boxView !== "closed"` のとき表示（`page.tsx` で動的 import）  
**メニュー:** `BOX_MENU_ENTRIES` を表示し、選択で `activeBoxCategory` をセットして `boxView="grid"` へ遷移  
**グリッド:** PC は `SLOTS_PER_PAGE=100` の 10×10、モバイルは 6×6（36）に切り替え。`skills/items` でデータソースを切り替え、`currentBoxPage` でページング  
**デバイス判定:** 初回描画時に `window.innerWidth < 768` で `isMobile` を即時判定し、`resize` 監視で更新（初回の 10×10 → 6×6 ジャンプを回避）  
**詳細パネル:** `selectedBoxSlotIndex` に応じて `SkillDetailPanel` / `ItemDetailPanel` を表示。モバイルでは `flex-1` で残り高を使い、グリッドは下側に固定  
**ページ数計算:** `entries.length / slotsPerPage` から動的算出し、`currentBoxPage` を有効範囲にクランプ  
**軽量化:** セル選択ハイライトは `classList` の直接更新（前回セル/今回セルのみ）で O(1) 更新し、100セル全再描画を回避  
**クローズ:** menu 画面では外側クリックで閉じる。grid 画面は「もどる」で menu に戻る

---

## レンダリングパイプライン

1. **シーン描画** → 画面へ直接出力（Environment + ambientLight + Sparkles を含む）
2. **Canvas flat:** 物理ベースライティングを無効化。EffectComposer/Bloom は使用していない
3. **Overlay最適化:** BoxUI/AdventureBookUI 表示中は `frameloop="demand"` で 3D の常時更新を止め、UI操作時の負荷を削減

---

## 座標系・空間

- **Three.js の慣例:** Y 軸が上、右手系
- **床の範囲:** floor-transformed.glb の BoundingBox × DOME_SCALE。概ね XZ で ±45 程度
- **プレイヤー移動範囲:** 原点を中心とした XZ 平面の円形。半径 BOUNDARY_RADIUS（20）。境界を超えると境界線上に押し戻される
- **ドーム:** 下端が Y=-7（床と一致）。scale 1.8 で表示
- **プレイヤー初期位置:** `(INITIAL_X, INITIAL_Y, INITIAL_Z)` = `(0, 10, 0)`
- **カメラ:** プレイヤー背後。useDeviceType で PC/Mobile を判定し、CAMERA.pc または CAMERA.mobile の distance, height を使用。lerp 0.1 で滑らかに追従。lookAtOffsetY で注視点を上にずらし空を多く写す

---

## アルゴリズム

### 接地判定（レイキャスト）

1. プレイヤー位置の頭上 RAYCAST_OFFSET から下方向にレイを発射
2. groundRef（床）と交差判定
3. ヒット時: `hitPoint.y + PLAYER_HEIGHT_OFFSET (0.5) + GROUND_OFFSET` を player.position.y に設定
4. 非ヒット時: GRAVITY で落下。FALL_THRESHOLD 以下で停止

**PLAYER_HEIGHT_OFFSET:** Player 内で 0.5 にハードコード。足元を床面に合わせるためのオフセット（coco モデル用）。

### 入力統合

- **キーボード:** keys.up/down → moveForward (±1)、keys.left/right → rotateY (±1)
- **ジョイスティック:** joystick.y → moveForward、joystick.x → rotateY（符号は `rotation.y -= joystick.x`）
- **合算:** 両方の入力を加算。キーボードとジョイスティックを同時操作可能

### 移動

- 前進/後退: `moveForward` を `sin/cos(rotation.y)` 方向へ反映
- 旋回: `rotation.y -= rotateY * ROTATION_SPEED * delta`

### 境界制限

- **判定:** XZ 平面での原点からの距離 `sqrt(x² + z²)` が BOUNDARY_RADIUS を超えた場合に境界外とみなす
- **押し戻し:** 超えた場合、現在位置ベクトルを正規化して BOUNDARY_RADIUS を掛けた位置に補正（`ratio = BOUNDARY_RADIUS / distance` で x, z をスケール）

### カメラ追従

- **デバイス別設定:** isMobile に応じて CAMERA.pc または CAMERA.mobile を使用
- プレイヤーの背中側にカメラを配置: `position - (sin, cos) * distance`
- 高さは `player.y + height`
- `lerp(desiredPos, 0.1)` で滑らかに移動
- **注視点:** `lookAt(player.position + lookAtOffsetY)` でプレイヤーより少し上を注視（空を多く写す）

### クリスタル徘徊/対話

- **目的地生成:** 半径 ROAM_RADIUS の円内を一様分布で抽選し、XZ 平面のターゲットに設定
- **移動:** 目的地への方向ベクトルを正規化し、`SPEED * min(delta, 0.1)` で位置更新（大きい delta をクランプ）
- **一時停止復帰:** `delta > 0.5` のフレームでは移動せず、現在位置から新しい目的地を再抽選
- **数値安定化:** 方向ベクトル長が極小（`<= 1e-6`）のときは `normalize` をスキップして NaN を防止
- **担当制:** `activeCrystalId` が空のときのみ近距離（5m以内）で担当を獲得。担当中は 7m まで維持
- **UI:** 担当状態は InteractionUI が Tap/メッセージを表示

### Box UI グリッド更新

- **可変グリッド:** PC は 1ページ 10×10（100セル）、モバイルは 6×6（36セル）
- **選択更新:** `selectedBoxSlotIndex` 変更時、ハイライトは `classList` で前回セル/今回セルのみ更新（O(1)）
- **意図:** 100セル全体の再描画を避け、スマホでのタップ応答を改善

---

## アセット

| パス | 形式 | 用途 | ノード名 |
|------|------|------|----------|
| models/coco.glb | GLB | プレイヤー（Coco） | Scene ルートを `SkeletonUtils.clone` でクローン |
| models/crystal-transformed.glb | GLB | クリスタル | Body, Left_Eye |
| models/dome-transformed.glb | GLB | ドーム（Dome） | Dome |
| models/floor-transformed.glb | GLB | 床（Floor） | Floor |
| models/book-transformed.glb | GLB | 本（Book） | Mesh_0 |
| models/box-transformed.glb | GLB | 箱（Box） | mesh_0 |
| models/post-transformed.glb | GLB | ポスト（Post） | mesh_0 |
| models/computer-transformed.glb | GLB | コンピューター（Computer） | mesh_0 |
| models/coco-transformed.glb | GLB | Coco の旧変換モデル（未使用） | - |
| models/crystal.glb, dome.glb, floor.glb, book.glb, box.glb, post.glb, computer.glb | GLB | 元モデル（レガシー） | - |
| textures/coco_texture.png | PNG | Coco Body の Matcap | - |
| textures/crystal_texture.jpg | JPG | クリスタル Matcap | - |
| textures/dome_texture.jpg | JPG | ドーム Matcap | - |
| textures/floor_texture.jpg | JPG | 床 Matcap | - |

**-transformed モデル:** Dome, Floor, Book, Box, Post, Computer は変換済みの GLB を使用。Coco は `coco.glb` を使用。  
**Matcap:** meshMatcapMaterial + useTexture でライティングをテクスチャで疑似的に表現。

---

## 開発ガイド

### 新規コンポーネント追加

- `components/world/` に配置
- 3D オブジェクトは Canvas の子として配置
- 定数は `lib/world/config.ts` に追加
- カスタムフックは `hooks/` に配置

### 定数変更

- `lib/world/config.ts` を編集
- デバイス別の値は CAMERA.pc / CAMERA.mobile で分岐。useDeviceType で isMobile を判定し、World と Player で使用

### モデル追加

- `public/models/` に GLB を配置
- プレイヤー等のスキンメッシュ: [gltfjsx](https://github.com/pmndrs/gltfjsx) でコンポーネント生成。SkeletonUtils.clone でクローン可能に。three-stdlib は drei の依存で利用可能

### 注意事項

- `"use client"` が全コンポーネントに必要（useFrame, useState 等使用のため）
- Coco のアニメーションは `setEffectiveTimeScale` と `stop()` を使用。Player が isMoving, moveDirection を渡す
- Dome, Floor, Book, Box, Post, Computer は transformed GLB を使用。Coco は `coco.glb` + `coco_texture.png` を使用

---

## 今後の拡張

- [x] **useDeviceType**: PC/Mobile 判定（768px 未満でモバイル）。CAMERA を動的に切り替え（実装済み）
- [ ] **usePlayerInput**: キーボードとタッチ入力を完全に抽象化。現状は store でジョイスティックのみ共有
- [x] **VirtualJoystick**: スマホ用仮想ジョイスティック UI（JoystickControls + react-joystick-component で実装済み）
- [x] **床の境界**: プレイヤーが床外に落ちないよう制限（BOUNDARY_RADIUS で XZ 平面の円形境界を実装済み）
- [x] **モデルプリロード**: Coco で useGLTF.preload を実装済み

---

## トラブルシューティング

| 現象 | 原因 | 対処 |
|------|------|------|
| プレイヤーが床をすり抜ける | 床の法線が逆 | Blender で法線を反転 |
| ドームが浮く/沈む | DOME_POSITION_Y のずれ | 床とドームの BoundingBox を確認し調整 |
| モデルが表示されない | パス・ノード名の誤り | public/ からの相対パス、nodes のキーを確認 |
| カメラが追従しない | groundRef が null | Floor のロード完了を待つ。INITIAL_Y で落下を遅延 |

---

## ドキュメントの使い分け

| ファイル | 用途 |
|----------|------|
| README.md | GitHub 公開用。セットアップ、概要、デプロイ |
| SPEC.md | 開発・AI エージェント向け。本仕様書 |
