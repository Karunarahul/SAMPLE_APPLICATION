export function analyzeVitals(vitals) {
    const { hr, spo2, temp_f } = vitals;
    let score = 100;
    let risk = 'Low';
    let statusOverview = 'All vitals are within standard ranges. Maintaining current healthy habits is advised.';
    let factors = [];
    let detailedAnalysis = [];
    let recommendations = [];

    // --- Heart Rate Analysis ---
    if (hr > 100) {
        score -= (hr > 120 ? 30 : 15);
        factors.push('Elevated HR (Tachycardia)');
        detailedAnalysis.push(`Heart rate is elevated at ${hr} BPM (Normal resting: 60-100 BPM). This can be caused by stress, exercise, or fever.`);
        recommendations.push('Rest in a seated position and practice deep, slow breathing.');
        recommendations.push('Ensure you are adequately hydrated.');
        if (hr > 120) recommendations.push('If high heart rate persists while resting, seek medical advice.');
    } else if (hr < 60) {
        if (hr < 50) score -= 20;
        else score -= 5;
        factors.push(hr < 50 ? 'Low HR (Bradycardia)' : 'Resting HR');
        detailedAnalysis.push(`Heart rate is on the lower side at ${hr} BPM. Normal for athletes, but can indicate issues if accompanied by dizziness.`);
        if (hr < 50) recommendations.push('If you are not an athlete and feel dizzy or fatigued, consult a doctor.');
    } else {
        detailedAnalysis.push(`Heart rate of ${hr} BPM is well within the healthy resting range.`);
    }

    // --- Oxygen Saturation Analysis ---
    if (spo2 < 95) {
        score -= (spo2 < 90 ? 40 : 20);
        factors.push('Low SpO2 (Hypoxemia)');
        detailedAnalysis.push(`Oxygen saturation is below optimal levels at ${spo2}% (Normal: >95%). This means less oxygen is reaching your tissues.`);
        recommendations.push('Move to a well-ventilated area and take slow, deep breaths.');
        if (spo2 < 92) recommendations.push('Consider seeking medical evaluation if this metric persists below 92%.');
    } else {
        detailedAnalysis.push(`Oxygen saturation at ${spo2}% indicates excellent respiratory function and blood oxygenation.`);
    }

    // --- Temperature Analysis ---
    if (temp_f > 99.5) {
        score -= (temp_f > 100.4 ? 25 : 10);
        factors.push(temp_f > 100.4 ? 'Fever' : 'Elevated Temp');
        detailedAnalysis.push(`Body temperature is elevated at ${temp_f}°F (Normal: 97.8°F - 99.1°F).`);
        recommendations.push('Stay hydrated with water or electrolyte fluids.');
        if (temp_f > 100.4) recommendations.push('Consider fever-reducing medication if uncomfortable, and get plenty of rest.');
    } else if (temp_f < 97.0) {
        score -= 10;
        factors.push('Low Temp');
        detailedAnalysis.push(`Body temperature is slightly low at ${temp_f}°F.`);
        recommendations.push('Use warm blankets or consume warm, non-caffeinated liquids.');
    } else {
        detailedAnalysis.push(`Body temperature of ${temp_f}°F is in the normal, healthy range.`);
    }

    // --- Determine Overall Risk & Insight ---
    if (score < 60) {
        risk = 'Critical';
        statusOverview = 'Immediate attention recommended. Multiple vital signs are significantly outside normal resting ranges.';
        if (!recommendations.includes('Consult a healthcare professional immediately.')) {
            recommendations.unshift('Consult a healthcare professional immediately.');
        }
    } else if (score < 80) {
        risk = 'Moderate';
        statusOverview = 'Irregularities detected in your vitals. Monitoring and rest are highly advised.';
        recommendations.unshift('Continue to monitor vitals every 15-30 minutes.');
    } else if (score < 95) {
        risk = 'Slight';
        statusOverview = 'Minor deviations from optimal vitals. Likely temporary, but keep an eye on how you feel.';
    }

    // If completely healthy, provide general wellness tips
    if (recommendations.length === 0) {
        recommendations.push('Maintain a regular cardiovascular exercise routine.');
        recommendations.push('Ensure 7-9 hours of restful sleep daily for optimal recovery.');
        recommendations.push('Stay hydrated throughout the day.');
    }

    return {
        healthScore: Math.max(0, Math.round(score)),
        riskLevel: risk,
        insight: statusOverview,
        detailedAnalysis: detailedAnalysis,
        recommendations: recommendations,
        contributingFactors: factors,
        timestamp: new Date().toLocaleTimeString()
    };
}
