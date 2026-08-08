// 自定义字段：高德坐标搜索（amap-geocode）
// 值：对象 { lat: number, lng: number }
// 编辑组件：输入地址 → 调 /api/geocode-proxy（服务端代理，高德 key 不暴露）→ 回填坐标
// 保存时由 files route 把该字段展开为顶层 lat/lng（见 files/[path]/route.ts 的 transform）
// 用途：life-places 足迹的坐标编辑（.pages.yml 中声明 widget 类型为 amap-geocode）
import { z } from "zod";
import { Field } from "@/types/field";
import { EditComponent } from "./edit-component";

const defaultValue = (_field: Field) => ({ lat: undefined, lng: undefined });

const read = (value: any, _field: Field) => {
	if (value && typeof value === "object" && "lat" in value && "lng" in value) {
		return { lat: Number(value.lat), lng: Number(value.lng) };
	}
	return undefined;
};

const write = (value: any, _field: Field) => {
	if (value && typeof value === "object" && typeof value.lat === "number" && typeof value.lng === "number") {
		return value;
	}
	return undefined;
};

const schema = (_field: Field) =>
	z
		.object({
			lat: z.number(),
			lng: z.number(),
		})
		.optional();

export { EditComponent, schema, read, write, defaultValue };
