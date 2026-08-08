"use client";

import { forwardRef, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 图床上传编辑组件：上传本地图片到图床（服务端代理，凭证不暴露），返回 URL 填字段
const EditComponent = forwardRef((props: any, ref: React.Ref<HTMLInputElement>) => {
	const { field, value, onChange } = props;
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const upload = async (file: File) => {
		const form = new FormData();
		form.append("file", file);
		setUploading(true);
		setError("");
		try {
			const res = await fetch("/api/imgbed-upload", { method: "POST", body: form });
			const data = await res.json();
			if (!data?.success) throw new Error(data?.error || "上传失败");
			onChange(data.url);
		} catch (e: any) {
			setError(`上传失败：${e?.message || e}`);
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 flex-wrap">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) upload(f);
					}}
				/>
				<Button
					type="button"
					size="sm"
					variant="outline"
					disabled={uploading}
					onClick={() => fileInputRef.current?.click()}
				>
					{uploading ? "上传中…" : "📤 上传到图床"}
				</Button>
				<Input
					ref={ref}
					type="url"
					placeholder="图片 URL（可直接粘贴）"
					value={value || ""}
					onChange={onChange}
					className={cn("flex-1 min-w-[200px] text-base", field?.readonly && "focus-visible:border-input focus-visible:ring-0")}
					readOnly={field?.readonly}
				/>
			</div>
			{value ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={value} alt="预览" className="max-w-[160px] max-h-[100px] rounded-md object-cover" />
			) : null}
			{error ? <p className="text-xs text-destructive">{error}</p> : null}
		</div>
	);
});

export { EditComponent };
