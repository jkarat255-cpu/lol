// Gemini API integration for JobSeeker Pro
class GeminiAPI {
  constructor() {
    this.apiKey = window.CONFIG.GEMINI_API_KEY
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
  }

  // Make API request to Gemini
  async makeRequest(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text
      } else {
        throw new Error("Invalid response format from Gemini API")
      }
    } catch (error) {
      console.error("Gemini API Error:", error)
      throw error
    }
  }

  // Generate practice interview questions
  async generatePracticeQuestions(jobTitle, isTechnical = false) {
    const prompt = `Generate ${window.CONFIG.MAX_QUESTIONS} interview questions for a ${jobTitle} position. 
    ${isTechnical ? "Include technical questions relevant to the role." : "Focus on behavioral and general questions."}
    
    Return the response as a JSON array with this exact format:
    [
      {
        "question": "Tell me about yourself and your background",
        "type": "behavioral",
        "reasoning": "Assesses communication skills and background"
      }
    ]
    
    Question types should be: behavioral, technical, experience, cultural, or role-specific.
    Make sure the JSON is valid and properly formatted.`

    try {
      const response = await this.makeRequest(prompt)

      // Clean the response to extract JSON
      let jsonStr = response.trim()

      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "")
      }

      const questions = JSON.parse(jsonStr)

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array")
      }

      return questions.slice(0, window.CONFIG.MAX_QUESTIONS)
    } catch (error) {
      console.error("Error generating practice questions:", error)

      // Fallback questions
      return this.getFallbackQuestions(jobTitle, isTechnical)
    }
  }

  // Generate mock interview questions based on resume and job description
  async generateMockQuestions(resumeText, jobDescription, isTechnical = false) {
    const prompt = `Based on this resume and job description, generate ${window.CONFIG.MAX_QUESTIONS} targeted interview questions.

    RESUME:
    ${resumeText.substring(0, 2000)}

    JOB DESCRIPTION:
    ${jobDescription.substring(0, 1000)}

    ${isTechnical ? "Include technical questions relevant to the role." : "Focus on behavioral and experience-based questions."}
    
    Return the response as a JSON array with this exact format:
    [
      {
        "question": "I see you worked at Company X. Can you tell me about your role there?",
        "type": "experience",
        "reasoning": "Validates resume experience and assesses communication"
      }
    ]
    
    Question types should be: behavioral, technical, experience, cultural, or role-specific.
    Make sure the JSON is valid and properly formatted.`

    try {
      const response = await this.makeRequest(prompt)

      // Clean the response to extract JSON
      let jsonStr = response.trim()

      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "")
      }

      const questions = JSON.parse(jsonStr)

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array")
      }

      return questions.slice(0, window.CONFIG.MAX_QUESTIONS)
    } catch (error) {
      console.error("Error generating mock questions:", error)

      // Fallback questions
      return this.getFallbackQuestions("General", isTechnical)
    }
  }

  // Generate coding question
  async generateCodingQuestion(role) {
    const prompt = `Generate a coding interview question suitable for a ${role} position.
    
    Return the response as a JSON object with this exact format:
    {
      "title": "Two Sum Problem",
      "description": "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
      "examples": [
        {
          "input": "[2, 7, 11, 15], target = 9",
          "output": "[0, 1]",
          "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
        }
      ],
      "difficulty": "Easy"
    }
    
    Make sure the JSON is valid and properly formatted.`

    try {
      const response = await this.makeRequest(prompt)

      // Clean the response to extract JSON
      let jsonStr = response.trim()

      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "")
      }

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error("Error generating coding question:", error)

      // Fallback coding question
      return {
        title: "Array Sum Problem",
        description: "Write a function that takes an array of numbers and returns their sum.",
        examples: [
          {
            input: "[1, 2, 3, 4, 5]",
            output: "15",
            explanation: "1 + 2 + 3 + 4 + 5 = 15",
          },
        ],
        difficulty: "Easy",
      }
    }
  }

  // Evaluate interview answer
  async evaluateAnswer(question, answer, context = "") {
    const prompt = `Evaluate this interview answer and provide detailed feedback.

    QUESTION: ${question}
    ANSWER: ${answer}
    CONTEXT: ${context}

    Provide feedback in this exact JSON format:
    {
      "relevancy_score": 85,
      "strengths": ["Clear communication", "Relevant experience mentioned"],
      "improvements": ["Could provide more specific examples", "Answer could be more concise"],
      "overall_feedback": "Good answer that demonstrates understanding...",
      "rating": "good"
    }

    Rating should be one of: excellent, good, average, needs_improvement
    Relevancy score should be 0-100.
    Make sure the JSON is valid and properly formatted.`

    try {
      const response = await this.makeRequest(prompt)

      // Clean the response to extract JSON
      let jsonStr = response.trim()

      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "")
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "")
      }

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error("Error evaluating answer:", error)

      // Fallback evaluation
      return {
        relevancy_score: 70,
        strengths: ["Answer provided"],
        improvements: ["Could be more detailed"],
        overall_feedback: "Thank you for your response. Consider providing more specific examples in future answers.",
        rating: "average",
      }
    }
  }

  // Get fallback questions when API fails
  getFallbackQuestions(jobTitle, isTechnical) {
    const behavioralQuestions = [
      {
        question: "Tell me about yourself and your background.",
        type: "behavioral",
        reasoning: "Assesses communication skills and background",
      },
      {
        question: "Why are you interested in this position?",
        type: "behavioral",
        reasoning: "Evaluates motivation and job fit",
      },
      {
        question: "Describe a challenging situation you faced and how you handled it.",
        type: "behavioral",
        reasoning: "Tests problem-solving and resilience",
      },
      {
        question: "What are your greatest strengths?",
        type: "behavioral",
        reasoning: "Self-awareness and confidence assessment",
      },
      {
        question: "Where do you see yourself in 5 years?",
        type: "behavioral",
        reasoning: "Career planning and ambition evaluation",
      },
    ]

    const technicalQuestions = [
      {
        question: "Explain the difference between var, let, and const in JavaScript.",
        type: "technical",
        reasoning: "Tests fundamental programming knowledge",
      },
      {
        question: "How would you optimize a slow-performing application?",
        type: "technical",
        reasoning: "Problem-solving and optimization skills",
      },
      {
        question: "Describe your experience with version control systems.",
        type: "technical",
        reasoning: "Collaboration and development workflow knowledge",
      },
    ]

    if (isTechnical) {
      return [...behavioralQuestions.slice(0, 3), ...technicalQuestions]
    }

    return behavioralQuestions
  }
}

// Make it globally available
window.GeminiAPI = GeminiAPI
console.log("Gemini API class loaded successfully")
