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
| **シーン** | ドーム（壁）+ 床 + プレイヤー。第三者視点カメラで追従 |

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
│  └── <Loader />            ← drei ローダー（進捗バー）         │
│  └── <InteractionUI />     ← 会話UI（Tap/メッセージ）         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  components/world/World.tsx                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Canvas (flat, dpr=[1,2], camera)                  │   │
│  │  ├── Dome                                           │   │
│  │  ├── Environment (preset=city)                      │   │
│  │  ├── ambientLight                                   │   │
│  │  ├── Floor ──────────── groundRef ─────────────────┐ │   │
│  │  ├── Player ─────────── groundRef ────────────────┤ │   │
│  │  │    └── Coco (モデル+アニメーション)               │   │
│  │  └── Crystal ×8  ← ランダム配置/吹き出し              │   │
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
│  lib/world/store.ts (Zustand: joystick + dialogue state)     │
└─────────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
frontend/
├── app/
│   ├── page.tsx              # ルートページ。World + JoystickControls を表示
│   ├── layout.tsx            # ルートレイアウト
│   ├── globals.css
│   └── favicon.ico
├── components/world/
│   ├── World.tsx             # メイン。Canvas + シーン構成
│   ├── Dome.tsx               # ドーム（壁）
│   ├── Floor.tsx              # 床
│   ├── Player.tsx             # プレイヤー（移動・入力・接地・カメラ）
│   ├── Coco.tsx               # ココモデル表示・アニメーション（gltfjsx 生成）
│   ├── Crystal.tsx            # クリスタル（徘徊・対話）
│   └── ui/
│       └── JoystickControls.tsx  # 仮想ジョイスティック（モバイル用）
├── components/ui/
│   └── InteractionUI.tsx      # 会話UI（Tap/メッセージ）
├── hooks/
│   └── useDeviceType.ts      # PC/Mobile 判定（768px 未満でモバイル）
├── lib/world/
│   ├── config.ts             # STAGE, CAMERA, PLAYER 定数
│   └── store.ts              # Zustand。ジョイスティック入力 + 対話状態
├── public/
│   ├── models/
│   │   ├── coco-transformed.glb   # プレイヤー（Coco）。gltfjsx 用に変換済み
│   │   ├── crystal-transformed.glb # クリスタル。gltfjsx 用に変換済み
│   │   ├── dome-transformed.glb  # ドーム（Dome）。gltfjsx 用に変換済み
│   │   ├── floor-transformed.glb # 床（Floor）。gltfjsx 用に変換済み
│   │   ├── coco.glb, crystal.glb, dome.glb, floor.glb  # 元モデル（レガシー）
│   └── textures/
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
| **状態** | `groundRef`（Floor と Player に渡す）、`playerRef`（Player と Crystal に渡す）、`useDeviceType()` で isMobile、`crystals`（8体のランダム配置） |
| **子** | Dome, Environment, ambientLight, Floor, Player, Crystal ×8 |

**Canvas 設定:**
- `flat`: 物理ベースのライティングを無効化（フラットシェーディング）
- `dpr={[1, 2]}`: デバイスピクセル比 1〜2 で自動調整
- `key={isMobile ? "mobile" : "pc"}`: デバイス切り替え時に Canvas を再マウントしてカメラ設定を反映
- `camera`: useDeviceType で isMobile を取得し、CAMERA.mobile / CAMERA.pc から fov, position を取得

**背景:** 親 div の `bg-black`（Tailwind）で黒背景。Canvas 内に `<color attach="background">` はなし。
**クリスタル配置:** `useMemo` で 8体を生成。XZ はランダム（±15）、Y=2 固定、`scale=0.4`。`id` を付与して Crystal に渡し、メッセージは世界の挨拶配列から割り当て。

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

### Player.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 入力処理、移動・回転、接地判定、境界制限、カメラ追従。Coco に isMoving/moveDirection を渡す |
| **Props** | `groundRef`, `isMobile: boolean`（useDeviceType の結果。CAMERA 切り替え用）, `playerRef`（World からの参照） |
| **依存** | PLAYER の全定数、CAMERA（isMobile で pc/mobile を切り替え）、Coco |

**構造:** `<group ref={playerRef}>` 内に `<Coco />` を配置。移動・接地・カメラは Player が担当し、モデル表示・アニメーションは Coco に委譲  
**入力:** キーボード（ArrowUp/Down/Left/Right）+ ジョイスティック（useInputStore 経由）。両方を合算して適用。会話中（`isTalking`）は入力無効化  
**接地:** `hitPoint.y + PLAYER_HEIGHT_OFFSET (0.5) + GROUND_OFFSET` で Y 位置を設定（BoundingBox 計算は廃止）  
**カメラ:** 通常は isMobile に応じて CAMERA.mobile / CAMERA.pc を使用。会話中は targetPosition を正面から見る位置に移動して注視

---

### Coco.tsx

| 項目 | 内容 |
|------|------|
| **責務** | ココモデルの表示、アニメーション制御、目玉の骨アタッチ |
| **Props** | `isMoving: boolean`, `moveDirection: number`（1: 前進, -1: 後退） |
| **依存** | coco-transformed.glb, three-stdlib (SkeletonUtils), gltfjsx 生成コード |

**モデル:** `models/coco-transformed.glb`。gltfjsx で生成。`SkeletonUtils.clone` でシーンをクローン  
**アニメーション:** Player から渡された isMoving, moveDirection で `setEffectiveTimeScale(moveDirection)` と `stop()` を制御  
**目玉アタッチ:** useLayoutEffect で頭の骨（Head を含む Bone）を探索し、Eye/Point メッシュを頭に attach。骨の動きに追従  
**forwardRef:** useImperativeHandle で内部 group を親に公開可能。現状 Player は ref を渡さず、`<group ref={group}>` 内の子として Coco を配置するため、group の transform が Coco に適用される  
**プリロード:** `useGLTF.preload("/models/coco-transformed.glb")` で初回表示を高速化

---

### JoystickControls.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 仮想ジョイスティック UI の表示、useInputStore への入力反映 |
| **Props** | なし |
| **依存** | react-joystick-component, useInputStore |

**配置:** `fixed bottom-10 right-10 z-50`（画面右下）  
**ジョイスティック:** size=100, sticky=false。baseColor #EEEEEE, stickColor #333333  
**入力マッピング:** y → 前後（1=前, -1=後）、x → 旋回（-1=右, 1=左）。move で setJoystick(x, y, true)、stop で setJoystick(0, 0, false)

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
| INITIAL_Y | number | 10 | 開始時の高さ（床ロード前の落下防止） |
| BOUNDARY_RADIUS | number | 26 | 移動可能な最大半径（XZ 平面での原点からの距離） |

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
[InteractionUI] → activeCrystalId/isTalking/activeMessage を参照してUI表示
```

**useInputStore（Zustand）:**
- `joystick: { x, y, isMoving }` — ジョイスティックの -1〜1 の値と操作中フラグ
- `activeCrystalId: string | null` — 近距離で担当になったクリスタル
- `isTalking: boolean` — 会話中フラグ
- `activeMessage: string | null` — 表示中メッセージ
- `targetPosition: [x,y,z] | null` — 会話時のカメラターゲット
- JoystickControls が setJoystick で更新、Player が joystick を購読して移動に反映
- Crystal が `activeCrystalId`/`activeMessage`/`targetPosition` を更新
- InteractionUI が `activeCrystalId`/`isTalking`/`activeMessage` を参照して UI を制御

**groundRef の流れ:**
1. World で `useRef` 作成
2. Floor に渡す → `<group ref={groundRef}>` で床メッシュの親に紐づく
3. Player に渡す → レイキャストの対象として使用

---

### Crystal.tsx

| 項目 | 内容 |
|------|------|
| **責務** | クリスタルモデルの表示、徘徊AI、距離と会話状態によるUI表示 |
| **Props** | `id: string`, `position: [x,y,z]`, `message: string`, `scale?: number | [x,y,z]`, `playerRef` |
| **依存** | crystal-transformed.glb, crystal_texture.jpg, useInputStore |

**モデル:** `models/crystal-transformed.glb` の `nodes.Body`, `nodes.Left_Eye`  
**マテリアル:** Body は `meshMatcapMaterial` + `crystal_texture.jpg`、Eye は `meshBasicMaterial`  
**徘徊:** 目的地をランダムに生成し、XZ 平面を移動（SPEED=2.0, ROAM_RADIUS=15）。目的地到達で再抽選  
**浮遊:** `useFrame` で `y = initialPos.y + sin(t*2)*0.5`  
**対話UI:** 近距離で担当になった個体のみ `activeCrystalId` をセットし、`activeMessage`/`targetPosition` を更新。UI は InteractionUI が表示  
**向き補正:** モデルの正面が -Z とずれるため Y 軸 -90度補正をかけて lookAt に整合

---

### InteractionUI.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 会話開始/終了の UI 表示、メッセージ表示 |
| **Props** | なし |
| **依存** | useInputStore |

**Tap ボタン:** `activeCrystalId` があり `isTalking=false` のとき表示  
**会話モード:** `isTalking=true` で全画面オーバーレイ + メッセージ表示。クリックで終了  

---

## レンダリングパイプライン

1. **シーン描画** → 画面へ直接出力
2. **Canvas flat:** 物理ベースライティングを無効化。EffectComposer/Bloom は使用していない

---

## 座標系・空間

- **Three.js の慣例:** Y 軸が上、右手系
- **床の範囲:** floor-transformed.glb の BoundingBox × DOME_SCALE。概ね XZ で ±45 程度
- **プレイヤー移動範囲:** 原点を中心とした XZ 平面の円形。半径 BOUNDARY_RADIUS（26）。境界を超えると境界線上に押し戻される
- **ドーム:** 下端が Y=-7（床と一致）。scale 1.8 で表示
- **プレイヤー初期位置:** (0, INITIAL_Y, 0) = (0, 10, 0)
- **カメラ:** プレイヤー背後。useDeviceType で PC/Mobile を判定し、CAMERA.pc または CAMERA.mobile の distance, height を使用。lerp 0.1 で滑らかに追従。lookAtOffsetY で注視点を上にずらし空を多く写す

---

## アルゴリズム

### 接地判定（レイキャスト）

1. プレイヤー位置の頭上 RAYCAST_OFFSET から下方向にレイを発射
2. groundRef（床）と交差判定
3. ヒット時: `hitPoint.y + PLAYER_HEIGHT_OFFSET (0.5) + GROUND_OFFSET` を player.position.y に設定
4. 非ヒット時: GRAVITY で落下。FALL_THRESHOLD 以下で停止

**PLAYER_HEIGHT_OFFSET:** Player 内で 0.5 にハードコード。足元を床面に合わせるためのオフセット（coco-transformed モデル用）。

### 入力統合

- **キーボード:** keys.up/down → moveForward (±1)、keys.left/right → rotateY (±1)
- **ジョイスティック:** joystick.y → moveForward、joystick.x → rotateY（符号は `rotateY -= joystick.x`）
- **合算:** 両方の入力を加算。キーボードとジョイスティックを同時操作可能

### 移動

- 前進/後退: `moveForward * sin(rotation.y)`, `moveForward * cos(rotation.y)` で XZ 成分を計算（moveForward は -1〜1）
- 旋回: `rotation.y += rotateY * ROTATION_SPEED * delta`（rotateY は -1〜1）

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
- **移動:** 目的地への方向ベクトルを正規化し、`SPEED * delta` で位置更新
- **担当制:** `activeCrystalId` が空のときのみ近距離（3m以内）で担当を獲得
- **UI:** 担当状態は InteractionUI が Tap/メッセージを表示

---

## アセット

| パス | 形式 | 用途 | ノード名 |
|------|------|------|----------|
| models/coco-transformed.glb | GLB | プレイヤー（Coco） | Body, tongue, root_003 等。SkeletonUtils.clone でクローン |
| models/crystal-transformed.glb | GLB | クリスタル | Body, Left_Eye |
| models/dome-transformed.glb | GLB | ドーム（Dome） | Dome |
| models/floor-transformed.glb | GLB | 床（Floor） | Floor |
| models/coco.glb, crystal.glb, dome.glb, floor.glb | GLB | 元モデル（レガシー） | - |
| textures/crystal_texture.jpg | JPG | クリスタル Matcap | - |
| textures/dome_texture.jpg | JPG | ドーム Matcap | - |
| textures/floor_texture.jpg | JPG | 床 Matcap | - |

**-transformed モデル:** Dome, Floor, Coco は gltfjsx 用に変換済みの GLB を使用。useGLTF.preload でプリロード。  
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
- Dome, Floor, Coco は gltfjsx で生成。それぞれ dome-transformed, floor-transformed, coco-transformed を使用。Dome/Floor は `as unknown as GLTFResult` で useGLTF の型を補正

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
