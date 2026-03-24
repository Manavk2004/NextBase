import { ConnectionModel as Connection, NodeModel as Node } from "@/generated/prisma/models";
import toposort from "toposort";

export const getReachableNodeIds = (
  triggerNodeId: string,
  connections: Connection[],
): Set<string> => {
  const adjacency = new Map<string, string[]>();
  for (const conn of connections) {
    const neighbors = adjacency.get(conn.fromNodeId) || [];
    neighbors.push(conn.toNodeId);
    adjacency.set(conn.fromNodeId, neighbors);
  }

  const visited = new Set<string>();
  const queue = [triggerNodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of adjacency.get(current) || []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return visited;
};

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // If no connections, return nodes as-is (they're all independent)
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  // Track which nodes appear in connections
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  // Perform topological sort on connected nodes only
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  // Append orphan nodes (not in any connection) at the end
  const orphanNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

  // Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const sortedNodes = sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
  return [...sortedNodes, ...orphanNodes];
};
