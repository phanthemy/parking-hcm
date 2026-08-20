/**
 * MAPGO SEO ENGINE - ENTITY GRAPH BUILDER
 * Generates unified Schema.org @graph JSON-LD structure
 */

export interface SchemaNode {
  '@type': string;
  '@id'?: string;
  [key: string]: unknown;
}

export function buildEntityGraph(nodes: (SchemaNode | null | undefined | false)[]): {
  '@context': string;
  '@graph': SchemaNode[];
} {
  const validNodes = nodes.filter((n): n is SchemaNode => Boolean(n));
  return {
    '@context': 'https://schema.org',
    '@graph': validNodes,
  };
}
