// Interview practice functionality
class InterviewPractice {
  constructor() {
    this.currentMode = null // 'practice' or 'mock'
    this.questions = []
    this.currentQuestionIndex = 0
    this.answers = []
    this.isRecording = false
    this.videoStream = null
    this.confidenceAnalysis = null
    this.codeEditor = null
    this.monaco = window.monaco // Declare monaco variable
  }

  // Initialize interview practice
  initialize() {
    console.log("Initializing Interview Practice...")
    this.setupEventListeners()
    this.initializeTensorFlow()
  }

  // Setup event listeners
  setupEventListeners() {
    console.log("Setting up event listeners...")

    // Practice interview
    const startPracticeBtn = document.getElementById("startPracticeBtn")
    if (startPracticeBtn) {
      startPracticeBtn.addEventListener("click", () => {
        console.log("Start practice button clicked")
        this.startPracticeInterview()
      })
    }

    const recordAnswerBtn = document.getElementById("recordAnswerBtn")
    if (recordAnswerBtn) {
      recordAnswerBtn.addEventListener("click", () => {
        this.toggleRecording()
      })
    }

    const nextQuestionBtn = document.getElementById("nextQuestionBtn")
    if (nextQuestionBtn) {
      nextQuestionBtn.addEventListener("click", () => {
        this.nextQuestion()
      })
    }

    const finishInterviewBtn = document.getElementById("finishInterviewBtn")
    if (finishInterviewBtn) {
      finishInterviewBtn.addEventListener("click", () => {
        this.finishInterview()
      })
    }

    // Mock interview
    const startMockBtn = document.getElementById("startMockBtn")
    if (startMockBtn) {
      startMockBtn.addEventListener("click", () => {
        this.startMockInterview()
      })
    }

    const recordMockAnswerBtn = document.getElementById("recordMockAnswerBtn")
    if (recordMockAnswerBtn) {
      recordMockAnswerBtn.addEventListener("click", () => {
        this.toggleMockRecording()
      })
    }

    const finishMockBtn = document.getElementById("finishMockBtn")
    if (finishMockBtn) {
      finishMockBtn.addEventListener("click", () => {
        this.finishMockInterview()
      })
    }

    // Coding section
    const submitCodeBtn = document.getElementById("submitCodeBtn")
    if (submitCodeBtn) {
      submitCodeBtn.addEventListener("click", () => {
        this.submitCode()
      })
    }

    const skipCodeBtn = document.getElementById("skipCodeBtn")
    if (skipCodeBtn) {
      skipCodeBtn.addEventListener("click", () => {
        this.skipCoding()
      })
    }

    // New session buttons
    const startNewPractice = document.getElementById("startNewPractice")
    if (startNewPractice) {
      startNewPractice.addEventListener("click", () => {
        this.resetPracticeSession()
      })
    }

    const startNewMock = document.getElementById("startNewMock")
    if (startNewMock) {
      startNewMock.addEventListener("click", () => {
        this.resetMockSession()
      })
    }

    console.log("Event listeners set up successfully")
  }

  // Initialize TensorFlow for confidence analysis
  async initializeTensorFlow() {
    try {
      if (window.tensorflowAnalysis) {
        await window.tensorflowAnalysis.initialize()
      }
    } catch (error) {
      console.error("TensorFlow initialization failed:", error)
    }
  }

  // Start practice interview
  async startPracticeInterview() {
    console.log("Starting practice interview...")

    const jobTopic = document.getElementById("jobTopic")?.value.trim()
    const isTechRole = document.getElementById("isTechRole")?.checked

    if (!jobTopic) {
      this.showNotification("Please enter a job title or topic", "error")
      return
    }

    try {
      this.showLoading("Generating interview questions...")

      this.currentMode = "practice"

      // Use the global geminiAPI instance
      this.questions = await window.geminiAPI.generatePracticeQuestions(jobTopic, isTechRole)
      this.currentQuestionIndex = 0
      this.answers = []

      await this.setupVideoFeed("videoFeed")
      this.showInterviewPhase()
      this.displayCurrentQuestion()

      this.hideLoading()
      this.showNotification("Interview started! Answer each question when ready.", "success")
    } catch (error) {
      console.error("Error starting practice interview:", error)
      this.hideLoading()
      this.showNotification("Failed to start interview. Please try again.", "error")
    }
  }

  // Start mock interview
  async startMockInterview() {
    const resumeFile = document.getElementById("resumeUpload")?.files[0]
    const jobDescription = document.getElementById("jobDescription")?.value.trim()
    const isTechRole = document.getElementById("isMockTechRole")?.checked

    if (!resumeFile || !jobDescription) {
      this.showNotification("Please upload your resume and provide job description", "error")
      return
    }

    if (!window.pdfUtils.validatePDFFile(resumeFile)) {
      return
    }

    try {
      this.showLoading("Analyzing resume and generating questions...")

      const resumeText = await window.pdfUtils.extractTextFromPDF(resumeFile)
      if (!resumeText) {
        this.hideLoading()
        return
      }

      this.currentMode = "mock"
      this.questions = await window.geminiAPI.generateMockQuestions(resumeText, jobDescription, isTechRole)
      this.answers = []

      await this.setupVideoFeed("mockVideoFeed")
      this.showMockInterviewPhase()
      this.displayAllQuestions()

      if (isTechRole) {
        await this.setupCodingSection()
      }

      this.hideLoading()
      this.showNotification("Mock interview ready! Review all questions and start recording your answers.", "success")
    } catch (error) {
      console.error("Error starting mock interview:", error)
      this.hideLoading()
      this.showNotification("Failed to start mock interview. Please try again.", "error")
    }
  }

  // Setup video feed and start confidence analysis
  async setupVideoFeed(videoElementId) {
    try {
      const videoElement = document.getElementById(videoElementId)
      if (!videoElement) {
        console.error("Video element not found:", videoElementId)
        return
      }

      // Request camera permission
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })

      videoElement.srcObject = this.videoStream

      // Start confidence analysis
      const analysisElementId = videoElementId === "videoFeed" ? "confidenceAnalysis" : "mockConfidenceAnalysis"
      this.startConfidenceAnalysis(videoElement, analysisElementId)

      console.log("Video feed setup successfully")
    } catch (error) {
      console.error("Error accessing camera:", error)
      this.showNotification("Camera access denied. Confidence analysis will be limited.", "warning")
    }
  }

  // Start confidence analysis
  startConfidenceAnalysis(videoElement, analysisElementId) {
    const updateAnalysis = (confidenceData) => {
      const prefix = analysisElementId === "confidenceAnalysis" ? "" : "mock"

      const confidenceElement = document.getElementById(`${prefix}ConfidenceScore`)
      const eyeContactElement = document.getElementById(`${prefix}EyeContact`)
      const expressionElement = document.getElementById(`${prefix}FacialExpression`)

      if (confidenceElement) {
        confidenceElement.textContent = `Confidence: ${Math.round(confidenceData.overallConfidence)}%`
      }
      if (eyeContactElement) {
        eyeContactElement.textContent = `Eye Contact: ${Math.round(confidenceData.eyeContact)}%`
      }
      if (expressionElement) {
        expressionElement.textContent = `Expression: ${Math.round(confidenceData.facialExpression)}%`
      }
    }

    // Initialize TensorFlow analysis if available
    if (window.tensorflowAnalysis) {
      window.tensorflowAnalysis.startAnalysis(videoElement, updateAnalysis)
    } else {
      // Fallback to mock analysis
      this.startMockConfidenceAnalysis(updateAnalysis)
    }
  }

  // Add mock confidence analysis as fallback
  startMockConfidenceAnalysis(updateCallback) {
    const mockAnalysis = () => {
      if (!this.isRecording && this.currentMode) {
        const mockData = {
          eyeContact: 60 + Math.random() * 30,
          facialExpression: 65 + Math.random() * 25,
          headMovement: 70 + Math.random() * 20,
          overallConfidence: 0,
        }
        mockData.overallConfidence = (mockData.eyeContact + mockData.facialExpression + mockData.headMovement) / 3

        updateCallback(mockData)

        setTimeout(mockAnalysis, 1000)
      }
    }

    mockAnalysis()
  }

  // Show interview phase
  showInterviewPhase() {
    document.getElementById("setupPhase")?.classList.add("hidden")
    document.getElementById("interviewPhase")?.classList.remove("hidden")
  }

  // Show mock interview phase
  showMockInterviewPhase() {
    document.getElementById("mockSetupPhase")?.classList.add("hidden")
    document.getElementById("mockInterviewPhase")?.classList.remove("hidden")
  }

  // Display current question (practice mode)
  displayCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishInterview()
      return
    }

    const question = this.questions[this.currentQuestionIndex]
    const questionElement = document.getElementById("currentQuestion")

    if (questionElement && question) {
      questionElement.innerHTML = `
        <div class="mb-2">
          <span class="text-sm text-gray-500">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</span>
          <span class="ml-2 px-2 py-1 text-xs rounded ${this.getQuestionTypeClass(question.type)}">${question.type}</span>
        </div>
        <p class="text-lg">${question.question}</p>
      `
    }

    // Reset transcript
    const transcriptElement = document.getElementById("answerTranscript")
    if (transcriptElement) {
      transcriptElement.textContent = ""
    }

    // Reset recording button
    const recordBtn = document.getElementById("recordAnswerBtn")
    if (recordBtn) {
      recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Answer'
      recordBtn.classList.remove("recording", "bg-red-700")
    }

    // Disable next button until answer is recorded
    const nextBtn = document.getElementById("nextQuestionBtn")
    if (nextBtn) {
      nextBtn.disabled = true
    }
  }

  // Display all questions (mock mode)
  displayAllQuestions() {
    const questionsElement = document.getElementById("allQuestions")
    if (!questionsElement) return

    const questionsHTML = this.questions
      .map(
        (question, index) => `
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="mb-2">
          <span class="text-sm text-gray-500">Question ${index + 1}</span>
          <span class="ml-2 px-2 py-1 text-xs rounded ${this.getQuestionTypeClass(question.type)}">${question.type}</span>
        </div>
        <p class="font-medium">${question.question}</p>
        ${question.reasoning ? `<p class="text-sm text-gray-600 mt-2"><em>Focus: ${question.reasoning}</em></p>` : ""}
      </div>
    `,
      )
      .join("")

    questionsElement.innerHTML = questionsHTML
  }

  // Get CSS class for question type
  getQuestionTypeClass(type) {
    const classes = {
      behavioral: "bg-blue-100 text-blue-800",
      technical: "bg-green-100 text-green-800",
      experience: "bg-purple-100 text-purple-800",
      cultural: "bg-yellow-100 text-yellow-800",
      "role-specific": "bg-indigo-100 text-indigo-800",
    }
    return classes[type] || "bg-gray-100 text-gray-800"
  }

  // Toggle recording (practice mode)
  toggleRecording() {
    const recordBtn = document.getElementById("recordAnswerBtn")
    const transcriptElement = document.getElementById("answerTranscript")

    if (!this.isRecording) {
      // Start recording
      if (window.speechRecognition) {
        const success = window.speechRecognition.startRecording(
          (result) => {
            if (transcriptElement) {
              transcriptElement.textContent = result.finalTranscript + result.interimTranscript
            }
          },
          (finalTranscript) => {
            this.handleAnswerComplete(finalTranscript)
          },
        )

        if (success) {
          this.isRecording = true
          if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording'
            recordBtn.classList.add("recording", "bg-red-700")
          }
          this.showNotification("Recording started. Speak your answer now.", "info")
        }
      } else {
        this.showNotification("Speech recognition not available. Please check your browser settings.", "error")
      }
    } else {
      // Stop recording
      if (window.speechRecognition) {
        window.speechRecognition.stopRecording()
      }
      this.isRecording = false
      if (recordBtn) {
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Answer'
        recordBtn.classList.remove("recording", "bg-red-700")
      }
    }
  }

  // Toggle mock recording
  toggleMockRecording() {
    const recordBtn = document.getElementById("recordMockAnswerBtn")
    const transcriptElement = document.getElementById("mockAnswerTranscript")

    if (!this.isRecording) {
      // Start recording
      const success = window.speechRecognition.startRecording(
        (result) => {
          if (transcriptElement) {
            transcriptElement.textContent = result.finalTranscript + result.interimTranscript
          }
        },
        (finalTranscript) => {
          this.handleMockAnswerComplete(finalTranscript)
        },
      )

      if (success) {
        this.isRecording = true
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording'
        recordBtn.classList.add("recording", "bg-red-700")
        this.showNotification("Recording started. Answer all questions comprehensively.", "info")
      }
    } else {
      // Stop recording
      window.speechRecognition.stopRecording()
      this.isRecording = false
      recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Answers'
      recordBtn.classList.remove("recording", "bg-red-700")
    }
  }

  // Handle answer completion (practice mode)
  handleAnswerComplete(transcript) {
    if (transcript.trim()) {
      this.answers[this.currentQuestionIndex] = {
        question: this.questions[this.currentQuestionIndex].question,
        answer: transcript,
        timestamp: new Date().toISOString(),
      }

      // Enable next button
      const nextBtn = document.getElementById("nextQuestionBtn")
      if (nextBtn) {
        nextBtn.disabled = false
      }

      this.showNotification("Answer recorded successfully!", "success")
    }
  }

  // Handle mock answer completion
  handleMockAnswerComplete(transcript) {
    if (transcript.trim()) {
      this.answers = [
        {
          questions: this.questions.map((q) => q.question),
          answer: transcript,
          timestamp: new Date().toISOString(),
        },
      ]

      this.showNotification("Answers recorded successfully!", "success")
    }
  }

  // Move to next question
  nextQuestion() {
    this.currentQuestionIndex++
    this.displayCurrentQuestion()
  }

  // Setup coding section
  async setupCodingSection() {
    try {
      const codingQuestion = await window.geminiAPI.generateCodingQuestion("Software Engineer")

      const questionElement = document.getElementById("codingQuestion")
      if (questionElement) {
        questionElement.innerHTML = `
          <h4 class="font-semibold mb-2">${codingQuestion.title}</h4>
          <p class="mb-3">${codingQuestion.description}</p>
          ${
            codingQuestion.examples
              ? `
            <div class="mb-3">
              <strong>Example:</strong>
              <div class="bg-gray-100 p-2 rounded mt-1">
                <div><strong>Input:</strong> ${codingQuestion.examples[0].input}</div>
                <div><strong>Output:</strong> ${codingQuestion.examples[0].output}</div>
                <div><strong>Explanation:</strong> ${codingQuestion.examples[0].explanation}</div>
              </div>
            </div>
          `
              : ""
          }
        `
      }

      // Initialize Monaco Editor
      if (this.monaco) {
        this.monaco.editor.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs" } })
        this.monaco.require(["vs/editor/editor.main"], () => {
          this.codeEditor = this.monaco.editor.create(document.getElementById("codeEditor"), {
            value: "// Write your solution here\nfunction solution() {\n    \n}",
            language: "javascript",
            theme: "vs-dark",
            automaticLayout: true,
          })
        })
      }

      document.getElementById("codingSection")?.classList.remove("hidden")
    } catch (error) {
      console.error("Error setting up coding section:", error)
    }
  }

  // Submit code
  submitCode() {
    if (this.codeEditor) {
      const code = this.codeEditor.getValue()
      // Store the code submission
      this.answers.push({
        type: "coding",
        question: "Coding Challenge",
        answer: code,
        timestamp: new Date().toISOString(),
      })

      this.showNotification("Code submitted successfully!", "success")
      document.getElementById("codingSection")?.classList.add("hidden")
    }
  }

  // Skip coding challenge
  skipCoding() {
    this.answers.push({
      type: "coding",
      question: "Coding Challenge",
      answer: "Skipped",
      timestamp: new Date().toISOString(),
    })

    document.getElementById("codingSection")?.classList.add("hidden")
    this.showNotification("Coding challenge skipped", "info")
  }

  // Finish interview
  async finishInterview() {
    if (this.answers.length === 0) {
      this.showNotification("Please answer at least one question before finishing", "error")
      return
    }

    try {
      this.showLoading("Generating feedback...")

      // Stop video analysis
      if (window.tensorflowAnalysis) {
        window.tensorflowAnalysis.stopAnalysis()
      }
      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => track.stop())
      }

      // Generate feedback for each answer
      const feedback = await this.generateFeedback()

      // Get confidence analysis report
      const confidenceReport = window.tensorflowAnalysis
        ? window.tensorflowAnalysis.getFinalReport()
        : this.getMockConfidenceReport()

      // Show feedback phase
      this.showFeedback(feedback, confidenceReport)

      this.hideLoading()
    } catch (error) {
      console.error("Error generating feedback:", error)
      this.hideLoading()
      this.showNotification("Failed to generate feedback. Please try again.", "error")
    }
  }

  // Finish mock interview
  async finishMockInterview() {
    if (this.answers.length === 0) {
      this.showNotification("Please record your answers before finishing", "error")
      return
    }

    try {
      this.showLoading("Generating comprehensive feedback...")

      // Stop video analysis
      if (window.tensorflowAnalysis) {
        window.tensorflowAnalysis.stopAnalysis()
      }
      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => track.stop())
      }

      // Generate comprehensive feedback
      const feedback = await this.generateMockFeedback()

      // Get confidence analysis report
      const confidenceReport = window.tensorflowAnalysis
        ? window.tensorflowAnalysis.getFinalReport()
        : this.getMockConfidenceReport()

      // Show feedback phase
      this.showMockFeedback(feedback, confidenceReport)

      this.hideLoading()
    } catch (error) {
      console.error("Error generating mock feedback:", error)
      this.hideLoading()
      this.showNotification("Failed to generate feedback. Please try again.", "error")
    }
  }

  // Generate feedback for practice interview
  async generateFeedback() {
    const feedbackPromises = this.answers.map(async (answer, index) => {
      if (answer.type === "coding") {
        return {
          question: answer.question,
          feedback: {
            relevancy_score: answer.answer === "Skipped" ? 0 : 75,
            strengths: answer.answer === "Skipped" ? [] : ["Code submitted"],
            improvements:
              answer.answer === "Skipped" ? ["Consider attempting coding challenges"] : ["Code review needed"],
            overall_feedback:
              answer.answer === "Skipped" ? "Coding challenge was skipped" : "Code solution submitted for review",
            rating: answer.answer === "Skipped" ? "needs_improvement" : "average",
          },
        }
      }

      const question = this.questions[index]
      const evaluation = await window.geminiAPI.evaluateAnswer(
        question.question,
        answer.answer,
        `This is a ${question.type} question for interview practice.`,
      )

      return {
        question: question.question,
        feedback: evaluation,
      }
    })

    return Promise.all(feedbackPromises)
  }

  // Generate feedback for mock interview
  async generateMockFeedback() {
    const answer = this.answers[0]
    const allQuestions = answer.questions.join("\n")

    const evaluation = await window.geminiAPI.evaluateAnswer(
      `Mock Interview Questions:\n${allQuestions}`,
      answer.answer,
      "This is a comprehensive mock interview with multiple questions.",
    )

    return [
      {
        question: "Mock Interview (All Questions)",
        feedback: evaluation,
      },
    ]
  }

  // Get mock confidence report
  getMockConfidenceReport() {
    return {
      overallScore: 65,
      confidenceLevel: "Average",
      eyeContactScore: 60,
      expressionScore: 65,
      stabilityScore: 70,
      duration: 0,
      dataPoints: 0,
    }
  }

  // Show feedback
  showFeedback(feedback, confidenceReport) {
    document.getElementById("interviewPhase")?.classList.add("hidden")
    document.getElementById("feedbackPhase")?.classList.remove("hidden")

    const feedbackElement = document.getElementById("overallFeedback")
    if (!feedbackElement) return

    let html = `
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold text-lg mb-2">Confidence Analysis</h4>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${confidenceReport.overallScore}%</div>
            <div class="text-sm text-gray-600">Overall Confidence</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-700">${confidenceReport.confidenceLevel}</div>
            <div class="text-sm text-gray-600">Performance Level</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.eyeContactScore}%</div>
            <div class="text-gray-600">Eye Contact</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.expressionScore}%</div>
            <div class="text-gray-600">Expression</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.stabilityScore}%</div>
            <div class="text-gray-600">Stability</div>
          </div>
        </div>
      </div>
    `

    // Add individual question feedback
    feedback.forEach((item, index) => {
      const ratingColor = this.getRatingColor(item.feedback.rating)
      html += `
        <div class="mb-6 p-4 border border-gray-200 rounded-lg">
          <h5 class="font-semibold mb-2">Question ${index + 1}</h5>
          <p class="text-sm text-gray-600 mb-3">${item.question}</p>
          
          <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium">Relevancy Score</span>
              <span class="text-sm font-bold ${ratingColor}">${item.feedback.relevancy_score}/100</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full ${this.getScoreBarColor(item.feedback.relevancy_score)}" 
                   style="width: ${item.feedback.relevancy_score}%"></div>
            </div>
          </div>

          <div class="mb-3">
            <h6 class="font-semibold">Strengths</h6>
            ${
              item.feedback.strengths.length > 0
                ? `
              <ul class="list-disc pl-5">
                ${item.feedback.strengths.map((strength) => `<li>${strength}</li>`).join("")}
              </ul>
            `
                : '<p class="text-sm text-gray-500">No strengths identified.</p>'
            }
          </div>

          <div class="mb-3">
            <h6 class="font-semibold">Improvements</h6>
            ${
              item.feedback.improvements.length > 0
                ? `
              <ul class="list-disc pl-5">
                ${item.feedback.improvements.map((improvement) => `<li>${improvement}</li>`).join("")}
              </ul>
            `
                : '<p class="text-sm text-gray-500">No improvements suggested.</p>'
            }
          </div>

          <div>
            <h6 class="font-semibold">Overall Feedback</h6>
            <p class="text-sm text-gray-700">${item.feedback.overall_feedback}</p>
          </div>
        </div>
      `
    })

    feedbackElement.innerHTML = html
  }

  // Show mock feedback
  showMockFeedback(feedback, confidenceReport) {
    document.getElementById("mockInterviewPhase")?.classList.add("hidden")
    document.getElementById("mockFeedbackPhase")?.classList.remove("hidden")

    const feedbackElement = document.getElementById("mockOverallFeedback")
    if (!feedbackElement) return

    let html = `
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold text-lg mb-2">Confidence Analysis</h4>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${confidenceReport.overallScore}%</div>
            <div class="text-sm text-gray-600">Overall Confidence</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-700">${confidenceReport.confidenceLevel}</div>
            <div class="text-sm text-gray-600">Performance Level</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.eyeContactScore}%</div>
            <div class="text-gray-600">Eye Contact</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.expressionScore}%</div>
            <div class="text-gray-600">Expression</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">${confidenceReport.stabilityScore}%</div>
            <div class="text-gray-600">Stability</div>
          </div>
        </div>
      </div>
    `

    // Add individual question feedback
    feedback.forEach((item, index) => {
      const ratingColor = this.getRatingColor(item.feedback.rating)
      html += `
        <div class="mb-6 p-4 border border-gray-200 rounded-lg">
          <h5 class="font-semibold mb-2">Mock Interview Feedback</h5>
          <p class="text-sm text-gray-600 mb-3">${item.question}</p>
          
          <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium">Relevancy Score</span>
              <span class="text-sm font-bold ${ratingColor}">${item.feedback.relevancy_score}/100</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full ${this.getScoreBarColor(item.feedback.relevancy_score)}" 
                   style="width: ${item.feedback.relevancy_score}%"></div>
            </div>
          </div>

          <div class="mb-3">
            <h6 class="font-semibold">Strengths</h6>
            ${
              item.feedback.strengths.length > 0
                ? `
              <ul class="list-disc pl-5">
                ${item.feedback.strengths.map((strength) => `<li>${strength}</li>`).join("")}
              </ul>
            `
                : '<p class="text-sm text-gray-500">No strengths identified.</p>'
            }
          </div>

          <div class="mb-3">
            <h6 class="font-semibold">Improvements</h6>
            ${
              item.feedback.improvements.length > 0
                ? `
              <ul class="list-disc pl-5">
                ${item.feedback.improvements.map((improvement) => `<li>${improvement}</li>`).join("")}
              </ul>
            `
                : '<p class="text-sm text-gray-500">No improvements suggested.</p>'
            }
          </div>

          <div>
            <h6 class="font-semibold">Overall Feedback</h6>
            <p class="text-sm text-gray-700">${item.feedback.overall_feedback}</p>
          </div>
        </div>
      `
    })

    feedbackElement.innerHTML = html
  }

  // Get color based on rating
  getRatingColor(rating) {
    switch (rating) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-green-500"
      case "average":
        return "text-yellow-500"
      case "needs_improvement":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Get color for score bar
  getScoreBarColor(score) {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Add utility methods
  showLoading(message) {
    if (window.Utils && window.Utils.showLoading) {
      window.Utils.showLoading(message)
    } else {
      console.log("Loading:", message)
    }
  }

  hideLoading() {
    if (window.Utils && window.Utils.hideLoading) {
      window.Utils.hideLoading()
    } else {
      console.log("Loading complete")
    }
  }

  showNotification(message, type) {
    if (window.Utils && window.Utils.showNotification) {
      window.Utils.showNotification(message, type)
    } else {
      alert(`${type.toUpperCase()}: ${message}`)
    }
  }

  // Add reset methods
  resetPracticeSession() {
    // Reset all variables
    this.currentMode = null
    this.questions = []
    this.currentQuestionIndex = 0
    this.answers = []
    this.isRecording = false

    // Stop video stream
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop())
      this.videoStream = null
    }

    // Stop analysis
    if (window.tensorflowAnalysis) {
      window.tensorflowAnalysis.stopAnalysis()
    }

    // Show setup phase
    document.getElementById("setupPhase")?.classList.remove("hidden")
    document.getElementById("interviewPhase")?.classList.add("hidden")
    document.getElementById("feedbackPhase")?.classList.add("hidden")

    // Clear form
    const jobTopicInput = document.getElementById("jobTopic")
    if (jobTopicInput) jobTopicInput.value = ""

    const isTechRoleInput = document.getElementById("isTechRole")
    if (isTechRoleInput) isTechRoleInput.checked = false
  }

  resetMockSession() {
    // Similar reset for mock interview
    this.resetPracticeSession()

    // Show mock setup phase
    document.getElementById("mockSetupPhase")?.classList.remove("hidden")
    document.getElementById("mockInterviewPhase")?.classList.add("hidden")
    document.getElementById("mockFeedbackPhase")?.classList.add("hidden")
  }
}

// Make it globally available
window.InterviewPractice = InterviewPractice
console.log("Interview Practice class loaded successfully")
