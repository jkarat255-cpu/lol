// Configuration file for JobSeeker Pro
window.CONFIG = {
  // API Keys (In production, these should be environment variables)
  GEMINI_API_KEY: "AIzaSyDf8ZXcsAf4J32GTyuXJ5oNHykidbbnzOQ", // Replace with your actual API key

  // API Endpoints
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",

  // TensorFlow Models
  FACE_DETECTION_MODEL: "@tensorflow-models/face-landmarks-detection",

  // Speech Recognition Settings
  SPEECH_RECOGNITION: {
    continuous: true,
    interimResults: true,
    lang: "en-US",
  },

  // Interview Settings
  MAX_QUESTIONS: 8,
  MIN_QUESTIONS: 3,
  RECORDING_TIMEOUT: 300000, // 5 minutes

  // TensorFlow Settings
  CONFIDENCE_THRESHOLD: 0.7,
  ANALYSIS_INTERVAL: 1000, // 1 second

  // Resume Templates
  RESUME_TEMPLATES: {
    modern: "modern-template",
    classic: "classic-template",
    creative: "creative-template",
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    jobs: "jobseeker_jobs",
    applications: "jobseeker_applications",
    interviews: "jobseeker_interviews",
    resumes: "jobseeker_resumes",
    user_profile: "jobseeker_profile",
    recent_activities: "recent_activities",
    employer_activities: "employer_activities",
  },

  // Application Settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ["application/pdf"],

  // UI Settings
  NOTIFICATION_DURATION: 5000,
  LOADING_TIMEOUT: 30000,
}

// Utility functions
const Utils = {
  // Show loading modal
  showLoading: (text = "Processing...") => {
    const modal = document.getElementById("loadingModal")
    const loadingText = document.getElementById("loadingText")
    loadingText.textContent = text
    modal.classList.remove("hidden")
  },

  // Hide loading modal
  hideLoading: () => {
    const modal = document.getElementById("loadingModal")
    modal.classList.add("hidden")
  },

  // Show notification
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
    }, window.CONFIG.NOTIFICATION_DURATION)
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  // Sanitize HTML
  sanitizeHTML: (str) => {
    const temp = document.createElement("div")
    temp.textContent = str
    return temp.innerHTML
  },
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("JobSeeker Pro initialized")
  console.log("Config loaded successfully")
})
