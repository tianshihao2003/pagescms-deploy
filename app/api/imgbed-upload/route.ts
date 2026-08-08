// 图床上传代理路由
// 作用：imgbed 自定义字段的编辑组件把图片 POST 到这里，
//       本路由携带服务端凭证转发到 CloudFlare-ImgBed 图床（凭证不暴露在前端）
// 环境变量（Vercel 配置）：
//   IMAGEBED_URL         图床域名，如 https://img.tsh520.cn
//   IMAGEBED_AUTH_CODE   图床上传认证码
//   IMAGEBED_FOLDER      上传目录（可选），如 手机uu
//   IMAGEBED_CHANNEL     上传渠道（可选）
// 图床 API：POST /upload?authCode=xxx&uploadFolder=yyy&returnFormat=full
//           FormData: file → 响应 [{ src: "完整URL" }]

export async function POST(request: Request) {
	const baseUrl = process.env.IMAGEBED_URL || "https://img.tsh520.cn";
	try {
		const form = await request.formData();

		const params = new URLSearchParams({ returnFormat: "full" });
		if (process.env.IMAGEBED_AUTH_CODE) params.set("authCode", process.env.IMAGEBED_AUTH_CODE);
		if (process.env.IMAGEBED_FOLDER) params.set("uploadFolder", process.env.IMAGEBED_FOLDER);
		if (process.env.IMAGEBED_CHANNEL) params.set("uploadChannel", process.env.IMAGEBED_CHANNEL);

		const res = await fetch(`${baseUrl}/upload?${params.toString()}`, {
			method: "POST",
			body: form,
		});
		const text = await res.text();
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			return Response.json({ success: false, error: `图床响应不是 JSON: ${text.slice(0, 200)}` }, { status: 502 });
		}

		const item = Array.isArray(data) ? data[0] : null;
		const src = (item && (item.src || item.publicUrl)) || "";
		if (!src) {
			return Response.json({ success: false, error: `图床响应异常: ${text.slice(0, 200)}` }, { status: 502 });
		}
		const full = src.startsWith("http") ? src : baseUrl + src;
		return Response.json({ success: true, url: full });
	} catch (e: any) {
		return Response.json({ success: false, error: String(e?.message || e) }, { status: 500 });
	}
}
