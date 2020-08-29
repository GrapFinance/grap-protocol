import zh from "./translations/zh";
import en from "./translations/en";
const translations: any = {zh, en};
export default function (key: any) {
  let t = localStorage.getItem("t") || "en";
  return translations[t][key] || "";
}
