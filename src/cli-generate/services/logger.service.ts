import { Logger } from "../types";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

export class LoggerService implements Logger {
  info(msg: string): void {
    console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
  }

  success(msg: string): void {
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
  }

  warning(msg: string): void {
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
  }

  error(msg: string): void {
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
  }

  title(msg: string): void {
    console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`);
  }
}
