// Application initialization script
;(() => {
  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log("JobSeeker Pro: Initializing application...")

    // Initialize global instances
    initializeGlobalInstances()

    // Initialize page-specific functionality
    initializeCurrentPage()

    console.log("JobSeeker Pro: Application initialized successfully")
  })

  function initializeGlobalInstances() {
    // Initialize Utils first
    if (!window.Utils) {
      window.Utils = {
        showLoading: (text = "Processing...") => {
          const modal = document.getElementById("loadingModal")
          const loadingText = document.getElementById("loadingText")
          if (modal && loadingText) {
            loadingText.textContent = text
            modal.classList.remove("hidden")
          }
        },

        hideLoading: () => {
          const modal = document.getElementById("loadingModal")
          if (modal) {
            modal.classList.add("hidden")
          }
        },

        showNotification: (message, type = "info") => {
          const notification = document.createElement("div")
          notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === "success"
              ? "bg-green-500 text-white"
              : type === "error"
                ? "bg-red-500 text-white"
                : type === "warning"
                  ? "bg-yellow-500 text-black"
                  : "bg-blue-500 text-white"
          }`
          notification.textContent = message
          document.body.appendChild(notification)

          setTimeout(() => {
            notification.remove()
          }, 5000)
        },

        formatDate: (date) =>
          new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),

        generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

        validateEmail: (email) => {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return re.test(email)
        },

        sanitizeHTML: (str) => {
          const temp = document.createElement("div")
          temp.textContent = str
          return temp.innerHTML
        },
      }
    }

    // Initialize Gemini API
    if (window.GeminiAPI && !window.geminiAPI) {
      window.geminiAPI = new window.GeminiAPI()
      console.log("Gemini API initialized")
    }

    // Initialize TensorFlow Analysis
    if (window.TensorFlowAnalysis && !window.tensorflowAnalysis) {
      window.tensorflowAnalysis = new window.TensorFlowAnalysis()
      console.log("TensorFlow Analysis initialized")
    }

    // Initialize Speech Recognition
    if (window.AppSpeechRecognition && !window.speechRecognition) {
      window.speechRecognition = new window.AppSpeechRecognition();
      console.log("AppSpeechRecognition initialized");
    }

    // Initialize PDF Utils
    if (window.PDFUtils && !window.pdfUtils) {
      window.pdfUtils = new window.PDFUtils()
      console.log("PDF Utils initialized")
    }

    // Initialize Resume Builder
    if (window.ResumeBuilder && !window.resumeBuilder) {
      window.resumeBuilder = new window.ResumeBuilder()
      console.log("Resume Builder initialized")
    }
  }

  function initializeCurrentPage() {
    const currentPage = getCurrentPage()
    console.log("Current page:", currentPage)

    switch (currentPage) {
      case "practice-interview":
      case "mock-interview":
        if (window.InterviewPractice) {
          window.interviewPractice = new window.InterviewPractice()
          window.interviewPractice.initialize()
          console.log("Interview Practice initialized for", currentPage)
        }
        break

      case "resume-builder":
        if (window.ResumeBuilder && window.resumeBuilder) {
          window.resumeBuilder.initialize()
          console.log("Resume Builder page initialized")
        }
        break

      case "job-search":
        if (window.JobSearch) {
          window.jobSearch = new window.JobSearch()
          window.jobSearch.initialize()
          console.log("Job Search initialized")
        }
        break

      case "create-job":
      case "manage-candidates":
        if (window.EmployerManager) {
          window.employerManager = new window.EmployerManager()
          window.employerManager.initialize()
          console.log("Employer Manager initialized")
        }
        break

      default:
        console.log("No specific initialization needed for", currentPage)
    }
  }

  function getCurrentPage() {
    const path = window.location.pathname
    const page = path.split("/").pop() || "index.html"
    return page.replace(".html", "")
  }
})()
