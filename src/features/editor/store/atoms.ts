import type { ReactFlowInstance } from "@xyflow/react"
import { atom } from "jotai"
import type { NodeStatus } from "@/components/react-flow/node-status-indicator"

export const editoratom = atom<ReactFlowInstance | null>(null)

export const nodeStatusMapAtom = atom<Record<string, NodeStatus>>({})
