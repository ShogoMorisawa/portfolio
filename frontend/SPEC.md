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

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| **用途**   | 3D 空間内でキャラクター（ココ）を操作できるインタラクティブなポートフォリオ               |
| **操作**   | PC: 矢印キー / Mobile: 仮想ジョイスティック（画面右下）                                   |
| **シーン** | ドーム（壁）+ 床 + 本 + 箱 + ポスト + コンピューター + プレイヤー。第三者視点カメラで追従 |

---

## 技術スタック

| カテゴリ          | ライブラリ               | バージョン（package.json） | 用途                                          |
| ----------------- | ------------------------ | -------------------------- | --------------------------------------------- |
| フレームワーク    | Next.js                  | ^16.1.6                    | App Router, SSR/CSR                           |
| 3D レンダリング   | React Three Fiber        | ^9.5.0                     | React 用 Three.js ラッパー                    |
| 3D ユーティリティ | @react-three/drei        | ^10.7.7                    | useGLTF, useTexture, Environment 等           |
| 3D ユーティリティ | three-stdlib             | drei 経由                  | GLTF 型、gltfjsx 生成コードで使用             |
| 3D エンジン       | Three.js                 | ^0.182.0                   | レンダリング基盤                              |
| 状態管理          | Zustand                  | ^5.0.11                    | 入力状態の共有（キーボード/ジョイスティック） |
| UI コンポーネント | react-joystick-component | ^6.2.1                     | 仮想ジョイスティック                          |
| UI アイコン       | react-icons              | ^5.6.0                     | PostUI の SNS アイコン表示                    |
| メール送信        | Resend                   | ^6.9.3                     | PostUI からの手紙送信（Route Handler 経由）   |
| フォーマッタ      | Prettier                 | ^3.8.1                     | `format` / `format:check` スクリプトで整形    |
| 言語              | TypeScript               | ^5                         | 型安全                                        |

### パスエイリアス

- `@/*` → `./*`（tsconfig.json の baseUrl: ".", paths: { "@/*": ["./*"] }）

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  app/page.tsx                                               │
│  ├── <World />                                              │
│  ├── <JoystickControls />  ← 仮想ジョイスティック（画面右下）  │
│  ├── <InteractionUI />     ← 会話+Computer操作UI（Tap/矢印）    │
│  ├── <AdventureBookUI />   ← ぼうけんのしょUI               │
│  ├── <BoxUI />             ← アイテムBOX UI（動的 import）   │
│  ├── <PostUI />            ← 手紙UI（動的 import）            │
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
│  │  ├── Computer (手前側配置 + 近接判定)               │   │
│  │  ├── Tablet (Computer開時のみ中央表示)              │   │
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
│  components/ui/PostUI.tsx                                   │
│  app/api/letter/route.ts（PostUI の送信先 API）             │
│  lib/world/store.ts (Zustand: input + dialogue + book + box + post + computer) │
│  lib/world/adventureBookData.ts（ぼうけんのしょ定義）        │
│  lib/world/boxData.ts（BOX 表示データ）                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
frontend/
├── app/
│   ├── api/
│   │   └── letter/
│   │       └── route.ts      # PostUI送信先。Resend でメール配送する Route Handler
│   ├── page.tsx              # ルートページ。World + JoystickControls + UI群を表示
│   ├── layout.tsx            # ルートレイアウト（Geist + DotGothic16 + Dancing_Script + Playfair_Display）
│   ├── globals.css           # グローバルCSS（font-adventure/font-dancing/font-playfair + letter-form autofill対策）
│   └── favicon.ico
├── components/world/
│   ├── World.tsx             # メイン。Canvas + シーン構成
│   ├── SectionImagesPreloader.tsx # World 表示後に PostUI/BoxUI 画像を事前取得
│   ├── Dome.tsx               # ドーム（壁）
│   ├── Floor.tsx              # 床
│   ├── FloatingWorldModel.tsx # 浮遊オブジェクト共通描画（GLTF+浮遊+傾き）
│   ├── Book.tsx               # 本モデル（浮遊アニメーション）
│   ├── Box.tsx                # 箱モデル
│   ├── Post.tsx               # ポストモデル
│   ├── Computer.tsx           # コンピューターモデル
│   ├── Tablet.tsx             # コンピューター表示中に前面表示するタブレットモデル
│   ├── Player.tsx             # プレイヤー（移動・入力・接地・カメラ）
│   ├── Coco.tsx               # ココモデル表示・アニメーション（gltfjsx 生成）
│   ├── Crystal.tsx            # クリスタル（徘徊・対話）
│   └── ui/
│       └── JoystickControls.tsx  # 仮想ジョイスティック（動的配置）
├── components/ui/
│   ├── InteractionUI.tsx      # 会話UI + Book/Box/Post/Computer のTAP導線 + タブレット画像切替UI
│   ├── AdventureBookUI.tsx    # ぼうけんのしょUI（スロット選択/詳細）
│   ├── BoxUI.tsx              # アイテムBOX UI（メニュー/可変グリッド）
│   ├── PostUI.tsx             # 手紙UI（ポストから開くオーバーレイ）
│   └── ComputerUI.tsx         # 作品情報オーバーレイ（現在は page.tsx 未接続）
├── hooks/
│   └── useDeviceType.ts      # PC/Mobile 判定（768px 未満でモバイル）
├── lib/world/
│   ├── config.ts             # STAGE, CAMERA, PLAYER, LAYOUT, FLOATING, POST, COMPUTER 定数
│   ├── store.ts              # Zustand。入力 + 対話 + 本UI + BoxUI + PostUI + Computer状態
│   ├── adventureBookData.ts  # ぼうけんのしょ表示データ
│   ├── boxData.ts            # BoxUI表示データ（スキル/アイテム + 画像URL集約）
│   ├── computerWorksData.ts  # ComputerUI の作品データ（未接続UI用）
│   └── preloadSectionImages.ts # PostUI/BoxUI 用画像のプリロード処理
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
│   │   ├── tablet.glb             # タブレット（Tablet）で使用
│   │   ├── coco.glb               # プレイヤー（Coco）で使用
│   │   ├── crystal.glb, dome.glb, floor.glb, book.glb, box.glb, post.glb, computer.glb  # 元モデル（レガシー）
│   ├── textures/
│       ├── coco_texture.png   # Coco Body の Matcap
│       ├── crystal_texture.jpg # クリスタル Matcap
│       ├── dome_texture.jpg  # ドーム用 Matcap
│       └── floor_texture.jpg # 床用 Matcap
│   └── post/
│       ├── letter.png         # PostUI の手紙背景
│       ├── form_input.png     # PostUI の名前/メール入力欄背景
│       ├── send-button.png    # PostUI の送信ボタン画像
│       └── stamp.png          # PostUI の切手画像（宛名横）
├── SPEC.md                   # 本ドキュメント
└── package.json
```

---

## コンポーネント詳細

### World.tsx

| 項目      | 内容                                                                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **責務**  | Canvas の設定、環境・照明、子コンポーネントの組み立て                                                                                                                                                          |
| **Props** | なし                                                                                                                                                                                                           |
| **状態**  | `groundRef`（Floor と Player に渡す）、`playerRef`（Player/Book/Box/Post/Computer/Crystal に渡す）、`useDeviceType()` で isMobile、`crystals`（4体のリング配置）、`boxView` / `isAdventureBookOpen` / `isPostOpen` / `isComputerOpen`（Crystal停止判定） |
| **子**    | Dome, Environment, ambientLight, Sparkles, Floor, Book（`playerRef`）, Box（`playerRef`）, Post（`playerRef`）, Computer（`playerRef`）, Tablet, Player, Crystal ×4, SectionImagesPreloader                                               |

**Canvas 設定:**

- `flat`: 物理ベースのライティングを無効化（フラットシェーディング）
- `dpr={[1, 2]}`: デバイスピクセル比 1〜2 で自動調整
- `key={isMobile ? "mobile" : "pc"}`: デバイス切り替え時に Canvas を再マウントしてカメラ設定を反映
- `frameloop`: 常時 `"always"`。UIオーバーレイ表示中も Book/Box/Post/Computer/Tablet などの3D更新は継続
- `camera`: useDeviceType で isMobile を取得し、CAMERA.mobile / CAMERA.pc から fov, position を取得
- `Environment`: `environmentIntensity={2}`
- `ambientLight`: `intensity={2}`
- `Sparkles`: `count=1000`, `scale=35`, `position={[0,6,0]}` の白パーティクルを常時描画

**背景:** 親 div の `bg-black`（Tailwind）で黒背景。Canvas 内に `<color attach="background">` はなし。
**レイアウト定数:** Book/Box/Post/Computer の位置・スケールは `LAYOUT`（`lib/world/config.ts`）から取得。90°ごとの円形配置を使用。Tablet は `TABLET_*` と `TABLET_SCREEN_*` で位置・画面平面を調整。
**クリスタル配置:** `useMemo` で 4体を生成。リング（半径 10〜15）を 4 等分し、各セクター内で初期位置を生成。`id` を付与して Crystal に渡し、メッセージは固定4文を順番に割り当て。
**UI画像プリロード:** `SectionImagesPreloader` を `<Suspense>` 配下に置き、ワールド操作可能になった直後に PostUI/BoxUI 用画像の先読みを開始。

---

### Dome.tsx

| 項目      | 内容                                                        |
| --------- | ----------------------------------------------------------- |
| **責務**  | ドームモデルの表示                                          |
| **Props** | なし                                                        |
| **依存**  | STAGE.DOME_POSITION_Y, dome-transformed.glb（gltfjsx 生成） |

**モデル:** `models/dome-transformed.glb` の `nodes.Dome`。gltfjsx で生成。`as unknown as GLTFResult` で型アサーション  
**マテリアル:** meshMatcapMaterial（useTexture で dome_texture.jpg）, `side={DoubleSide}`, `color="#ffffff"`  
**位置:** `[0, DOME_POSITION_Y, 0]`（床の下端と揃えるため Y=-7）  
**スケール:** [1.8, 1.8, 1.8]  
**プリロード:** `useGLTF.preload("/models/dome-transformed.glb")`

---

### Floor.tsx

| 項目      | 内容                                                    |
| --------- | ------------------------------------------------------- |
| **責務**  | 床モデルの表示、接地判定用 groundRef の設定             |
| **Props** | `groundRef: React.RefObject<THREE.Object3D \| null>`    |
| **依存**  | STAGE.DOME_SCALE, floor-transformed.glb（gltfjsx 生成） |

**モデル:** `models/floor-transformed.glb` の `nodes.Floor`。gltfjsx で生成。`as unknown as GLTFResult` で型アサーション  
**マテリアル:** meshMatcapMaterial（useTexture で floor_texture.jpg）, `color="#ffffff"`  
**スケール:** `[DOME_SCALE, DOME_SCALE, DOME_SCALE]`（20）  
**groundRef:** ルートの `<group ref={groundRef}>` に設定  
**プリロード:** `useGLTF.preload("/models/floor-transformed.glb")`

---

### FloatingWorldModel.tsx

| 項目      | 内容                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| **責務**  | 浮遊オブジェクト共通の描画処理（GLTF読込、Y浮遊、Z傾き、任意の `onFrame`）                        |
| **Props** | `modelPath`, `meshNodeKey`, `floating`, `position?`, `rotation?`, `onFrame?`, + R3F `group` Props |
| **依存**  | useGLTF, useFrame                                                                                 |

**モデル:** `useGLTF(modelPath)` の `nodes[meshNodeKey]` を使用  
**浮遊+傾き:** `floating`（`FLOAT_SPEED/FLOAT_AMPLITUDE/TILT_SPEED/TILT_ANGLE`）で `useFrame` 更新  
**拡張ポイント:** `onFrame` で近接判定など各モデル固有ロジックを注入

---

### Book.tsx

| 項目      | 内容                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| **責務**  | 本モデルの表示、プレイヤー近接判定（本TAP表示用）                             |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など）+ `playerRef` |
| **依存**  | `FloatingWorldModel`, `BOOK.NEARBY_THRESHOLD`, useInputStore                  |

**描画:** `FloatingWorldModel` に `modelPath="/models/book-transformed.glb"` と `meshNodeKey="Mesh_0"` を渡して描画  
**浮遊+傾き:** `FLOATING.book` を `FloatingWorldModel` へ渡して適用  
**近接判定:** `onFrame` で本とプレイヤー距離を計算し、`dist < BOOK.NEARBY_THRESHOLD` の結果が前回から変化した時だけ `setIsBookNearby` を実行。`isTalking` または `isAdventureBookOpen` 中は判定を無効化  
**配置:** World から `position={[LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOOK_HEIGHT, 0]}`、`scale={LAYOUT.BOOK_SCALE}`、`rotation={[0, 0, 0]}`  
**参照:** `World` から `playerRef` を受け取り、未指定時は `state.camera.position` をフォールバックとして使用  
**プリロード:** `useGLTF.preload("/models/book-transformed.glb")`

---

### Box.tsx

| 項目      | 内容                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| **責務**  | 箱モデルの表示、プレイヤー近接判定（Box TAP表示用）                           |
| **Props** | R3F 標準の `group` Props（`position`, `scale`, `rotation` など）+ `playerRef` |
| **依存**  | `FloatingWorldModel`, `BOX.NEARBY_THRESHOLD`, useInputStore                   |

**描画:** `FloatingWorldModel` に `modelPath="/models/box-transformed.glb"` と `meshNodeKey="mesh_0"` を渡して描画  
**浮遊+傾き:** `FLOATING.box` を `FloatingWorldModel` へ渡して適用  
**近接判定:** `onFrame` で箱とプレイヤー距離を計算し、`dist < BOX.NEARBY_THRESHOLD` の結果が前回から変化した時だけ `setIsBoxNearby` を実行。`boxView !== "closed"` の間は更新を停止  
**配置:** World から `position={[-LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOX_HEIGHT, 0]}`、`scale={LAYOUT.BOX_SCALE}`、`rotation={[0, Math.PI / 2, 0]}`  
**参照:** `World` から `playerRef` を受け取り、未指定時は `state.camera.position` をフォールバックとして使用  
**プリロード:** `useGLTF.preload("/models/box-transformed.glb")`

---

### Post.tsx

| 項目      | 内容                                                           |
| --------- | -------------------------------------------------------------- | ------ |
| **責務**  | ポストモデルの表示、近接判定（ポストTAP表示トリガー）          |
| **Props** | R3F 標準の `group` Props + `playerRef?: RefObject<THREE.Group  | null>` |
| **依存**  | `FloatingWorldModel`, `useInputStore`, `POST.NEARBY_THRESHOLD` |

**描画:** `FloatingWorldModel` に `modelPath="/models/post-transformed.glb"` と `meshNodeKey="mesh_0"` を渡して描画  
**浮遊+傾き:** `FLOATING.post` を `FloatingWorldModel` へ渡して適用  
**配置:** World から `position={[0, LAYOUT.POST_HEIGHT, LAYOUT.OBJECT_RING_RADIUS]}`、`scale={LAYOUT.POST_SCALE}`、`rotation={[0, Math.PI, 0]}`  
**近接判定:** `onFrame` で `playerRef`（未指定時は camera）との距離を計測し、`dist < POST.NEARBY_THRESHOLD` のとき `isPostNearby=true`  
**開閉連動:** `isPostOpen=true` 中は近接判定を停止し、前回値との差分があるときだけ `setIsPostNearby` を更新  
**プリロード:** `useGLTF.preload("/models/post-transformed.glb")`

---

### Computer.tsx

| 項目      | 内容                                                             |
| --------- | ---------------------------------------------------------------- |
| **責務**  | コンピューターモデルの表示、プレイヤー近接判定（Computer TAP表示用） |
| **Props** | R3F 標準の `group` Props + `playerRef?: RefObject<THREE.Group \| null>` |
| **依存**  | `FloatingWorldModel`, `COMPUTER.NEARBY_THRESHOLD`, useInputStore |

**描画:** `FloatingWorldModel` に `modelPath="/models/computer-transformed.glb"` と `meshNodeKey="mesh_0"` を渡して描画  
**浮遊+傾き:** `FLOATING.computer` を `FloatingWorldModel` へ渡して適用  
**配置:** World から `position={[0, LAYOUT.COMPUTER_HEIGHT, -LAYOUT.OBJECT_RING_RADIUS]}`、`scale={LAYOUT.COMPUTER_SCALE}`（回転指定なし）  
**近接判定:** `onFrame` で `playerRef`（未指定時は camera）との距離を計測し、`dist < COMPUTER.NEARBY_THRESHOLD` のとき `isComputerNearby=true`  
**開閉連動:** `isComputerOpen=true` 中は近接判定を停止し、前回値との差分があるときだけ `setIsComputerNearby` を更新  
**プリロード:** `useGLTF.preload("/models/computer-transformed.glb")`

---

### Tablet.tsx

| 項目      | 内容                                                                                      |
| --------- | ----------------------------------------------------------------------------------------- |
| **責務**  | コンピューターセクション表示中のタブレット本体と画面プレーン描画、画像インデックス切替反映 |
| **Props** | なし                                                                                      |
| **依存**  | `useGLTF`, `useTexture`, `LAYOUT.TABLET_*`, `LAYOUT.TABLET_SCREEN_*`, useInputStore     |

**表示条件:** `isComputerOpen=true` のときのみ表示  
**本体モデル:** `models/tablet.glb` を読み込み、ガラス風 `MeshPhysicalMaterial` を適用  
**画面画像:** `TABLET_SCREEN_IMAGES`（空なら `TABLET_SCREEN_IMAGE`）を `useTexture` で読み込み、`tabletScreenImageIndex` で選択  
**切替安定化:** `meshBasicMaterial` 1枚に対して `map` を差し替える方式を採用。インデックスは剰余で正規化し、`flipY=false` + `SRGBColorSpace` を適用  
**画面平面:** `TABLET_SCREEN_WIDTH/HEIGHT`, `TABLET_SCREEN_OFFSET_*`, `TABLET_SCREEN_ROTATION` で調整  
**プリロード:** `useGLTF.preload("/models/tablet.glb")`

---

### Player.tsx

| 項目      | 内容                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| **責務**  | 入力処理、移動・回転、接地判定、境界制限、カメラ追従。Coco に isMoving/moveDirection を渡す                  |
| **Props** | `groundRef`, `isMobile: boolean`（useDeviceType の結果。CAMERA 切り替え用）, `playerRef`（World からの参照） |
| **依存**  | PLAYER の全定数、CAMERA（isMobile で pc/mobile を切り替え）、Coco                                            |

**構造:** `<group ref={playerRef}>` 内に `<Coco />` を配置。移動・接地・カメラは Player が担当し、モデル表示・アニメーションは Coco に委譲  
**初期位置:** `<group position={[PLAYER.INITIAL_X, PLAYER.INITIAL_Y, PLAYER.INITIAL_Z]}>` で生成  
**初期向き:** `useFrame` 内で初回のみ `player.rotation.y = PLAYER.INITIAL_ROTATION_Y` を適用  
**入力:** キーボード（ArrowUp/Down/Left/Right）+ ジョイスティック（useInputStore 経由）。両方を合算して適用。`isTalking` または `isComputerOpen` 中は入力無効化  
**接地:** `hitPoint.y + PLAYER_HEIGHT_OFFSET (0.5) + GROUND_OFFSET` で Y 位置を設定（BoundingBox 計算は廃止）  
**カメラ:** 通常は isMobile に応じて CAMERA.mobile / CAMERA.pc を使用。会話中は targetPosition を正面から見る位置に移動して注視（距離 5）。`isComputerOpen=true` 中はコンピューター正面へ固定

---

### Coco.tsx

| 項目      | 内容                                                              |
| --------- | ----------------------------------------------------------------- |
| **責務**  | ココモデルの表示、Body への Matcap 適用、アニメーション制御       |
| **Props** | `isMoving: boolean`, `moveDirection: number`（1: 前進, -1: 後退） |
| **依存**  | coco.glb, coco_texture.png, three-stdlib (SkeletonUtils)          |

**モデル:** `models/coco.glb` を読み込み、`SkeletonUtils.clone` でシーンをクローン  
**マテリアル:** `Body` メッシュに `MeshMatcapMaterial` を適用し、`textures/coco_texture.png` を使用  
**アニメーション:** Player から渡された isMoving, moveDirection で `setEffectiveTimeScale(moveDirection)` と `stop()` を制御  
**forwardRef:** useImperativeHandle で内部 group を親に公開可能。現状 Player は ref を渡さず、`<group ref={group}>` 内の子として Coco を配置するため、group の transform が Coco に適用される  
**デバッグログ:** 初回にオブジェクト/メッシュ/マテリアル一覧を `console.log` 出力  
**プリロード:** `useGLTF.preload("/models/coco.glb")` で初回表示を高速化

---

### JoystickControls.tsx

| 項目      | 内容                                                       |
| --------- | ---------------------------------------------------------- |
| **責務**  | 仮想ジョイスティック UI の表示、useInputStore への入力反映 |
| **Props** | なし                                                       |
| **依存**  | useInputStore                                              |

**配置:** `fixed inset-0 z-50`（全画面）。タッチ位置にジョイスティックを動的表示  
**操作:** `basePos` をタップ地点に設定し、`onPointerMove` で `(current - base) / RADIUS` を計算  
**入力マッピング:** y → 前後（上=前, 下=後）、x → 旋回（右=正, 左=負）。`setJoystick(x, y, true)`  
**終了:** `onPointerUp/Cancel` で `setJoystick(0,0,false)` と UI を消去  
**会話時:** `isTalking` の間は描画しない

---

### useDeviceType

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| **責務**     | PC/Mobile の判定（画面幅ベース）                             |
| **戻り値**   | `isMobile: boolean`                                          |
| **判定基準** | `window.innerWidth < 768`（Tailwind の md ブレークポイント） |

**挙動:** 初回マウント時と resize イベントで再判定。World と Player で CAMERA の切り替えに使用。

---

## 設定リファレンス

### STAGE

| キー            | 型     | 値  | 説明                              |
| --------------- | ------ | --- | --------------------------------- |
| DOME_POSITION_Y | number | -7  | ドームの Y 位置。床の下端と揃える |
| DOME_SCALE      | number | 20  | 床のスケール                      |

### CAMERA

| デバイス | キー          | 型      | 値       | 説明                                             |
| -------- | ------------- | ------- | -------- | ------------------------------------------------ |
| pc       | fov           | number  | 50       | 視野角（度）                                     |
| pc       | distance      | number  | 8        | カメラとプレイヤーの距離（Player で使用）        |
| pc       | height        | number  | 5        | カメラの高さ（Player で使用）                    |
| pc       | lookAtOffsetY | number  | 1.5      | 注視点をプレイヤーより上にずらす（空を多く写す） |
| pc       | position      | [x,y,z] | [0,5,12] | 初期カメラ位置（Canvas で使用）                  |
| mobile   | fov           | number  | 55       | 視野角（度）                                     |
| mobile   | distance      | number  | 6        | カメラとプレイヤーの距離                         |
| mobile   | height        | number  | 4        | カメラの高さ                                     |
| mobile   | lookAtOffsetY | number  | 1.5      | 注視点オフセット                                 |
| mobile   | position      | [x,y,z] | [0,4,10] | 初期カメラ位置                                   |

### PLAYER

| キー               | 型     | 値  | 説明                                                    |
| ------------------ | ------ | --- | ------------------------------------------------------- |
| MOVE_SPEED         | number | 5.0 | 前進・後退の速度                                        |
| ROTATION_SPEED     | number | 3.0 | 旋回速度（rad/s）                                       |
| CAMERA_DISTANCE    | number | 8   | （非推奨）カメラ距離は CAMERA.pc/mobile.distance を使用 |
| CAMERA_HEIGHT      | number | 5   | （非推奨）カメラ高さは CAMERA.pc/mobile.height を使用   |
| RAYCAST_OFFSET     | number | 5   | 接地レイの始点オフセット（プレイヤー頭上）              |
| GRAVITY            | number | 0.2 | 落下加速度                                              |
| FALL_THRESHOLD     | number | -10 | これ以下で落下停止                                      |
| GROUND_OFFSET      | number | 0   | 接地時の Y オフセット（めり込み防止）                   |
| INITIAL_X          | number | 0   | 開始時の X 座標                                         |
| INITIAL_Y          | number | 10  | 開始時の高さ（床ロード前の落下防止）                    |
| INITIAL_Z          | number | 0   | 開始時の Z 座標                                         |
| INITIAL_ROTATION_Y | number | 0   | 開始時の向き（Y 軸回転・rad。0 で +Z 方向）             |
| BOUNDARY_RADIUS    | number | 20  | 移動可能な最大半径（XZ 平面での原点からの距離）         |

### CRYSTAL

| キー       | 型     | 値  | 説明                 |
| ---------- | ------ | --- | -------------------- |
| SPEED      | number | 2.0 | クリスタルの移動速度 |
| MIN_RADIUS | number | 10  | リング内側の半径     |
| MAX_RADIUS | number | 15  | リング外側の半径     |

### BOOK

| キー             | 型     | 値  | 説明                                                |
| ---------------- | ------ | --- | --------------------------------------------------- |
| NEARBY_THRESHOLD | number | 15  | 本オブジェクトを「近い」と判定する閾値（TAP表示用） |

### BOX

| キー             | 型     | 値  | 説明                                                 |
| ---------------- | ------ | --- | ---------------------------------------------------- |
| NEARBY_THRESHOLD | number | 15  | Boxオブジェクトを「近い」と判定する閾値（TAP表示用） |

### POST

| キー             | 型     | 値  | 説明                                                  |
| ---------------- | ------ | --- | ----------------------------------------------------- |
| NEARBY_THRESHOLD | number | 15  | Postオブジェクトを「近い」と判定する閾値（TAP表示用） |

### COMPUTER

| キー             | 型     | 値  | 説明                                                      |
| ---------------- | ------ | --- | --------------------------------------------------------- |
| NEARBY_THRESHOLD | number | 15  | Computerオブジェクトを「近い」と判定する閾値（TAP表示用） |

### LAYOUT

| キー                   | 型            | 値                                                        | 説明                                                        |
| ---------------------- | ------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| OBJECT_RING_RADIUS     | number        | 30                                                        | オブジェクトを配置する円の半径                              |
| BOOK_HEIGHT            | number        | 4                                                         | Book の高さ（Y）                                            |
| POST_HEIGHT            | number        | 5                                                         | Post の高さ（Y）                                            |
| BOX_HEIGHT             | number        | 5                                                         | Box の高さ（Y）                                             |
| COMPUTER_HEIGHT        | number        | 3.5                                                       | Computer の高さ（Y）                                        |
| BOOK_SCALE             | number        | 10                                                        | Book のスケール                                             |
| BOX_SCALE              | number        | 7                                                         | Box のスケール                                              |
| POST_SCALE             | number        | 10                                                        | Post のスケール                                             |
| COMPUTER_SCALE         | number        | 9                                                         | Computer のスケール                                         |
| TABLET_HEIGHT          | number        | 4.25                                                      | コンピューター表示時に出す Tablet の高さ                    |
| TABLET_OFFSET_Z        | number        | 3                                                         | Tablet の Z オフセット（Computer 前方へ）                  |
| TABLET_SCALE           | number        | 0.75                                                      | Tablet のスケール                                           |
| TABLET_ROTATION        | [number, number, number] | `[Math.PI/2.8, Math.PI/2.2, Math.PI/14]`                 | Tablet 本体回転                                             |
| TABLET_SCREEN_IMAGE    | string        | `""`                                                      | 単体表示時の画面画像パス（未設定時は空）                    |
| TABLET_SCREEN_IMAGES   | string[]      | `["/items/bakuonso.png","/items/lipton.png","/items/butakun.png"]` | 画面切替用画像リスト（2枚以上で矢印UI表示）                 |
| TABLET_SCREEN_WIDTH    | number        | 1                                                         | 画面プレーン幅                                              |
| TABLET_SCREEN_HEIGHT   | number        | 0.65                                                      | 画面プレーン高さ                                            |
| TABLET_SCREEN_OFFSET_X | number        | 0                                                         | 画面プレーン X オフセット                                   |
| TABLET_SCREEN_OFFSET_Y | number        | 0                                                         | 画面プレーン Y オフセット                                   |
| TABLET_SCREEN_OFFSET_Z | number        | 0.02                                                      | 画面プレーン Z オフセット                                   |
| TABLET_SCREEN_ROTATION | [number, number, number] | `[Math.PI/2, Math.PI, Math.PI]`                          | 画面プレーン回転                                            |

### FLOATING

| オブジェクト | FLOAT_SPEED | FLOAT_AMPLITUDE | TILT_SPEED | TILT_ANGLE |
| ------------ | ----------- | --------------- | ---------- | ---------- |
| book         | 1.0         | 0.3             | 2.5        | 0.08       |
| post         | 1.0         | 0.3             | 2.5        | 0.08       |
| computer     | 1.2         | 0.28            | 2.2        | 0.07       |
| box          | 0.9         | 0.32            | 2.8        | 0.09       |

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
[Post] → playerRef の位置を参照して距離判定
      → isPostNearby を更新
[Computer] → playerRef の位置を参照して距離判定
          → isComputerNearby を更新
[Tablet] → isComputerOpen / tabletScreenImageIndex / TABLET_SCREEN_IMAGES を参照
        → タブレット画面へ現在画像を描画
[SectionImagesPreloader] → mount 時に `preloadSectionImages()` を 1 回実行
                         → `POST_UI_IMAGE_URLS` と `getBoxImageUrls()` を順に preload
[InteractionUI] → activeCrystalId/isTalking/isBookNearby/isBoxNearby/isPostNearby/isPostOpen/isComputerNearby/isComputerOpen を参照
               → クリスタル優先で TAP を表示（次点で本、未近接時は Computer/Post/Box を条件に応じて表示）
               → setIsAdventureBookOpen(true) で本UIを開く
               → setIsComputerOpen(true/false) と setTabletScreenImageIndex((i)=>...) でタブレット切替を制御
[page.tsx] → boxView !== "closed" のとき BoxUI を動的表示
[page.tsx] → isPostOpen === true のとき PostUI を動的表示
[AdventureBookUI] → isAdventureBookOpen/selectedAdventureSlot を参照
                 → スロット選択/詳細表示/閉じる を制御
[BoxUI] → boxView/activeBoxCategory/currentBoxPage/selectedBoxSlotIndex を参照
       → menu/grid 遷移、詳細更新、ページ切替を制御
[PostUI] → isPostOpen を参照し、手紙画像の表示/クローズを制御
        → submit 時に `/api/letter` へ fetch（name/email/message + meta）
[app/api/letter/route.ts] → Resend API へメール送信
                         → 成功: { success: true } / 失敗: { error } を返却
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
- `isPostNearby: boolean` — Post が近距離かどうか（PostTAP表示トリガー）
- `isPostOpen: boolean` — 手紙UI（PostUI）の開閉状態
- `isComputerNearby: boolean` — Computer が近距離かどうか（Computer TAP表示トリガー）
- `isComputerOpen: boolean` — コンピューターセクション（Tablet表示）の開閉状態
- `tabletScreenImageIndex: number` — タブレット画面に表示中の画像インデックス
- `setTabletScreenImageIndex(index | updater)` — 数値または updater 関数で画面インデックスを更新
- `setIsComputerOpen(false)` 時に `tabletScreenImageIndex` を 0 にリセット
- JoystickControls が setJoystick で更新、Player が joystick を購読して移動に反映
- Crystal が `activeCrystalId`/`activeMessage`/`targetPosition` を更新
- Book が `isBookNearby` を更新
- Box が `isBoxNearby` を更新
- Post が `isPostNearby` を更新
- Computer が `isComputerNearby` を更新
- InteractionUI が `activeCrystalId`/`isTalking`/`isBookNearby`/`isBoxNearby`/`isPostNearby`/`isPostOpen`/`isComputerNearby`/`isComputerOpen` を参照して UI を制御
- AdventureBookUI が `isAdventureBookOpen`/`selectedAdventureSlot` を参照して表示を制御
- BoxUI が `boxView`/`activeBoxCategory`/`currentBoxPage`/`selectedBoxSlotIndex` を参照して表示を制御
- PostUI が `isPostOpen` を参照して表示を制御
- PostUI が submit 時に `/api/letter` を呼び出し、`isSending`/`submitError` を更新
- SectionImagesPreloader が `preloadSectionImages()` を呼び出し、Post/Box の画像を先読み

**groundRef の流れ:**

1. World で `useRef` 作成
2. Floor に渡す → `<group ref={groundRef}>` で床メッシュの親に紐づく
3. Player に渡す → レイキャストの対象として使用

---

### Crystal.tsx

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **責務**  | クリスタルモデルの表示、徘徊AI、距離と会話状態によるUI表示            |
| **Props** | `id: string`, `position: [x,y,z]`, `message: string`, `scale?: number | [x,y,z]`, `sectorStart: number`, `sectorSize: number`, `playerRef`, `isFrozen?: boolean` |
| **依存**  | crystal-transformed.glb, crystal_texture.jpg, useInputStore           |

**モデル:** `models/crystal-transformed.glb` の `nodes.Body`, `nodes.Left_Eye`  
**マテリアル:** Body は `meshMatcapMaterial` + `crystal_texture.jpg`、Eye は `meshBasicMaterial`  
**徘徊:** リング（半径 10〜15）内の担当セクターから目的地を直接サンプリング。SPEED=2.0  
**タブ復帰時:** `delta > 0.5` を一時停止復帰とみなし、ワープを避けて「現在位置から新しい目的地のみ再設定」  
**浮遊:** `useFrame` で `y = initialPos.y + sin(t*2)*0.5`  
**停止制御:** `isFrozen=true` の間は `useFrame` 冒頭で早期 return し、徘徊・向き追従・浮遊を停止  
**対話UI:** 近距離で担当になった個体のみ `activeCrystalId` をセットし、`activeMessage`/`targetPosition` を更新。UI は InteractionUI が表示  
**向き補正:** モデルの正面が -Z とずれるため Y 軸 -90度補正をかけて lookAt に整合

---

### InteractionUI.tsx

| 項目      | 内容                                                                 |
| --------- | -------------------------------------------------------------------- |
| **責務**  | 会話開始/終了の UI 表示、メッセージ表示、本/ポスト/BOX/Computer のTAP導線、タブレット画像切替 |
| **Props** | なし                                                                 |
| **依存**  | useInputStore                                                        |

**Tap ボタン（クリスタル）:** `activeCrystalId` があり `isTalking=false` のとき表示。クリック時に `stopPropagation()`  
**Tap ボタン（Computer）:** `activeCrystalId` がなく `isTalking=false` かつ `isBookNearby=false` かつ `isBoxNearby=false` かつ `isPostNearby=false` かつ `isComputerNearby=true` かつ `isComputerOpen=false` のとき表示。クリックで `setIsComputerOpen(true)`  
**Tap ボタン（Post）:** `activeCrystalId` がなく `isTalking=false` かつ `isBookNearby=false` かつ `isBoxNearby=false` かつ `isPostNearby=true` かつ `isPostOpen=false` のとき表示。クリックで `setIsPostOpen(true)`  
**Tap ボタン（Box）:** `activeCrystalId` がなく `isBookNearby=false` かつ `isBoxNearby=true` かつ `boxView==="closed"` のとき表示。クリックで `setBoxView("menu")`  
**Tap ボタン（本）:** `activeCrystalId` がない状態で `isBookNearby=true` かつ `isTalking=false` かつ `isAdventureBookOpen=false` のとき表示。クリックで `setIsAdventureBookOpen(true)`  
**Computerオーバーレイ:** `isComputerOpen=true` で全画面透明オーバーレイを表示。背景クリックまたは `Esc` で閉じる  
**左右切替UI:** `TABLET_SCREEN_IMAGES.length >= 2` のとき左右三角ボタンを表示し、`setTabletScreenImageIndex((i)=>...)` で巡回切替  
**会話モード:** `isTalking=true` で全画面オーバーレイ + メッセージ表示。クリックで終了

---

### AdventureBookUI.tsx

| 項目      | 内容                                                         |
| --------- | ------------------------------------------------------------ |
| **責務**  | ぼうけんのしょUIの表示制御（スロット一覧/詳細画面/クローズ） |
| **Props** | なし                                                         |
| **依存**  | useInputStore, `adventureBookData.ts`, `.font-adventure`     |

**表示条件:** `isAdventureBookOpen=true` のとき全画面オーバーレイを表示  
**スロット一覧:** `ADVENTURE_SLOTS`（1〜3）を表示し、各行のサブラベルには職業名（`job`）を表示。選択で `selectedAdventureSlot` を更新  
**詳細画面:** `getAdventureSlot(selectedAdventureSlot)` から `level/job/location/hp/mp/skills/description` を表示（`description` は複数行テキスト対応）  
**クローズ:** 背景クリック、`Esc` キー、`とじる` ボタンで閉じる。`Esc` は詳細表示中なら一覧に戻る  
**フォント:** `DotGothic16` を `--font-adventure` として読み込み、`.font-adventure` 経由で適用

---

### BoxUI.tsx

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| **責務**  | アイテムBOX UI の表示制御（menu/grid 切り替え、詳細表示、ページング） |
| **Props** | なし                                                                  |
| **依存**  | useInputStore, `boxData.ts`                                           |

**表示条件:** `boxView !== "closed"` のとき表示（`page.tsx` で動的 import）  
**メニュー:** `BOX_MENU_ENTRIES` を表示し、選択で `activeBoxCategory` をセットして `boxView="grid"` へ遷移。メニュー画面全体に `font-adventure`（ドットフォント）を適用  
**グリッド:** PC は `SLOTS_PER_PAGE=100` の 10×10、モバイルは 6×6（36）に切り替え。`skills/items` でデータソースを切り替え、`currentBoxPage` でページング  
**スキルデータ:** `SKILL_ENTRIES` は `rare(1〜5) / level(1〜6) / attack / url?` を持つ構造。`attack` は開始日・取得日を年月日カンマ区切りで表す（未定は `???,???,???`）。`url` はアイコン画像（未設定時は頭文字表示）。表示順は配列定義順をそのまま使用  
**アイテムデータ:** `ITEM_ENTRIES` は全113スロット（頂上混成 BAKUONSOOO8th 100 + ぶたくん1 + リプトン12）。リプトンは各スロット `quantity=12`。表示順は固定シード（`20260220`）で初期化時に1回だけシャッフル  
**画像URL集約:** `boxData.ts` の `getBoxImageUrls()` が `SKILL_ENTRIES.url` とアイテム画像 (`iconPath`) をユニーク化して返し、プリロード元として利用  
**デバイス判定:** 初回描画時に `window.innerWidth < 768` で `isMobile` を即時判定し、`resize` 監視で更新（初回の 10×10 → 6×6 ジャンプを回避）  
**詳細パネル:** `selectedBoxSlotIndex` に応じて `SkillDetailPanel` / `ItemDetailPanel` を表示。詳細側もグリッド同様に「外枠 + 内枠（左右のみ）」の二重枠構成。内側背景は `#0b101c`  
**スキル詳細表示:** 背景は `#0b101c`。ヘッダー（アイコン+名前）→ `RARE n` 右寄せ → `◆ 攻撃力` → `◆ 斬れ味` → 斬れ味ゲージ右寄せ → 説明文の順で表示し、各段は `border-b-[3px]` の破線で区切る。説明文は `line-clamp-4` で表示行数を制限  
**PCレイアウト:** 詳細パネルは `w-64〜w-72` 幅で `h-[40%]`。グリッド側は `flex-1` で残り領域を使用  
**モバイルレイアウト:** ルートは `h-[95dvh]` の固定領域。詳細パネルは `h-[36vh]`、グリッドは `h-[50vh]` 固定で縦積みし、グリッド内部は `containerType:size` + `100cqmin` で常に正方形を維持  
**ページ数計算:** `entries.length / slotsPerPage` から動的算出し、`currentBoxPage` を有効範囲にクランプ  
**軽量化:** セル選択ハイライトは `classList` の直接更新（前回セル/今回セルのみ）で O(1) 更新し、100セル全再描画を回避  
**クローズ:** menu 画面では外側クリックで閉じる。grid 画面は「もどる」で menu に戻る

---

### SectionImagesPreloader.tsx

| 項目      | 内容                                                                 |
| --------- | -------------------------------------------------------------------- |
| **責務**  | World 表示直後に PostUI/BoxUI 用画像のプリロードを 1 回開始する      |
| **Props** | なし                                                                 |
| **依存**  | `preloadSectionImages`（`lib/world/preloadSectionImages.ts`）        |

**配置:** `World.tsx` の `<Suspense>` 内に配置  
**実行タイミング:** マウント時の `useEffect` で 1 回だけ `preloadSectionImages()` を呼び出す  
**描画:** R3F ツリー内で副作用だけ実行するため、`<group />` を返す

---

### PostUI.tsx

| 項目      | 内容                                                                                |
| --------- | ----------------------------------------------------------------------------------- |
| **責務**  | 手紙オーバーレイ UI の表示・クローズ制御・入力フォーム・送信処理                     |
| **Props** | なし                                                                                |
| **依存**  | useInputStore, `next/image`, `react-icons/fa`, `fetch("/api/letter")`, `.font-dancing`, `.font-playfair`, `public/post/*.png` |

**表示条件:** `isPostOpen=true` のとき全画面オーバーレイを表示（`page.tsx` で動的 import）  
**表示内容:** 背景に `/post/letter.png` を `next/image`（`fill`）で表示し、紙上にフォームを重ねる。モバイルは `object-cover top`、PCは `object-contain center`。モバイルの紙面コンテナは `h-[80vh]` で中央配置  
**ヘッダー表示:** 宛名 (`To: Shogo Morisawa`) と切手画像 (`/post/stamp.png`) を横並びで表示。切手はボタン化されている  
**切手モーダル:** 切手クリックで `isStampModalOpen=true` になり、SNSリンクモーダル（`My Connections`）を表示。`FaGithub` / `FaInstagram` アイコンを使用し、GitHub と Instagram 2アカウントへの外部リンクを表示。背景クリックまたは右上 `✕` で閉じる  
**入力UI:** `name`（必須）, `email`（任意）, `message`（必須）をローカル state で保持。`form_input.png` を名前/メール入力欄の装飾背景に使用  
**送信処理:** `handleSubmit` で `/api/letter` に POST。payload は `name/email/message`（trim して空文字は `undefined`）と `meta`（`sentAt`, `userAgent`, `screenSize`, `language`）  
**送信状態:** `isSending` で多重送信を防止し、送信中は送信ボタンを `disabled` にする。失敗時は `submitError` を表示  
**成功表示:** 送信成功時は `submitSuccess=true` で「Your letter has been sent. / Thank you for your message.」を表示し、約2秒後にクローズ  
**送信UI:** `send-button.png` を送信ボタン画像として表示  
**クローズ:** 背景クリック、`Esc` キー、右上 `×` ボタンで `setIsPostOpen(false)`。ただし `Esc` は `isStampModalOpen=true` の場合にまずモーダルを閉じる

---

### app/api/letter/route.ts

| 項目      | 内容                                                            |
| --------- | --------------------------------------------------------------- |
| **責務**  | PostUI から受け取った手紙データをメール送信し、JSON で結果を返却 |
| **依存**  | `next/server`（Route Handler）, `resend`                        |

**エンドポイント:** `POST /api/letter`  
**入力:** `name`, `email`, `message`, `meta`（送信時刻・UA・画面サイズ・言語）  
**配送:** `Resend.emails.send` を使って `process.env.MY_EMAIL` 宛に送信（送信元は `onboarding@resend.dev`）  
**レスポンス:** 成功時 `{ success: true, data }`。Resend/API エラー時は `500` + `{ error: string }`  
**必要環境変数:** `RESEND_API_KEY`, `MY_EMAIL`

---

## レンダリングパイプライン

1. **シーン描画** → 画面へ直接出力（Environment + ambientLight + Sparkles を含む）
2. **Canvas flat:** 物理ベースライティングを無効化。EffectComposer/Bloom は使用していない
3. **Overlay最適化:** Canvas は `frameloop="always"` を維持し、BoxUI/AdventureBookUI/PostUI/Computer 表示中は `Crystal` のみ `isFrozen` で停止。Book/Box/Post/Computer/Tablet の動きは継続

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

### Tablet 画像切替

- **画像読込:** `useTexture(TABLET_SCREEN_IMAGES)` で全画像を読み込み
- **インデックス正規化:** `((index % length) + length) % length` で負数/範囲外を補正
- **表示:** `meshBasicMaterial` の `map` を現在テクスチャへ差し替えて描画
- **更新方式:** `setTabletScreenImageIndex((prev) => next)` の updater 関数に対応し、連続クリック時も index を安全更新
- **閉じる時の初期化:** `setIsComputerOpen(false)` 時に `tabletScreenImageIndex` を `0` に戻す

---

## アセット

| パス                                                                               | 形式 | 用途                                                      | ノード名                                        |
| ---------------------------------------------------------------------------------- | ---- | --------------------------------------------------------- | ----------------------------------------------- |
| models/coco.glb                                                                    | GLB  | プレイヤー（Coco）                                        | Scene ルートを `SkeletonUtils.clone` でクローン |
| models/crystal-transformed.glb                                                     | GLB  | クリスタル                                                | Body, Left_Eye                                  |
| models/dome-transformed.glb                                                        | GLB  | ドーム（Dome）                                            | Dome                                            |
| models/floor-transformed.glb                                                       | GLB  | 床（Floor）                                               | Floor                                           |
| models/book-transformed.glb                                                        | GLB  | 本（Book）                                                | Mesh_0                                          |
| models/box-transformed.glb                                                         | GLB  | 箱（Box）                                                 | mesh_0                                          |
| models/post-transformed.glb                                                        | GLB  | ポスト（Post）                                            | mesh_0                                          |
| models/computer-transformed.glb                                                    | GLB  | コンピューター（Computer）                                | mesh_0                                          |
| models/tablet.glb                                                                  | GLB  | タブレット（Tablet）                                      | mesh_0 / Mesh_0（モデル差異を吸収して探索）    |
| models/coco-transformed.glb                                                        | GLB  | Coco の旧変換モデル（未使用）                             | -                                               |
| models/crystal.glb, dome.glb, floor.glb, book.glb, box.glb, post.glb, computer.glb | GLB  | 元モデル（レガシー）                                      | -                                               |
| items/bakuonso.png, items/butakun.png, items/lipton.png                            | PNG  | BoxUI アイテムアイコン + Tablet 画面切替画像              | -                                               |
| skills/\*.png                                                                      | PNG  | BoxUI スキルアイコン（`boxData.ts` の `url` 参照）        | -                                               |
| post/letter.png                                                                    | PNG  | PostUI 手紙背景画像                                       | -                                               |
| post/form_input.png                                                                | PNG  | PostUI 名前/メール入力欄の装飾背景                        | -                                               |
| post/send-button.png                                                               | PNG  | PostUI 送信ボタン画像                                     | -                                               |
| post/stamp.png                                                                     | PNG  | PostUI 宛名横に表示する切手画像                           | -                                               |
| textures/coco_texture.png                                                          | PNG  | Coco Body の Matcap                                       | -                                               |
| textures/crystal_texture.jpg                                                       | JPG  | クリスタル Matcap                                         | -                                               |
| textures/dome_texture.jpg                                                          | JPG  | ドーム Matcap                                             | -                                               |
| textures/floor_texture.jpg                                                         | JPG  | 床 Matcap                                                 | -                                               |

**-transformed モデル:** Dome, Floor, Book, Box, Post, Computer は変換済みの GLB を使用。Tablet は `tablet.glb`、Coco は `coco.glb` を使用。  
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

### 環境変数（手紙送信）

- `RESEND_API_KEY`: Resend の API キー（`app/api/letter/route.ts` で使用）
- `MY_EMAIL`: 手紙の配送先メールアドレス
- `.env.local` に設定し、未設定時は `/api/letter` の送信で 500 エラーになる

---

## 今後の拡張

- [x] **useDeviceType**: PC/Mobile 判定（768px 未満でモバイル）。CAMERA を動的に切り替え（実装済み）
- [ ] **usePlayerInput**: キーボードとタッチ入力を完全に抽象化。現状は store でジョイスティックのみ共有
- [x] **VirtualJoystick**: スマホ用仮想ジョイスティック UI（JoystickControls + react-joystick-component で実装済み）
- [x] **床の境界**: プレイヤーが床外に落ちないよう制限（BOUNDARY_RADIUS で XZ 平面の円形境界を実装済み）
- [x] **モデルプリロード**: Coco で useGLTF.preload を実装済み

---

## トラブルシューティング

| 現象                       | 原因                   | 対処                                             |
| -------------------------- | ---------------------- | ------------------------------------------------ |
| プレイヤーが床をすり抜ける | 床の法線が逆           | Blender で法線を反転                             |
| ドームが浮く/沈む          | DOME_POSITION_Y のずれ | 床とドームの BoundingBox を確認し調整            |
| モデルが表示されない       | パス・ノード名の誤り   | public/ からの相対パス、nodes のキーを確認       |
| カメラが追従しない         | groundRef が null      | Floor のロード完了を待つ。INITIAL_Y で落下を遅延 |
| Tablet 画像が透明になる    | `tabletScreenImageIndex` が数値でなく関数化され `NaN` 参照になる | `setTabletScreenImageIndex` を updater 関数対応にし、index を剰余で正規化する |
| 手紙の送信に失敗する       | 環境変数未設定/Resend側エラー | `RESEND_API_KEY` と `MY_EMAIL` を確認し、API レスポンスの `error` を確認 |

---

## ドキュメントの使い分け

| ファイル  | 用途                                        |
| --------- | ------------------------------------------- |
| README.md | GitHub 公開用。セットアップ、概要、デプロイ |
| SPEC.md   | 開発・AI エージェント向け。本仕様書         |
