import type { ReactFlowInstance } from "@xyflow/react"
import { atom } from "jotai"

export const editoratom = atom<ReactFlowInstance | null>(null)
