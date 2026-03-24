"use client";

import { useCallback, useEffect, useRef } from "react";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useSetAtom, useAtomValue } from "jotai";
import { nodeStatusMapAtom } from "@/features/editor/store/atoms";
import { getNodeStatusToken } from "@/features/executions/actions/get-node-status-token";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

export function useNodeStatusSubscription(workflowId: string) {
  const setNodeStatusMap = useSetAtom(nodeStatusMapAtom);
  const processedCount = useRef(0);

  useEffect(() => {
    processedCount.current = 0;
  }, [workflowId]);

  const refreshToken = useCallback(
    () => getNodeStatusToken(workflowId),
    [workflowId]
  );

  const { data } = useInngestSubscription({
    refreshToken,
  });

  useEffect(() => {
    if (data.length <= processedCount.current) return;

    const newMessages = data.slice(processedCount.current);
    processedCount.current = data.length;

    for (const message of newMessages) {
      const payload = message.data as { nodeId: string; status: NodeStatus };
      if (payload?.nodeId && payload?.status) {
        setNodeStatusMap((prev) => ({
          ...prev,
          [payload.nodeId]: payload.status,
        }));
      }
    }
  }, [data, setNodeStatusMap]);
}

export function useNodeStatus(nodeId: string): NodeStatus | undefined {
  const statusMap = useAtomValue(nodeStatusMapAtom);
  return statusMap[nodeId];
}
