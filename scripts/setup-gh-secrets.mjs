// 一次性脚本：把 Cloudflare 部署需要的 secrets 配置到 GitHub 仓库
// 用法：node scripts/setup-gh-secrets.mjs
// 环境变量（或直接改下面的值）：
//   GITHUB_TOKEN       git 凭据 token（自动从 git credential 读取）
//   CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / DATABASE_URL / ADMIN_EMAILS
//   BETTER_AUTH_SECRET / CRYPTO_KEY / GITHUB_APP_* / IMAGEBED_* / AMAP_KEY
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sodium = require("libsodium-wrappers");

const OWNER = "tianshihao2003";
const REPO = "pagescms-deploy";

// 从 git 凭据读取 token
const token = process.env.GITHUB_TOKEN || execSync(
  'echo "protocol=https\nhost=github.com" | git credential fill',
  { encoding: "utf8" },
).match(/^password=(.+)$/m)?.[1].trim();

if (!token) {
  console.error("✗ 无法获取 GitHub token");
  process.exit(1);
}

// 需要配置的 secrets
const SECRETS = {
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  CRYPTO_KEY: process.env.CRYPTO_KEY,
  // 注意：GitHub 保留 GITHUB_ 前缀，secret 名不能用它开头，用 GH_APP_*
  GH_APP_ID: process.env.GITHUB_APP_ID,
  GH_APP_NAME: process.env.GITHUB_APP_NAME,
  GH_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
  GH_APP_WEBHOOK_SECRET: process.env.GITHUB_APP_WEBHOOK_SECRET,
  GH_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID,
  GH_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
  IMAGEBED_URL: process.env.IMAGEBED_URL,
  IMAGEBED_AUTH_CODE: process.env.IMAGEBED_AUTH_CODE,
  IMAGEBED_FOLDER: process.env.IMAGEBED_FOLDER,
  AMAP_KEY: process.env.AMAP_KEY,
};

const missing = Object.entries(SECRETS).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.warn("⚠ 跳过缺失的变量:", missing.join(", "));
}

// 获取仓库 public key
const keyRes = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/actions/secrets/public-key`,
  { headers: { Authorization: `Bearer ${token}`, "User-Agent": "setup-secrets" } },
);
const { key_id, key } = await keyRes.json();

// 加密 + 写入（GitHub 用 libsodium sealed box）
await sodium.ready;
for (const [name, value] of Object.entries(SECRETS)) {
  const encrypted = sodium.crypto_box_seal(
    sodium.from_string(value),
    // GitHub 的 public key 是标准 base64（带 = padding），必须用 ORIGINAL 变体
    sodium.from_base64(key, sodium.base64_variants.ORIGINAL),
  );
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/secrets/${name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "setup-secrets",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encrypted_value: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL), key_id }),
    },
  );
  console.log(res.ok ? `  ✓ ${name}` : `  ✗ ${name}: HTTP ${res.status}`);
}
console.log("完成");
