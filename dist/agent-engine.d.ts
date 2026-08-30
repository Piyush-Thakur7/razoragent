/**
 * RazorAgent Autonomous AI Buyer Agent Engine
 * Multi-step agentic execution loop that calls MCP tools, validates policies, and generates live execution steps.
 * 100% Free-text Semantic NLP Parser without hardcoded query branching.
 */
import { AgentSimulationStep, CartQuote, PolicyDecision, RazorpayOrderResponse } from './types';
export interface SimulationResult {
    prompt: string;
    agentSessionId: string;
    success: boolean;
    steps: AgentSimulationStep[];
    finalCart?: CartQuote;
    policyDecision?: PolicyDecision;
    order?: RazorpayOrderResponse;
    totalDurationMs: number;
}
export declare class AgentSimulator {
    /**
     * Executes a full autonomous agentic shopping and settlement flow based on user intent.
     */
    simulatePurchase(prompt: string, options?: {
        simulateRaceCondition?: boolean;
        customIdempotencyKey?: string;
    }): Promise<SimulationResult>;
}
export declare const globalAgentSimulator: AgentSimulator;
//# sourceMappingURL=agent-engine.d.ts.map