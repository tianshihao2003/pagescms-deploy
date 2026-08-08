// 自定义字段：图床上传（imgbed）
// 值：图片 URL 字符串（string）
// 编辑组件：上传本地图片到用户自建图床（走 /api/imgbed-upload 服务端代理），
//           返回完整 URL 填入字段；也可手动粘贴 URL
// 用途：moments 的 images 列表、album 的 photos 列表等（.pages.yml 中声明 widget 类型为 imgbed）
import { z } from "zod";
import { Field } from "@/types/field";
import { EditComponent } from "./edit-component";

const defaultValue = (_field: Field) => "";

const read = (value: any, _field: Field) => {
	if (typeof value === "string") return value;
	return "";
};

const write = (value: any, _field: Field) => {
	if (typeof value === "string") return value;
	return "";
};

const schema = (_field: Field) => z.string();

export { EditComponent, schema, read, write, defaultValue };
