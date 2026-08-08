"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 高德坐标搜索组件：输入地址 → 服务端代理调高德地理编码 → 回填 lat/lng
const EditComponent = forwardRef((props: any, ref: React.Ref<HTMLInputElement>) => {
	const { field, value, onChange } = props;
	const [address, setAddress] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const search = async () => {
		if (!address.trim()) {
			setError("请先输入地址");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`/api/geocode-proxy?address=${encodeURIComponent(address.trim())}`);
			const data = await res.json();
			if (!data?.success) throw new Error(data?.error || "未找到该地址");
			onChange({ lat: data.lat, lng: data.lng });
		} catch (e: any) {
			setError(`查询失败：${e?.message || e}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 flex-wrap">
				<Input
					ref={ref}
					type="text"
					placeholder="输入地址或城市，如：郑州"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") search();
					}}
					className="flex-1 min-w-[180px] text-base"
				/>
				<Button type="button" size="sm" variant="outline" disabled={loading} onClick={search}>
					{loading ? "查询中…" : "📍 搜索坐标"}
				</Button>
			</div>
			{value && typeof value.lat === "number" ? (
				<p className="text-xs text-muted-foreground">
					当前坐标：纬度 {value.lat}，经度 {value.lng}（保存后写入 lat/lng 字段）
				</p>
			) : null}
			{error ? <p className="text-xs text-destructive">{error}</p> : null}
		</div>
	);
});

export { EditComponent };
