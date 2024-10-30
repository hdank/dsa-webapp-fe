export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Return 0 if either vector is zero
    }
  
    return dotProduct / (magnitudeA * magnitudeB);
  }