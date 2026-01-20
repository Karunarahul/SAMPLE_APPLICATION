/**
 * Simulated Knowledge Base for Health QA.
 * In a real app, this would query a backend LLM or medical API.
 */

const HEALTH_FACTS = [
    // 🩺 GENERAL HEALTH
    {
        keywords: ['what is health'],
        answer: "Health is a state of complete physical, mental, and social well-being, not just the absence of disease."
    },
    {
        keywords: ['why is health monitoring important', 'monitor health'],
        answer: "Regular health monitoring helps detect problems early and maintain a healthy lifestyle."
    },
    {
        keywords: ['how often should i check my health', 'check health'],
        answer: "Basic vitals can be checked daily, while full health checkups are recommended every 6 to 12 months."
    },

    // ❤️ HEART RATE
    {
        keywords: ['what is heart rate'],
        answer: "Heart rate is the number of times your heart beats per minute."
    },
    {
        keywords: ['what is normal heart rate', 'normal hr'],
        answer: "A normal resting heart rate for adults is between 60 and 100 beats per minute."
    },
    {
        keywords: ['what causes high heart rate', 'high heart rate'],
        answer: "Exercise, stress, fever, dehydration, anxiety, or medical conditions can increase heart rate."
    },

    // 🫁 OXYGEN LEVEL (SpO₂)
    {
        keywords: ['what is spo2', 'oxygen'],
        answer: "SpO₂ measures the oxygen saturation level in your blood."
    },
    {
        keywords: ['what is normal oxygen level', 'normal spo2'],
        answer: "Normal oxygen saturation levels range from 95 to 100 percent."
    },
    {
        keywords: ['what does low spo2 mean', 'low spo2'],
        answer: "Low oxygen levels may indicate breathing or lung-related issues."
    },

    // 🌡️ BODY TEMPERATURE
    {
        keywords: ['what is normal body temperature', 'normal temp'],
        answer: "Normal body temperature ranges from 36.5 to 37.5 degrees Celsius."
    },
    {
        keywords: ['what is fever'],
        answer: "Fever occurs when body temperature rises above 38 degrees Celsius."
    },
    {
        keywords: ['what should i do if i have fever', 'have fever'],
        answer: "Rest, stay hydrated, monitor temperature, and consult a doctor if fever continues."
    },

    // 🧠 BLOOD PRESSURE
    {
        keywords: ['what is blood pressure', 'bp'],
        answer: "Blood pressure measures the force of blood pushing against artery walls."
    },
    {
        keywords: ['what is normal blood pressure', 'normal bp'],
        answer: "Normal blood pressure is around 120 over 80 millimeters of mercury."
    },
    {
        keywords: ['what causes high blood pressure', 'high bp'],
        answer: "Stress, excess salt intake, obesity, lack of exercise, and genetics can raise blood pressure."
    },

    // 🩸 BLOOD SUGAR
    {
        keywords: ['what is blood sugar', 'glucose'],
        answer: "Blood sugar refers to the level of glucose present in the blood."
    },
    {
        keywords: ['what is normal blood sugar', 'normal glucose'],
        answer: "Normal fasting blood sugar levels are between 70 and 99 milligrams per deciliter."
    },
    {
        keywords: ['what are symptoms of high blood sugar', 'high sugar'],
        answer: "Increased thirst, frequent urination, fatigue, and blurred vision."
    },

    // 🫀 ECG
    {
        keywords: ['what is ecg', 'ekg'],
        answer: "ECG records the electrical activity of the heart to monitor heart rhythm."
    },
    {
        keywords: ['why is ecg important'],
        answer: "ECG helps detect heart rhythm abnormalities and cardiac conditions."
    },

    // 🏃 FITNESS & ACTIVITY
    {
        keywords: ['why is exercise important'],
        answer: "Exercise improves heart health, strength, mental well-being, and overall fitness."
    },
    {
        keywords: ['how much exercise should i do'],
        answer: "Adults should aim for at least 30 minutes of moderate exercise daily."
    },

    // 😴 SLEEP
    {
        keywords: ['why is sleep important'],
        answer: "Sleep helps the body recover, strengthens immunity, and improves focus."
    },
    {
        keywords: ['how many hours should i sleep'],
        answer: "Adults should sleep between 7 and 9 hours per night."
    },

    // 🧘 MENTAL HEALTH
    {
        keywords: ['what is mental health'],
        answer: "Mental health refers to emotional, psychological, and social well-being."
    },
    {
        keywords: ['how can i reduce stress'],
        answer: "Exercise, meditation, proper sleep, and relaxation techniques can reduce stress."
    },

    // 🥗 NUTRITION
    {
        keywords: ['what is balanced diet'],
        answer: "A balanced diet includes carbohydrates, proteins, fats, vitamins, minerals, and water."
    },
    {
        keywords: ['how much water should i drink'],
        answer: "Most adults should drink around 2 to 3 liters of water daily."
    },

    // 🚨 EMERGENCY
    {
        keywords: ['what should i do in emergency', 'emergency'],
        answer: "In a medical emergency, seek immediate professional medical help."
    },

    // 🤖 ATLAS IDENTITY
    {
        keywords: ['what can you do atlas', 'what do you do'],
        answer: "I can answer health-related questions and help navigate this application."
    },
    {
        keywords: ['are you a doctor'],
        answer: "No. I am a virtual assistant that provides educational health information only."
    },
    {
        keywords: ['do you work offline'],
        answer: "Yes. I work completely offline without internet access."
    }
];

export const getHealthAnswer = (text) => {
    const normalize = text.toLowerCase();

    // Simple Keyword Matching
    for (const fact of HEALTH_FACTS) {
        if (fact.keywords.some(keyword => normalize.includes(keyword))) {
            return fact.answer;
        }
    }

    return null; // No answer found
};

/**
 * Heuristic Analysis of specific values found in text.
 * Example: "Is 110 heart rate bad?"
 */
export const analyzeSpecificValue = (text) => {
    const normalize = text.toLowerCase();

    // Heart Rate check
    if (normalize.includes('heart rate') || normalize.includes('bpm') || normalize.includes('pulse')) {
        const match = normalize.match(/\d+/);
        if (match) {
            const val = parseInt(match[0]);
            if (val > 100) return `A heart rate of ${val} is considered high (tachycardia) if you are resting. Consult a doctor if strictly resting.`;
            if (val < 60) return `A heart rate of ${val} is low (bradycardia), which is common for athletes but consult a doctor if you feel dizzy.`;
            return `A heart rate of ${val} is within the normal resting range.`;
        }
    }

    // Temperature check (Fahrenheit)
    if (normalize.includes('temp') || normalize.includes('fever')) {
        const match = normalize.match(/\d+(\.\d+)?/);
        if (match) {
            const val = parseFloat(match[0]);
            // If user enters < 50, assume Celsius and warn, or just process as F? 
            // Context implies F now.
            if (val > 103) return `A temperature of ${val}°F is a high fever. Seek medical attention.`;
            if (val > 100.4) return `A temperature of ${val}°F indicates a fever. Monitor closely.`;
            if (val < 95) return `A temperature of ${val}°F is very low (hypothermia). Warm up immediately.`;
            return `A temperature of ${val}°F is normal.`;
        }
    }

    // SpO2 check
    if (normalize.includes('spo2') || normalize.includes('oxygen')) {
        const match = normalize.match(/\d+/);
        if (match) {
            const val = parseInt(match[0]);
            if (val < 90) return `An SpO2 level of ${val}% is concerningly low. Please seek medical attention immediately.`;
            if (val < 95) return `An SpO2 level of ${val}% is slightly below normal ranges. Monitor closely.`;
            return `${val}% is a healthy blood oxygen level.`;
        }
    }

    return null;
}
