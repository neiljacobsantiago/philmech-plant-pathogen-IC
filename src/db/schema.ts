export interface PathogenRecord {
  id: string;
  growthRate: string;
  surfaceColor: string;
  reverseColor: string;
  myceliumTexture: string;
}

export interface PathogenScore {
  name: string;
  score: number;
  isTop?: boolean;
}