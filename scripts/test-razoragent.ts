import { globalTestSuite } from '../lib/razoragent/test-suite.js';

async function main() {
  console.log('Running RazorAgent Automated Test Suite...\n');
  const res = await globalTestSuite.runAllTests();
  console.log(`Summary: ${res.passedCount}/${res.totalCount} passed\n`);
  for (const t of res.results) {
    console.log(`[${t.status}] ${t.testId}: ${t.name} (${t.durationMs}ms)`);
    console.log(`   Expected: ${t.expected}`);
    console.log(`   Actual:   ${t.actual}\n`);
  }
}

main().catch(console.error);
