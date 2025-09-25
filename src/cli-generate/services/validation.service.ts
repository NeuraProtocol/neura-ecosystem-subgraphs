export class ValidationService {
  static isValidAddress(address: string): boolean {
    const addressPattern = "^0x[a-fA-F0-9]{40}$";
    const regex = new RegExp(addressPattern);
    return regex.test(address);
  }

  static isValidUrl(url: string): boolean {
    try {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        return false;
      }
      // Basic validation for URL structure
      return url.includes("://") && url.length > 10;
    } catch {
      return false;
    }
  }

  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  static isValidAppName(appName: string): boolean {
    // Check for invalid filesystem characters (excluding forward slash for nested directories)
    const invalidChars = /[\\<>:"|?*]/;
    return !invalidChars.test(appName) && appName.trim().length > 0 && !appName.includes("//");
  }
}
