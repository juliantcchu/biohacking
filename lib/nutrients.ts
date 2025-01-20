export interface NutrientInfo {
  target: number;
  unit: string;
  purpose: string;
  sources: string;
  recommendations: string;
}

export const NUTRIENTS: Record<string, NutrientInfo> = {
    'Omega-3': {
      target: 2,
      unit: 'g',
      purpose: 'Brain function & mood regulation',
      sources: 'Fatty fish (salmon, mackerel, sardines), flaxseeds, chia seeds, walnuts',
      recommendations: 'Eat fatty fish 2-3 times per week or take a fish oil supplement'
    },
    'Choline': {
      target: 500,
      unit: 'mg',
      purpose: 'Focus & memory support',
      sources: 'Eggs, liver, beef, chicken, fish, soybeans, quinoa',
      recommendations: 'Eat 2-3 eggs daily or include organ meats weekly'
    },
    'Magnesium': {
      target: 400,
      unit: 'mg',
      purpose: 'Neurotransmitter function & stress relief',
      sources: 'Dark leafy greens, nuts, seeds, whole grains, dark chocolate',
      recommendations: 'Include magnesium-rich foods daily or supplement with magnesium glycinate if needed'
    },
    'Vitamin D3': {
      target: 4000,
      unit: 'IU',
      purpose: 'Hormonal & bone health, cognitive support',
      sources: 'Sunlight exposure, fatty fish, egg yolks, fortified foods',
      recommendations: 'Get 15-30 minutes of sunlight daily or supplement, especially in winter months'
    },
    'L-Theanine': {
      target: 200,
      unit: 'mg',
      purpose: 'Focus, relaxation, and alpha brain wave enhancement',
      sources: 'Green tea, matcha',
      recommendations: 'Drink 2-3 cups of green tea daily or supplement for relaxation and focus'
    },
    'Curcumin': {
      target: 500,
      unit: 'mg',
      purpose: 'Neuroprotection & anti-inflammatory effects',
      sources: 'Turmeric (with black pepper for better absorption)',
      recommendations: 'Use turmeric in cooking or supplement with a curcumin extract with piperine'
    },
    'Vitamin B Complex': {
      target: 100,
      unit: 'mg',
      purpose: 'Neurotransmitter production, energy metabolism, and myelin health',
      sources: 'Leafy greens, eggs, meat, fortified foods',
      recommendations: 'Include B-rich foods daily or supplement with a high-quality B-complex'
    },
    'Phosphatidylserine': {
      target: 300,
      unit: 'mg',
      purpose: 'Cognitive function & memory',
      sources: 'Soy lecithin, white beans, egg yolks, chicken liver, mackerel',
      recommendations: 'Include soy products and organ meats in diet, or consider supplementation'
    },
    'Iron': {
      target: 18,
      unit: 'mg',
      purpose: 'Oxygen transport & cognitive focus',
      sources: 'Red meat, spinach, legumes, fortified cereals',
      recommendations: 'Consume iron-rich foods with vitamin C for better absorption; supplement if deficient'
    },
    'Zinc': {
      target: 11,
      unit: 'mg',
      purpose: 'Neurogenesis & immune support',
      sources: 'Shellfish, seeds, nuts, meat',
      recommendations: 'Include zinc-rich foods regularly or supplement during periods of stress or illness'
    },
    'Selenium': {
      target: 55,
      unit: 'mcg',
      purpose: 'Antioxidant protection & cognitive health',
      sources: 'Brazil nuts, fish, eggs, whole grains',
      recommendations: 'Eat 1-2 Brazil nuts daily or include selenium-rich foods in meals'
    },
    'Alpha-GPC': {
      target: 500,
      unit: 'mg',
      purpose: 'Acetylcholine production & focus',
      sources: 'Supplements (rare in significant quantities in food)',
      recommendations: 'Supplement daily for enhanced memory and focus, especially in aging adults'
    },
    'Creatine': {
      target: 5,
      unit: 'g',
      purpose: 'Energy production, cognitive function & muscle performance',
      sources: 'Red meat, fish, supplements',
      recommendations: 'Take 5g daily as a supplement, especially for vegetarians/vegans'
    }
  };
  