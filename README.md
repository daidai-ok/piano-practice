# voicing. — ジャズピアノの練習室

コードの構成音を鍵盤で確認し、五度圏からⅡ–Ⅴ–Ⅰを学ぶ日本語の練習用Webアプリです。

## 起動

Node.js 22以上を使用します。アプリの起動には追加パッケージのインストールは不要です。Cloudflareへの公開・公開設定の検証には、初回に `npm ci` でWranglerをインストールします。

```sh
npm run dev
```

ブラウザで http://localhost:5173 を開きます。別ポートを使う場合は `npm run dev -- --port 5174`。

## 使える機能

- **当面の練習目標**：maj7・m7・7の3種類を全12キー（計36コード）で覚え、全12キーのⅡ–Ⅴ–Ⅰを**ルート入りの4音**（ルート・3度・5度・7度）のヴォイシングで弾けるようになること。コード一覧ではこの3種類を優先表示します。
- **12キーの反復**：コード一覧とⅡ–Ⅴ–Ⅰにキー送りを用意。C → F → B♭ → E♭ → A♭ → D♭ → G♭ → B → E → A → D → G → C の順で練習できます。マイナーでは内側の五度圏の音名を使います。
- **コード一覧**：12音のルート × 10種類のコード。メジャー、マイナー、dim、aug、maj7、m7、7、m7♭5、dim7、m(maj7)。
- **鍵盤表示**：C3〜C5の鍵盤上に基本形を表示。濃い緑がルート、薄い緑がその他の構成音。鍵盤をタップすると単音を再生できます。
- **構成音と試聴**：音名と度数、コードの説明、和音／アルペジオ再生。
- **五度圏**：外側はメジャーキーと調号、内側は対応する平行短調。時計回りに完全5度上昇します。外側・内側のどちらも選べます。
- **スケール表示**：外側をタップすると、その音をルートにしたメジャースケール。内側をタップすると、その音をルートにしたナチュラルマイナースケール。1オクターブの音名・度数・全音／半音の並びと、鍵盤のハイライトを表示し、順番に試聴できます。たとえば外側のCは C–D–E–F–G–A–B–C、内側のAmは A–B–C–D–E–F–G–A。
- **Ⅱ–Ⅴ–Ⅰ**：五度圏で選んだ音をトニックとする3コードを同時表示。個別の鍵盤確認、一連の試聴、コード一覧への移動ができます。
- **ルート入りのフォーノート**：Ⅱ–Ⅴ–Ⅰを「基本形」と「転回形でつなぐ」で切り替え。どちらも各コードの4構成音を1回ずつ含みます。転回形ではルートが最低音とは限りません。転回形名、最低音、低い音からの構成音・度数を表示し、鍵盤と音声も同じ並びになります。
- **メジャー／マイナー切替**：メジャーは ii7–V7–Imaj7。マイナーは iiø7–V7–i(maj7)。マイナーのトニックには複数の選択肢がありますが、この初版では m(maj7) を採用しています。
- **選択状態の保存**：ルート、コード種、画面、解決先、調性、ヴォイシングをブラウザ内に保存。
- **楽譜の読み方**：ト音記号（C4〜A5）・ヘ音記号（E2〜C4）の音符を選び、対応する鍵盤・ドレミ・音名・五線上の位置を確認して試聴。表示範囲内の白鍵から音符も選択できます。「中央ドを両方で見る」で、同じC4が両記号の加線に現れることを比較できます。五線譜は狭い画面で横スクロール、音符は左右矢印・Home・Endでも移動できます。
- **スマートフォン・キーボード操作**：Tab／Enter／Spaceで操作。鍵盤間は左右矢印、Home／Endで移動。Escapeで音を停止。

音声はWeb Audio APIによる合成音です。最初の再生操作で音声を有効にします。実際のピアノ音源、MIDI接続、ルートレスヴォイシングは対象外です。コード一覧は基本形、Ⅱ–Ⅴ–Ⅰは基本形と転回形を切り替えられます。

「転回形でつなぐ」はⅡを基本形に固定し、C3〜C5内のⅤ・Ⅰの密集配置を比較します。低い声部同士から対応させた2回の遷移の移動量（半音数の合計）が最小になる組を選び、同点では最大跳躍、Ⅰ・Ⅴの転回形番号の順に比較します。運指や厳密な和声法を最適化するものではなく、移動を小さくする練習例です。

例：Cメジャーでは Dm7＝D3–F3–A3–C4 → G7＝D3–F3–G3–B3 → Cmaj7＝C3–E3–G3–B3。G7のルートGも残したままつなぎます。

同じ鍵盤でもコードに応じて音名が異なります（例：Cdim7のB♭♭はAと同じ鍵盤）。音名はコードの度数に沿って表記します。コード一覧では黒鍵のルートを♭／♯表記に切り替えられます。

ナチュラルマイナースケールは第7音を上げません。一方、マイナーのⅡ–Ⅴ–ⅠはⅤ7とⅠm(maj7)に導音を含みます。この違いは画面内でも説明しています。

## 確認・ビルド

```sh
npm test
npm run build
npm run preview
```

`dist/` に静的サイトを出力します。`npm run preview` はそのビルドを配信します。外部API・CDN・ランタイム依存パッケージはありません。開発サーバーはループバックアドレスのみにバインドします。

## Cloudflare Workersで公開

Cloudflare WorkerがBASIC認証を行い、認証後にWorkers Static Assetsで `dist/` のHTML・CSS・JavaScriptを配信します。`assets.run_worker_first: true` により、JavaScript・CSS・画像への直接アクセスも認証対象です。

公開先のWorker名は、`wrangler.jsonc` の `name` に `piano-practice` を設定しています。

### 手動デプロイ

初回は依存パッケージをインストールし、Cloudflareにログインします。

```sh
npm ci
npx wrangler login
```

`.dev.vars` がまだなければ `.dev.vars.example` をコピーし、`BASIC_AUTH_PASSWORD` に公開時のパスワードを設定します。以降はリポジトリ直下で次を実行します。

```sh
make deploy
```

ビルド後、`piano-practice` にデプロイし、`.dev.vars` のパスワードを本番のSecretとして登録・更新します。ユーザー名は `root` です。完了後、ターミナルに表示される公開URLからアクセスできます。GitHubへのpushは不要です。

### GitHub連携での自動デプロイ

Cloudflareの対象Workerで **Settings → Build** を開き、GitHubリポジトリを連携して次の設定を使います。

| 項目 | 設定値 |
| --- | --- |
| Production branch | `main` |
| Root directory | リポジトリ直下 |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| ビルド環境変数 | `NODE_VERSION=22` |

公開ファイルの場所は `wrangler.jsonc` の `assets.directory` に指定しています。設定ファイルと `package.json`、`package-lock.json` をGitHubへpushすると、Cloudflareがビルド・デプロイします。成功後は管理画面に表示されるWorkersの公開URLからアクセスできます。

### BASIC認証のパスワード設定

ユーザー名は `root` です。`make deploy` では `.dev.vars` の `BASIC_AUTH_PASSWORD` を本番のSecretに登録します。管理画面から設定する場合は、対象Workerの **Settings → Variables and Secrets → Add** で、種類を **Secret**、名前を **BASIC_AUTH_PASSWORD** にして、使用するパスワードを設定・デプロイしてください。これは実行時のSecretで、ビルド用の環境変数ではありません。パスワードが未設定・空の場合は503を返し、サイトを配信しません。

パスワードをソースコードや `wrangler.jsonc` に書く必要はありません。認証処理は `worker/` にあり、ブラウザに配信する `dist/` には含まれません。認証済みのレスポンスにも `Cache-Control: private, no-store` を付けます。

ローカルでBASIC認証を確認する場合は、`.dev.vars.example` を `.dev.vars` にコピーしてパスワードを設定し、次を実行します。`.dev.vars` はGitの管理対象外です。

```sh
npm ci
npm run preview:auth
```

`http://localhost:8787` を開くとブラウザ標準の認証ダイアログが表示されます。通常の `npm run dev` / `npm run preview` はローカルでアプリを開発するための認証なしサーバーです。

ローカルで、実際には公開せず設定を検証するには次を実行します。

```sh
npm ci
npm run build
npx wrangler deploy --dry-run --secrets-file .dev.vars
```

参考：[Workersのビルド設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)・[静的アセットの設定](https://developers.cloudflare.com/workers/static-assets/binding/)・[Secretの設定](https://developers.cloudflare.com/workers/configuration/secrets/)・[Workers BuildsのWorker名](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/#workers-name-requirement)

## 構成

```text
src/theory.js     コード、音名、五度圏、Ⅱ–Ⅴ–Ⅰ、スケールの純粋関数
src/audio.js      Web Audioによる発音と再生制御
src/app.js        画面・鍵盤・五度圏・操作
src/tokens.css    色とフォントのトークン
src/styles.css    レスポンシブレイアウト
src/notation.js   音符の高さ・加線・鍵盤位置の対応
src/reading.js    ト音記号・ヘ音記号の読譜画面
src/fonts/       Bravura楽譜フォントとOFLライセンス
worker/index.js   CloudflareでのBASIC認証・静的ファイル配信
wrangler.jsonc    Cloudflare Workersの公開設定
Makefile         ビルド・手動デプロイ（make deploy）
tests/           音楽理論・音声制御の自動テスト
scripts/         開発サーバー・静的ビルド
```

## 音楽理論の参考資料

- [Open Music Theory — Triads and seventh chords](https://openmusictheory.github.io/triads.html)
- [Music Theory for the 21st-Century Classroom — Standard Chord Progressions](https://musictheory.pugetsound.edu/mt21c/StandardChordProgressions.html)
- [Open Music Theory — Reading Clefs](https://viva.pressbooks.pub/openmusictheory/chapter/clefs/)

独自の音楽理論計算を実装しており、参考資料からのコードや楽譜の転載はありません。

音部記号には[SteinbergのBravura](https://github.com/steinbergmedia/bravura)を使用しています（SIL Open Font License 1.1）。フォントとライセンスは `src/fonts/` に同梱し、外部CDNにはアクセスしません。
