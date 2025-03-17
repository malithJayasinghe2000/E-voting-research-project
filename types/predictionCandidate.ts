export interface ElectionResult {
    candidateName: string;
    party: string;
    engagement_score: number;
    month: string; // Store as a formatted string
    normalized_sentiment: number;
    percentage: number;
    sentiment_numeric: number;
    color?: string; // Optional candidate-specific color
    imageUrl?: string; // Optional image
  }
  