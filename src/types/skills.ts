export type SkillAnalysis = Record<string, number>;

export interface SkillConfig {
  name: string;
  key: keyof SkillAnalysis;
  color: string;
  gradient: string;
}