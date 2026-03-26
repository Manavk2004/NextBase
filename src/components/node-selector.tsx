"use client"

import { createId } from "@paralleldrive/cuid2"
import { useReactFlow } from "@xyflow/react"
import { GlobeIcon, MousePointerIcon } from "lucide-react"
import { useCallback } from "react"
import { toast } from "sonner"

import { NodeType } from "@/generated/prisma/enums"
import { Separator } from "./ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import Image from "next/image"

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Runs the flow on clicking a button. Good for getting started quickly",
        icon: MousePointerIcon
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form Trigger",
        description: "Triggers the workflow when a Google Form is submitted",
        icon: "/logos/google.svg"
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe Trigger",
        description: "Triggers the workflow when a Stripe event occurs",
        icon: "/logos/stripe.svg"
    }
]

const executionNodes: NodeTypeOption[]= [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Makes an HTTP request",
        icon: GlobeIcon
    },
    {
        type: NodeType.GEMINI_PROMPT,
        label: "Gemini Prompt",
        description: "Generate text using Google Gemini",
        icon: "/logos/gemini-ai.svg"
    },
    {
        type: NodeType.OPENAI_PROMPT,
        label: "OpenAI Prompt",
        description: "Generate text using OpenAI GPT models",
        icon: "/logos/openai.svg"
    },
    {
        type: NodeType.ANTHROPIC_PROMPT,
        label: "Claude Prompt",
        description: "Generate text using Anthropic Claude",
        icon: "/logos/anthropic.svg"
    },
    {
        type: NodeType.DISCORD_MESSAGE,
        label: "Discord Message",
        description: "Send a message to a Discord channel",
        icon: "/logos/discord.svg"
    },
    {
        type: NodeType.SLACK_MESSAGE,
        label: "Slack Message",
        description: "Send a message to a Slack channel",
        icon: "/logos/slack.svg"
    }
]

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode
}

export function NodeSelector({
    open,
    onOpenChange,
    children
}: NodeSelectorProps){

    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow()

    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {

        if(selection.type === NodeType.MANUAL_TRIGGER){
            const nodes = getNodes()
            const hasManualTrigger = nodes.some(
                (node) => node.type === NodeType.MANUAL_TRIGGER
            )

            if(Boolean(hasManualTrigger)){
                toast.error("Only one manual trigger is allowed per workflow")
                return
            }
        }

        if(selection.type === NodeType.GOOGLE_FORM_TRIGGER){
            const nodes = getNodes()
            const hasGoogleFormTrigger = nodes.some(
                (node) => node.type === NodeType.GOOGLE_FORM_TRIGGER
            )

            if(Boolean(hasGoogleFormTrigger)){
                toast.error("Only one Google Form trigger is allowed per workflow")
                return
            }
        }

        if(selection.type === NodeType.STRIPE_TRIGGER){
            const nodes = getNodes()
            const hasStripeTrigger = nodes.some(
                (node) => node.type === NodeType.STRIPE_TRIGGER
            )

            if(Boolean(hasStripeTrigger)){
                toast.error("Only one Stripe trigger is allowed per workflow")
                return
            }
        }

        setNodes((nodes) =>  {
            const hasInitialTrigger = nodes.some(
                (node) => node.type === NodeType.INITIAL
            );

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 0.5) * 200,
                y: centerY + (Math.random() - 0.5) * 200,
            })

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type
            }


            if(hasInitialTrigger){
                return [newNode]
            }

            return [...nodes, newNode]

            
        })
        
        onOpenChange(false)
    }, [
        setNodes,
        getNodes,
        onOpenChange,
        screenToFlowPosition
    ])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        What triggers this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger is a step that starts your workflow
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon;

                        return (
                            <div 
                            key={nodeType.type} 
                            className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            onClick={() => handleNodeSelect(nodeType)}
                            >
                                 <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <Image
                                            src={Icon}
                                            alt={nodeType.label}
                                            width={20}
                                            height={20}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ): 
                                        <Icon className="size-5" />
                                    }
                                    <div>
                                        <span className="flex flex-col items-start text-left">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <Separator />
                <div>
                    {executionNodes.map((nodeType) => {
                        const Icon = nodeType.icon;

                        return (
                            <div 
                            key={nodeType.type} 
                            className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            onClick={() => handleNodeSelect(nodeType)}
                            >
                                 <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <Image
                                            src={Icon}
                                            alt={nodeType.label}
                                            width={20}
                                            height={20}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ): 
                                        <Icon className="size-5" />
                                    }
                                    <div>
                                        <span className="flex flex-col items-start text-left">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}