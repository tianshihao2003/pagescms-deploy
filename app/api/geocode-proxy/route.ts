// 高德地理编码代理路由
// 作用：amap-geocode 自定义字段的编辑组件把地址传到这里，
//       本路由携带高德 key 调地理编码 API（key 不暴露在前端）
// 环境变量（Vercel 配置）：AMAP_KEY 高德开放平台 Web 服务 key

export async function GET(request: Request) {
	const url = new URL(request.url);
	const address = url.searchParams.get("address");
	if (!address) {
		return Response.json({ success: false, error: "缺少 address 参数" }, { status: 400 });
	}
	if (!process.env.AMAP_KEY) {
		return Response.json({ success: false, error: "服务端未配置 AMAP_KEY" }, { status: 500 });
	}

	try {
		const res = await fetch(
			`https://restapi.amap.com/v3/geocode/geo?key=${encodeURIComponent(process.env.AMAP_KEY)}&address=${encodeURIComponent(address)}`,
		);
		const data = await res.json();
		if (data.status === "1" && data.geocodes && data.geocodes.length > 0) {
			// location 格式："lng,lat"
			const parts = data.geocodes[0].location.split(",");
			return Response.json({
				success: true,
				lat: Number(parts[1]),
				lng: Number(parts[0]),
				formattedAddress: data.geocodes[0].formatted_address || "",
			});
		}
		return Response.json({ success: false, error: "未找到该地址" });
	} catch (e: any) {
		return Response.json({ success: false, error: String(e?.message || e) }, { status: 500 });
	}
}
