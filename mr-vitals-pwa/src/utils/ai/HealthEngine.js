export function analyzeVitals(vitals) {
    const { hr, spo2, temp_f } = vitals;
    let score = 100;
    let risk = 'Low';
    let insight = 'All systems normal. Maintain current activity levels.';
    let factors = [];

    // Simple rule-based logic
    if (hr > 100) {
        score -= 20;
        factors.push('Elevated Heart Rate');
    } else if (hr < 50) {
        score -= 10;
        factors.push('Low Heart Rate');
    }

    if (spo2 < 95) {
        score -= 30;
        factors.push('Low Oxygen Saturation');
    }

    if (temp_f > 99.5) {
        score -= 15;
        factors.push('Elevated Temperature');
    }

    // Determine Risk & Insight
    if (score < 60) {
        risk = 'Critical';
        insight = 'Immediate attention recommended. Multiple vital signs are outside normal ranges.';
    } else if (score < 85) {
        risk = 'Moderate';
        insight = 'Slight irregularities detected. Consider resting and monitoring vitals.';
    }

    return {
        healthScore: Math.max(0, score),
        riskLevel: risk,
        insight: insight,
        contributingFactors: factors,
        timestamp: new Date().toLocaleTimeString()
    };
}
