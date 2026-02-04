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
| 後処理 | @react-three/postprocessing | ^3.0.4 | EffectComposer, Bloom |
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
│  └── <JoystickControls />  ← 仮想ジョイスティック（画面右下）  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  components/world/World.tsx                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Canvas (dpr=[1,2], camera)                         │   │
│  │  ├── Dome                                           │   │
│  │  ├── Environment (preset=city)                      │   │
│  │  ├── ambientLight                                   │   │
│  │  ├── Floor ──────────── groundRef ─────────────────┐ │   │
│  │  ├── Player ─────────── groundRef ────────────────┤ │   │
│  │  └── EffectComposer > Bloom                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  groundRef を Floor と Player で共有。useInputStore で      │
│  JoystickControls と Player がジョイスティック入力を共有     │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Dome.tsx    │    │  Floor.tsx   │    │  Player.tsx  │
│  - dome.glb  │    │  - floor.glb │    │  - coco.glb  │
│  - Matcap    │    │  - Matcap    │    │  - キー+ジョイ │
│  - scale 1.8 │    │  - scale 20  │    │  - 接地判定   │
│  - Y=-7      │    │  - groundRef │    │  - カメラ追従 │
└──────────────┘    └──────────────┘    └──────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  components/world/ui/JoystickControls.tsx                   │
│  lib/world/store.ts (Zustand: joystick { x, y, isMoving })   │
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
│   ├── Player.tsx             # プレイヤー（ココ）
│   └── ui/
│       └── JoystickControls.tsx  # 仮想ジョイスティック（モバイル用）
├── lib/world/
│   ├── config.ts             # STAGE, CAMERA, PLAYER 定数
│   └── store.ts              # Zustand。ジョイスティック入力状態
├── public/
│   ├── models/
│   │   ├── coco.glb          # プレイヤー（アニメーション付き）
│   │   ├── dome.glb          # ドーム
│   │   └── floor.glb         # 床
│   └── textures/
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
| **責務** | Canvas の設定、環境・照明・後処理、子コンポーネントの組み立て |
| **Props** | なし |
| **状態** | `groundRef`（Floor と Player に渡す） |
| **子** | Dome, Environment, ambientLight, Floor, Player, EffectComposer |

**Canvas 設定:**
- `dpr={[1, 2]}`: デバイスピクセル比 1〜2 で自動調整
- `camera`: CAMERA.pc から fov, position を取得（distance/height は未使用。カメラ追従は Player 内で PLAYER.CAMERA_DISTANCE/HEIGHT を使用）

**背景:** 親 div の `bg-black`（Tailwind）で黒背景。Canvas 内に `<color attach="background">` はなし。

**重要:** EffectComposer + Bloom を削除すると画面が真っ白になる。レンダリングパイプラインの都合で必須。EffectComposer は `enableNormalPass={false}`。

---

### Dome.tsx

| 項目 | 内容 |
|------|------|
| **責務** | ドームモデルの表示 |
| **Props** | なし |
| **依存** | STAGE.DOME_POSITION_Y, STAGE（スケールはハードコード 1.8） |

**モデル:** `models/dome.glb` の `nodes.Dome`  
**マテリアル:** meshMatcapMaterial, `side={DoubleSide}`  
**位置:** `[0, DOME_POSITION_Y, 0]`（床の下端と揃えるため Y=-7）

---

### Floor.tsx

| 項目 | 内容 |
|------|------|
| **責務** | 床モデルの表示、接地判定用 groundRef の設定 |
| **Props** | `groundRef: React.RefObject<THREE.Object3D \| null>` |
| **依存** | STAGE.DOME_SCALE |

**モデル:** `models/floor.glb` の `nodes.Floor` または `nodes.floor`  
**マテリアル:** meshMatcapMaterial  
**スケール:** `[DOME_SCALE, DOME_SCALE, DOME_SCALE]`（20）

---

### Player.tsx

| 項目 | 内容 |
|------|------|
| **責務** | キャラ表示、キー入力、移動・回転、接地判定、境界制限、カメラ追従 |
| **Props** | `groundRef: React.RefObject<THREE.Object3D \| null>` |
| **依存** | PLAYER の全定数 |

**モデル:** `models/coco.glb`（アニメーション付き）  
**入力:** キーボード（ArrowUp/Down/Left/Right）+ ジョイスティック（useInputStore 経由）。両方を合算して適用  
**アニメーション:** 最初のアニメーションクリップを前進/後退で再生。`setEffectiveTimeScale(±1)` と `stop()` を使用

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
| pc | distance | number | 8 | カメラとプレイヤーの距離（将来用。現状は PLAYER.CAMERA_DISTANCE を使用） |
| pc | height | number | 5 | カメラの高さ（将来用。現状は PLAYER.CAMERA_HEIGHT を使用） |
| pc | position | [x,y,z] | [0,5,12] | 初期カメラ位置（Canvas で使用） |
| mobile | fov, distance, height, position | - | fov:55, dist:6, height:4, pos:[0,4,10] | 将来用。未使用 |

### PLAYER

| キー | 型 | 値 | 説明 |
|------|-----|-----|------|
| MOVE_SPEED | number | 5.0 | 前進・後退の速度 |
| ROTATION_SPEED | number | 3.0 | 旋回速度（rad/s） |
| CAMERA_DISTANCE | number | 8 | 第三者視点カメラの距離 |
| CAMERA_HEIGHT | number | 5 | 第三者視点カメラの高さ |
| RAYCAST_OFFSET | number | 5 | 接地レイの始点オフセット（プレイヤー頭上） |
| GRAVITY | number | 0.2 | 落下加速度 |
| FALL_THRESHOLD | number | -10 | これ以下で落下停止 |
| GROUND_OFFSET | number | 0 | 接地時の Y オフセット（めり込み防止） |
| INITIAL_Y | number | 10 | 開始時の高さ（床ロード前の落下防止） |
| BOUNDARY_RADIUS | number | 26 | 移動可能な最大半径（XZ 平面での原点からの距離） |

---

## データフロー

```
[キー入力] ──────────────┐
                        ├→ Player (keys + joystick を統合)
[JoystickControls] ─────┤
  → useInputStore       │
  (joystick {x,y,isMoving}) 
                        ↓
[useFrame] → 移動・回転・接地判定・境界制限・カメラ更新
                ↓
[groundRef] ← Floor が ref を設定
                ↓
[raycaster.intersectObjects(groundRef)] → 床との交点 → player.position.y
```

**useInputStore（Zustand）:**
- `joystick: { x, y, isMoving }` — ジョイスティックの -1〜1 の値と操作中フラグ
- JoystickControls が setJoystick で更新、Player が joystick を購読して移動に反映

**groundRef の流れ:**
1. World で `useRef` 作成
2. Floor に渡す → `<group ref={groundRef}>` で床メッシュの親に紐づく
3. Player に渡す → レイキャストの対象として使用

---

## レンダリングパイプライン

1. **シーン描画** → オフスクリーンレンダーターゲット
2. **EffectComposer** → Bloom 適用
3. **出力** → 画面

**注意:** EffectComposer を削除すると ToneMapping 等の処理が変わり、画面が真っ白になる。Bloom の「光を足す」効果より、パイプライン変更の影響が大きい。

---

## 座標系・空間

- **Three.js の慣例:** Y 軸が上、右手系
- **床の範囲:** floor.glb の BoundingBox × DOME_SCALE。概ね XZ で ±45 程度
- **プレイヤー移動範囲:** 原点を中心とした XZ 平面の円形。半径 BOUNDARY_RADIUS（26）。境界を超えると境界線上に押し戻される
- **ドーム:** 下端が Y=-7（床と一致）。scale 1.8 で表示
- **プレイヤー初期位置:** (0, INITIAL_Y, 0) = (0, 10, 0)
- **カメラ:** プレイヤー背後、距離 8、高さ +5。lerp 0.1 で滑らかに追従

---

## アルゴリズム

### 接地判定（レイキャスト）

1. プレイヤー位置の頭上 RAYCAST_OFFSET から下方向にレイを発射
2. groundRef（床）と交差判定
3. ヒット時: `hitPoint.y + playerHeightOffset + GROUND_OFFSET` を player.position.y に設定
4. 非ヒット時: GRAVITY で落下。FALL_THRESHOLD 以下で停止

**playerHeightOffset:** モデルの BoundingBox の min.y の絶対値。足元を床面に合わせるためのオフセット。

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

- プレイヤーの背中側にカメラを配置: `position - (sin, cos) * distance`
- 高さは `player.y + CAMERA_HEIGHT`
- `lerp(desiredPos, 0.1)` で滑らかに移動
- `lookAt(player.position)` で常にプレイヤーを注視

---

## アセット

| パス | 形式 | 用途 | ノード名 |
|------|------|------|----------|
| models/coco.glb | GLB | プレイヤー | scene（useGLTF の返り値。ルートシーンを primitive で表示） |
| models/dome.glb | GLB | ドーム | Dome |
| models/floor.glb | GLB | 床 | Floor または floor |
| textures/dome_texture.jpg | JPG | ドーム Matcap | - |
| textures/floor_texture.jpg | JPG | 床 Matcap | - |

**Matcap:** ライティングをテクスチャで疑似的に表現。環境光の影響を受けにくい。

---

## 開発ガイド

### 新規コンポーネント追加

- `components/world/` に配置
- 3D オブジェクトは Canvas の子として配置
- 定数は `lib/world/config.ts` に追加

### 定数変更

- `lib/world/config.ts` を編集
- デバイス別の値は CAMERA.pc / CAMERA.mobile で分岐（現状 pc のみ使用）

### モデル追加

- `public/models/` に GLB を配置
- useGLTF で読み込み。ノード名は Blender 等で確認

### 注意事項

- `"use client"` が全コンポーネントに必要（useFrame, useState 等使用のため）
- Player のアニメーションは `setEffectiveTimeScale` と `stop()` を使用（timeScale 直接代入は不要）
- floor の nodes 名は `Floor` または `floor` の両方に対応

---

## 今後の拡張

- [ ] **useDeviceType**: PC/Mobile 判定。CAMERA を動的に切り替え
- [ ] **usePlayerInput**: キーボードとタッチ入力を完全に抽象化。現状は store でジョイスティックのみ共有
- [x] **VirtualJoystick**: スマホ用仮想ジョイスティック UI（JoystickControls + react-joystick-component で実装済み）
- [x] **床の境界**: プレイヤーが床外に落ちないよう制限（BOUNDARY_RADIUS で XZ 平面の円形境界を実装済み）
- [ ] **モデルプリロード**: useGLTF.preload で初回表示の高速化

---

## トラブルシューティング

| 現象 | 原因 | 対処 |
|------|------|------|
| 画面が真っ白 | EffectComposer 削除 | Bloom を含む EffectComposer を維持 |
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
