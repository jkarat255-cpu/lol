// Speech recognition functionality for JobSeeker Pro
class AppSpeechRecognition {
  constructor() {
    this.recognition = null
    this.isRecording = false
    this.finalTranscript = ""
    this.interimTranscript = ""
    this.onResultCallback = null
    this.onEndCallback = null

    this.initializeRecognition()
  }

  // Initialize speech recognition
  initializeRecognition() {
    try {
      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        if (window.Utils && window.Utils.showNotification) {
          window.Utils.showNotification("Speech recognition is not supported in this browser.", "error")
        }
        return false
      }

      this.recognition = new SpeechRecognition()

      // Configure recognition settings
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"
      this.recognition.maxAlternatives = 1

      // Set up event listeners
      this.setupEventListeners()

      return true
    } catch (error) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification("Failed to initialize speech recognition.", "error")
      }
      return false
    }
  }

  // Setup event listeners for speech recognition
  setupEventListeners() {
    if (!this.recognition) return

    this.recognition.onstart = () => {
      this.isRecording = true
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = this.finalTranscript

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      this.finalTranscript = finalTranscript
      this.interimTranscript = interimTranscript
      if (this.onResultCallback) {
        this.onResultCallback({
          finalTranscript: this.finalTranscript,
          interimTranscript: this.interimTranscript,
          isFinal: event.results[event.results.length - 1].isFinal,
        })
      }
    }

    this.recognition.onerror = (event) => {
      let errorMessage = "Speech recognition error occurred."
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again."
          break
        case "audio-capture":
          errorMessage = "Microphone not accessible. Check permissions."
          break
        case "not-allowed":
          errorMessage = "Microphone permission denied. Allow access to use speech recognition."
          break
        case "network":
          errorMessage = "Network error during speech recognition."
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification(errorMessage, "error")
      }
      this.isRecording = false
    }

    this.recognition.onend = () => {
      this.isRecording = false
      if (this.onEndCallback) {
        this.onEndCallback(this.finalTranscript)
      }
    }
  }

  // Start recording
  startRecording(onResult, onEnd) {
    if (!this.recognition) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification("Speech recognition is not available.", "error")
      }
      return false
    }
    if (this.isRecording) {
      return false
    }
    try {
      this.finalTranscript = ""
      this.interimTranscript = ""
      this.onResultCallback = onResult
      this.onEndCallback = onEnd
      this.recognition.start()
      return true
    } catch (error) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification("Could not start recording. Try again.", "error")
      }
      return false
    }
  }

  // Stop recording
  stopRecording() {
    if (!this.recognition || !this.isRecording) {
      return false
    }
    try {
      this.recognition.stop()
      return true
    } catch (error) {
      return false
    }
  }

  // Check if recording is active
  isActive() {
    return this.isRecording
  }

  // Get current transcript
  getCurrentTranscript() {
    return {
      final: this.finalTranscript,
      interim: this.interimTranscript,
      combined: this.finalTranscript + this.interimTranscript,
    }
  }

  // Reset transcript
  resetTranscript() {
    this.finalTranscript = ""
    this.interimTranscript = ""
  }

  // Check browser support
  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  // Get supported languages (simplified list)
  static getSupportedLanguages() {
    return [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "es-ES", name: "Spanish" },
      { code: "fr-FR", name: "French" },
      { code: "de-DE", name: "German" },
      { code: "it-IT", name: "Italian" },
      { code: "pt-BR", name: "Portuguese (Brazil)" },
      { code: "ru-RU", name: "Russian" },
      { code: "ja-JP", name: "Japanese" },
      { code: "ko-KR", name: "Korean" },
      { code: "zh-CN", name: "Chinese (Mandarin)" },
    ]
  }

  // Set language
  setLanguage(languageCode) {
    if (this.recognition) {
      this.recognition.lang = languageCode
      console.log(`Speech recognition language set to: ${languageCode}`)
    }
  }

  // Set continuous mode
  setContinuous(continuous) {
    if (this.recognition) {
      this.recognition.continuous = continuous
      console.log(`Speech recognition continuous mode: ${continuous}`)
    }
  }

  // Set interim results
  setInterimResults(interimResults) {
    if (this.recognition) {
      this.recognition.interimResults = interimResults
      console.log(`Speech recognition interim results: ${interimResults}`)
    }
  }
}

// Make it globally available as AppSpeechRecognition (do not overwrite browser SpeechRecognition)
window.AppSpeechRecognition = AppSpeechRecognition;
console.log("AppSpeechRecognition class loaded successfully");
