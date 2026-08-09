/** @type {import('next').NextConfig} */
// OpenNext Cloudflare：本地 dev 时初始化 Cloudflare bindings（生产构建无需）
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig = {};

export default nextConfig;
