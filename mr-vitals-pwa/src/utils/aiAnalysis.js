/**
 * Simulates AI analysis of vitals data using mock ML and LLM responses.
 */

// Mock ML Model Logic to determine risk
function getMLRiskAssessment(vitals) {
    const { hr, spo2, temp_c } = vitals;
    let score = 100;
    let risk = "Low Risk";
    let factors = [];

    if (hr < 60 || hr > 100) {
        score -= 20;
        factors.push("Abnormal Heart Rate");
    }
    if (spo2 < 95) {
        score -= 30;
        factors.push("Low Oxygen Saturation");
    }
    if (temp_c > 37.5) {
        score -= 15;
        factors.push("Elevated Temperature");
    }

    if (score < 60) risk = "High Risk";
    else if (score < 85) risk = "Moderate Risk";

    return {
        healthScore: score,
        riskLevel: risk,
        contributingFactors: factors
    };
}

// Mock LLM Logic to generate insights
function getLLMInsight(vitals, riskData) {
    const { hr, spo2, temp_c } = vitals;
    const { riskLevel } = riskData;

    let insight = `Based on the provided vitals (HR: ${hr} bpm, SpO2: ${spo2}%, Temp: ${temp_c}°C), the subject is currently assessed at ${riskLevel}. `;

    if (riskLevel === "Low Risk") {
        insight += "All vital signs fall within the normal healthy range. No immediate anomalies detected. Continue routine monitoring.";
    } else if (riskLevel === "Moderate Risk") {
        insight += "There are slight deviations from the baseline. ";
        if (spo2 < 95) insight += "Oxygen saturation is slightly low, suggesting potential respiratory efficiency issues. ";
        if (hr > 100) insight += "Heart rate is elevated, which could indicate stress or exertion. ";
        insight += "Recommended actions: Monitor closely for the next hour and ensure the subject is well-hydrated and resting.";
    } else {
        insight += "CRITICAL ALERT: Significant anomalies detected. ";
        if (spo2 < 90) insight += "Severe hypoxia indicated by low SpO2. This requires immediate medical attention. ";
        if (hr > 120 || hr < 40) insight += "Heart rate is critically abnormal, posing a risk of cardiac event. ";
        if (temp_c > 38.5) insight += "High fever suggests active infection or heat stroke. ";
        insight += "Immediate clinical intervention is strongly advised.";
    }

    return insight;
}

export async function analyzeVitals(vitals) {
    // Simulate network delay for "AI processing"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mlResult = getMLRiskAssessment(vitals);
    const llmResult = getLLMInsight(vitals, mlResult);

    return {
        ...mlResult,
        insight: llmResult,
        timestamp: new Date().toLocaleTimeString()
    };
}
