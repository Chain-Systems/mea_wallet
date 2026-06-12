import * as Localization from "expo-localization";

export function getRegionCode(): string {
  const locales = Localization.getLocales();
  return locales[0]?.regionCode ?? "";
}

export function isChinaRegion(): boolean {
  return getRegionCode() === "CN";
}
