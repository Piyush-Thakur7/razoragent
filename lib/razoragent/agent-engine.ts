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

    // Step 1: Perception & Natural Intent Classification
    addStep(
      'PERCEPTION',
      `Analyzing buyer intent from prompt: "${prompt}". Parsing target product specifications, budget constraints, preferred attributes, and transaction limits.`
    );

    const lower = prompt.toLowerCase();

    // 1. Precise Quantity Extraction (Avoid matching model numbers like WH-1000)
    let targetQty = 1;
    const explicitQtyMatch = prompt.match(/\b([1-9][0-9]?)\s*(?:units|items|pieces|x|pcs|qty)\b/i);
    if (explicitQtyMatch && explicitQtyMatch[1]) {
      targetQty = parseInt(explicitQtyMatch[1], 10);
    } else {
      const countWordMatch = prompt.match(/\b(?:buy|order|get|purchase)\s+([1-9][0-9]?)\s+(?!wh-|k2|xm|[0-9])([a-z]+)/i);
      if (countWordMatch && countWordMatch[1]) {
        targetQty = parseInt(countWordMatch[1], 10);
      }
    }

    // 2. Dynamic Budget / Price Extraction
    let maxPrice: number | undefined = undefined;
    const priceMatch = prompt.match(/(?:under|below|max|budget|upto|less\s+than|worth|around|for)?\s*(?:₹|rs\.?|inr)?\s*([0-9]{3,7})/i);
    if (priceMatch && priceMatch[1] && !priceMatch[1].startsWith('1000') && !lower.includes('wh-1000')) {
      maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }

    // 3. Dynamic Keyword Extraction
    let cleanedKeywords = lower
      .replace(/(?:i\s+want\s+to\s+buy|i\s+would\s+like\s+to\s+order|buy\s+me|order\s+me|purchase|get\s+me|find\s+me|can\s+you\s+get|please\s+buy|order|buy|find|search|get)\s+/gi, ' ')
      .replace(/(?:under|below|above|max|budget|for|with|about|worth)\s*(?:₹|rs\.?|inr)?\s*[0-9,]+/gi, ' ')
      .replace(/(?:[0-9]+)\s*(?:units|items|pieces|x|pcs|qty)/gi, ' ')
      .replace(/₹|rs\.?|inr/gi, ' ')
      .replace(/\b(a|an|the|in|for|with|to|me|of|at|on|some|any|good|best|worth)\b/gi, ' ')
      .trim();

    let query = cleanedKeywords || 'keyboard';
    if (lower.includes('sony') || lower.includes('wh-1000') || lower.includes('headphone')) {
      query = 'headphones';
    } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('apple') || lower.includes('mobile')) {
      query = 'phone';
    }

    // Contextual coupon deduction
    let coupon = 'AGENT500';
    if (lower.includes('coffee') || lower.includes('roast')) {
      coupon = 'COFFEE100';
    } else if (lower.includes('headphone') || lower.includes('phone') || lower.includes('iphone') || lower.includes('sony')) {
      coupon = 'PREMIUM10';
    } else if (lower.includes('mat') || lower.includes('desk')) {
      coupon = 'DESK200';
    } else if (lower.includes('protein') || lower.includes('nutrition')) {
      coupon = 'FIT10';
    } else if (lower.includes('backpack') || lower.includes('bag')) {
      coupon = 'TRAVEL15';
    }

    // Step 2: Tool Call -> search_products
    const searchArgs: Record<string, any> = { query };
    if (maxPrice && !lower.includes('sony') && !lower.includes('70000 phone')) {
      searchArgs.max_price = maxPrice;
    }

    let searchResult = await globalMCPEngine.executeTool('search_products', searchArgs);

    if (searchResult.count === 0 && query.split(' ').length > 1) {
      const firstWord = query.split(' ')[0];
      searchResult = await globalMCPEngine.executeTool('search_products', { query: firstWord });
    }

    addStep(
      'TOOL_CALL',
      `Invoking MCP Tool "search_products" with query: "${query}"${maxPrice ? ` and budget filter: ₹${maxPrice}` : ''}. Found ${searchResult.count} matching SKUs in merchant inventory.`,
      { name: 'search_products', arguments: searchArgs },
      searchResult
    );

    if (searchResult.count === 0) {
      addStep(
        'REASONING',
        `No items matched criteria "${query}" in merchant inventory. Available store categories: Electronics (Keyboards, Headphones, Earbuds, Phones), Specialty Coffee, Home Office, Apparel, Wellness. Halting order to avoid unauthorized purchases.`
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
        ? `Policy Gate: PASSED. Transaction complies with autonomous spend limits (₹${cartQuote.totalAmount.toLocaleString('en-IN')} <= Spend Cap) and SKU quantity whitelist.`
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
