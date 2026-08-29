/**
 * RazorAgent Autonomous AI Buyer Agent Engine
 * Multi-step agentic execution loop that calls MCP tools, validates policies, and generates live execution steps.
 */

import { AgentSimulationStep, CartQuote, PolicyDecision, RazorpayOrderResponse } from './types';
import { globalMCPEngine } from './mcp-engine';

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

export class AgentSimulator {
  /**
   * Executes a full autonomous agentic shopping and settlement flow based on user intent.
   */
  public async simulatePurchase(prompt: string, options: { simulateRaceCondition?: boolean; customIdempotencyKey?: string } = {}): Promise<SimulationResult> {
    const startTime = Date.now();
    const steps: AgentSimulationStep[] = [];
    const sessionId = `agent_sess_${Math.random().toString(36).substring(2, 9)}`;
    const idempotencyKey = options.customIdempotencyKey || `idem_${sessionId}_cart`;

    const addStep = (
      phase: AgentSimulationStep['phase'],
      thought: string,
      toolCall?: AgentSimulationStep['toolCall'],
      toolResult?: Record<string, unknown>,
      policyResult?: PolicyDecision,
      orderResult?: RazorpayOrderResponse
    ) => {
      steps.push({
        stepIndex: steps.length + 1,
        phase,
        thought,
        toolCall,
        toolResult,
        policyResult,
        orderResult,
        timestamp: new Date().toISOString(),
      });
    };

    // Step 1: Perception & Intent Classification
    addStep(
      'PERCEPTION',
      `Analyzing buyer intent from prompt: "${prompt}". Parsing target product specifications, budget constraints, preferred attributes, and transaction limits.`
    );

    // Identify target query keywords
    const lower = prompt.toLowerCase();
    let query = 'keyboard';
    let maxPrice: number | undefined = undefined;
    let coupon: string | undefined = 'AGENT500';
    let targetQty = 1;

    if (lower.includes('headphone') || lower.includes('anc') || lower.includes('sony')) {
      query = 'headphones';
      coupon = 'PREMIUM10';
    } else if (lower.includes('earbud') || lower.includes('nothing')) {
      query = 'earbuds';
      coupon = 'AGENT500';
    } else if (lower.includes('coffee') || lower.includes('roast') || lower.includes('tokai')) {
      query = 'coffee';
      coupon = 'COFFEE100';
    } else if (lower.includes('mouse') || lower.includes('logitech') || lower.includes('master')) {
      query = 'mouse';
      coupon = 'AGENT500';
    } else if (lower.includes('bag') || lower.includes('backpack') || lower.includes('aer')) {
      query = 'backpack';
      coupon = 'TRAVEL15';
    } else if (lower.includes('mat') || lower.includes('desk')) {
      query = 'desk mat';
      coupon = 'DESK200';
    } else if (lower.includes('protein') || lower.includes('whey') || lower.includes('nutrition')) {
      query = 'protein';
      coupon = 'FIT10';
    }

    // Extract explicit price bounds if mentioned
    const priceMatch = prompt.match(/(?:under|below|max|budget)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
    if (priceMatch && priceMatch[1]) {
      maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }

    // Extract quantity if specified (e.g. "buy 5 units")
    const qtyMatch = prompt.match(/(?:buy|order|get)\s*([0-9]+)\s*(?:units|items|pieces|x)/i);
    if (qtyMatch && qtyMatch[1]) {
      targetQty = parseInt(qtyMatch[1], 10);
    }

    // Step 2: Tool Call -> search_products
    const searchArgs = { query, max_price: maxPrice, min_rating: 4.5 };
    const searchResult = await globalMCPEngine.executeTool('search_products', searchArgs);

    addStep(
      'TOOL_CALL',
      `Invoking MCP Tool "search_products" with query: "${query}" and rating filter: 4.5+. Found ${searchResult.count} matching SKUs in merchant inventory.`,
      { name: 'search_products', arguments: searchArgs },
      searchResult
    );

    if (searchResult.count === 0) {
      addStep(
        'REASONING',
        `No items matched criteria "${query}" within the specified budget. Halting workflow to avoid unauthorized purchases.`
      );
      return {
        prompt,
        agentSessionId: sessionId,
        success: false,
        steps,
        totalDurationMs: Date.now() - startTime,
      };
    }

    const selectedProduct = searchResult.products[0];

    // Step 3: Tool Call -> get_product_details
    const detailsArgs = { product_id: selectedProduct.id };
    const detailsResult = await globalMCPEngine.executeTool('get_product_details', detailsArgs);

    addStep(
      'TOOL_CALL',
      `Selected optimal candidate "${selectedProduct.name}" (Rating: ${selectedProduct.rating}★). Retrieving full technical specs and real-time inventory count.`,
      { name: 'get_product_details', arguments: detailsArgs },
      detailsResult
    );

    // Step 4: Tool Call -> calculate_cart_quote
    const quoteArgs = {
      items: [{ product_id: selectedProduct.id, quantity: targetQty }],
      coupon_code: coupon,
    };
    const cartQuote: CartQuote = await globalMCPEngine.executeTool('calculate_cart_quote', quoteArgs);

    addStep(
      'TOOL_CALL',
      `Generating authenticated Cart Quote with 18% GST tax calculation and applying promotion coupon "${coupon}". Payable amount: ₹${cartQuote.totalAmount.toLocaleString('en-IN')}.`,
      { name: 'calculate_cart_quote', arguments: quoteArgs },
      cartQuote as unknown as Record<string, unknown>
    );

    // Step 5: Policy Gate Evaluation
    const policyResult: PolicyDecision = await globalMCPEngine.executeTool('evaluate_spend_policy', {
      cart_id: cartQuote.cartId,
    });

    addStep(
      'POLICY_GATE',
      policyResult.allowed
        ? `Policy Gate: PASSED. Transaction complies with autonomous spend limits (₹${cartQuote.totalAmount} <= Cap) and SKU quantity whitelist.`
        : `Policy Gate: INTERCEPTED & BLOCKED. Reason: ${policyResult.reasonCode} - ${policyResult.message}`,
      { name: 'evaluate_spend_policy', arguments: { cart_id: cartQuote.cartId } },
      undefined,
      policyResult
    );

    if (!policyResult.allowed) {
      return {
        prompt,
        agentSessionId: sessionId,
        success: false,
        steps,
        finalCart: cartQuote,
        policyDecision: policyResult,
        totalDurationMs: Date.now() - startTime,
      };
    }

    // Step 6: Settlement & Order Creation via Razorpay
    const orderArgs = {
      cart_id: cartQuote.cartId,
      idempotency_key: idempotencyKey,
      buyer_email: 'buyer.agent@deepmind-showcase.in',
    };

    const orderExecution = await globalMCPEngine.executeTool('create_guarded_order', orderArgs);

    addStep(
      'SETTLEMENT',
      orderExecution.isCached
        ? `Idempotency Interceptor Triggered: Re-used active Razorpay Order ${orderExecution.order?.id} without creating duplicate charge.`
        : `Razorpay Order Created: Generated Order ID ${orderExecution.order?.id} with dynamic payment link and instant UPI intent URI.`,
      { name: 'create_guarded_order', arguments: orderArgs },
      orderExecution as unknown as Record<string, unknown>,
      orderExecution.decision,
      orderExecution.order
    );

    return {
      prompt,
      agentSessionId: sessionId,
      success: orderExecution.success,
      steps,
      finalCart: cartQuote,
      policyDecision: orderExecution.decision,
      order: orderExecution.order,
      totalDurationMs: Date.now() - startTime,
    };
  }
}

export const globalAgentSimulator = new AgentSimulator();
