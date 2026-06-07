import { classifyDecay } from './groqService.js';

// Classifies WHY a previously-cited query lost its citation:
//   statistical | structural | competitive
export async function analyzeDecay(queryText, siteDomain, competitorCited) {
  const { decayType } = await classifyDecay(queryText, siteDomain, competitorCited);
  return decayType;
}
