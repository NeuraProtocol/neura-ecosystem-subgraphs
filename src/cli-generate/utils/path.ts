import * as path from "path";

/**
 * Resolves the target directory for a subgraph inside <root>/subgraphs.
 * Returns null if the resulting path would escape that directory.
 * Note: symlinks are not resolved.
 */
export function resolveSubgraphDir(root: string, appName: string): string | null {
  const subgraphsRoot = path.resolve(root, "subgraphs");
  const subgraphDir = path.resolve(subgraphsRoot, appName);

  if (!subgraphDir.startsWith(subgraphsRoot + path.sep)) {
    return null;
  }

  return subgraphDir;
}
