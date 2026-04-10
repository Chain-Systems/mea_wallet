import { Platform, ToastAndroid, Alert } from "react-native";

export const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS fallback
    Alert.alert("", message);
  }
};
export const tokenImageMap: Record<string, any> = {
  mea: require("@/assets/images/currency/mea.png"),
  sol: require("@/assets/images/currency/sol.png"),
  recon: require("@/assets/images/currency/recon.png"),
  fox9: require("@/assets/images/currency/fox9.png"),
  usdt: require("@/assets/images/currency/usdt.png"),
  aon: require("@/assets/images/currency/aon.png"),
  alton: require("@/assets/images/currency/alton.png"),
  mea_gopax : require("@/assets/images/currency/mea.png"),
};
/**
 * Trims trailing zeroes from a decimal string (but retains it as a string).
 * Examples:
 *   "1.0000" => "1"
 *   "0.120000" => "0.12"
 *   "10.00001" => "10.00001"
 *   "100" => "100"
 */
export function trimTrailingZeros(value: string): string {
  try {
    if (!value.includes(".")) return value; // no decimal point
    return value.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/, "");
  } catch (error) {
    console.log(error, value);
    return "0";
  }
}

export function parseNumberForView(value: string, maxLength: number = 12) {
  value = trimTrailingZeros(value);

  if (value.length <= maxLength) {
    return value;
  }

  const prefix = value.substring(0, maxLength);
  const suffix = value.substring(maxLength);

  // If decimal exists inside prefix
  if (prefix.includes(".")) {
    // Avoid ending with a trailing dot
    if (prefix[maxLength - 1] === ".") {
      return prefix.substring(0, maxLength - 1);
    }
    return prefix;
  }

  // If decimal starts right after prefix → avoid splitting number
  if (suffix.at(0) === ".") {
    return prefix;
  }

  // Fallback: use scientific notation for large numbers
  const num = Number(value);
  if (!isNaN(num)) {
    return num.toExponential(4); // tweak precision if needed
  }

  return prefix; // safe fallback
}

/**
 * Truncates a wallet address to a viewable format.
 * Example: 0x123456...abcd
 *
 * @param {string} address - Full wallet address
 * @param {number} startLength - Number of characters to keep at start (default: 6)
 * @param {number} endLength - Number of characters to keep at end (default: 4)
 * @returns {string} Truncated address
 */
/**
 * Truncates a wallet address to a viewable format.
 * Example: 0x123456...abcd
 *
 * @param address - Full wallet address
 * @param startLength - Number of characters to keep at start (default: 6)
 * @param endLength - Number of characters to keep at end (default: 4)
 * @returns Truncated address string
 */
export const truncateAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

type PasswordValidationResult = {
  valid: boolean;
  error:
    | "length_error"
    | "number_missing"
    | "symbol_missing"
    | "invalid_characters"
    | null;
};

export function validatePasswordWithReason(
  password: string
): PasswordValidationResult {
  const result: PasswordValidationResult = {
    valid: false,
    error: null,
  };

  // Check length
  if (password.length < 4 || password.length > 15) {
    result.error = "length_error";
    return result;
  }

  // Allowed symbols definition
  const allowedSymbols = "!@#$%^&*()-_=+[]{}|;:',.<>/?`~";

  // Check for invalid characters (only lowercase letters, numbers, and allowed symbols)
  const allowedRegex = new RegExp(`^[a-z0-9${escapeRegExp(allowedSymbols)}]+$`);
  if (!allowedRegex.test(password)) {
    result.error = "invalid_characters";
    return result;
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    result.error = "number_missing";
    return result;
  }

  // Check for at least one symbol
  const symbolRegex = new RegExp(`[${escapeRegExp(allowedSymbols)}]`);
  if (!symbolRegex.test(password)) {
    result.error = "symbol_missing";
    return result;
  }

  // Passed all checks
  result.valid = true;
  return result;
}

// Helper function to escape regex special characters in allowedSymbols
function escapeRegExp(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function isValidNumber(str: string) {
  const regex = /^-?\d+(\.\d+)?$|^-?\d+\.$/;
  return regex.test(str);
}

export const updateIfValid = (
  value: string,
  trigger: (value: string) => void
) => {
  if (isValidNumber(value) || value.length === 0) {
    console.log("valid", value);
    trigger(value);
  } else {
    console.log("notvalid", value);
  }
};

export const getDisplaySymbol = (symbol: string) => {
  if (symbol === "usdt_savings") {
    return "USDT";
  }
  if (symbol === "mea_gopax") {
    return "MEA(PAX)"
  }
  return symbol?.toUpperCase() || "";
};

export const formatDecimal = (
  value: string | number,
  decimals: number = 6
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  
  // Use toFixed to round/pad to decimals, then trim trailing zeros if desired
  // But user asked to "round to last 6 digits", implying fixed precision might be wanted.
  // However, usually "round to" means max decimals. 
  // Let's use toFixed(6) and then trimTrailingZeros to be clean but precise.
  return trimTrailingZeros(num.toFixed(decimals));
};
