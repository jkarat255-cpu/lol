// TensorFlow-based confidence analysis for JobSeeker Pro
import * as tf from "@tensorflow/tfjs"
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection"

class TensorFlowAnalysis {
  constructor() {
    this.model = null
    this.isAnalyzing = false
    this.analysisData = []
    this.currentAnalysis = {
      eyeContact: 0,
      facialExpression: 0,
      headMovement: 0,
      overallConfidence: 0,
    }
  }

  // Initialize TensorFlow model
  async initialize() {
    try {
      console.log("Initializing TensorFlow analysis...")

      // Check if TensorFlow is available
      if (typeof tf === "undefined") {
        console.warn("TensorFlow not available, using mock analysis")
        return false
      }

      // Load face landmarks detection model
      if (typeof faceLandmarksDetection !== "undefined") {
        this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
        console.log("TensorFlow face detection model loaded successfully")
        return true
      } else {
        console.warn("Face landmarks detection not available, using mock analysis")
        return false
      }
    } catch (error) {
      console.error("TensorFlow initialization failed:", error)
      return false
    }
  }

  // Start analysis on video element
  startAnalysis(videoElement, callback) {
    if (!videoElement) {
      console.error("Video element not provided for analysis")
      return
    }

    this.isAnalyzing = true
    this.analysisData = []

    console.log("Starting confidence analysis...")

    if (this.model) {
      this.startRealAnalysis(videoElement, callback)
    } else {
      this.startMockAnalysis(callback)
    }
  }

  // Real TensorFlow analysis
  async startRealAnalysis(videoElement, callback) {
    const analyze = async () => {
      if (!this.isAnalyzing) return

      try {
        const predictions = await this.model.estimateFaces({
          input: videoElement,
          returnTensors: false,
          flipHorizontal: false,
        })

        if (predictions.length > 0) {
          const face = predictions[0]
          const analysis = this.analyzeFaceLandmarks(face)

          this.currentAnalysis = analysis
          this.analysisData.push({
            timestamp: Date.now(),
            ...analysis,
          })

          if (callback) {
            callback(analysis)
          }
        }
      } catch (error) {
        console.error("Analysis error:", error)
      }

      // Continue analysis
      if (this.isAnalyzing) {
        setTimeout(analyze, window.CONFIG.ANALYSIS_INTERVAL)
      }
    }

    analyze()
  }

  // Mock analysis for fallback
  startMockAnalysis(callback) {
    const analyze = () => {
      if (!this.isAnalyzing) return

      // Generate realistic mock data
      const baseConfidence = 65
      const variation = 15

      const analysis = {
        eyeContact: Math.max(0, Math.min(100, baseConfidence + (Math.random() - 0.5) * variation)),
        facialExpression: Math.max(0, Math.min(100, baseConfidence + (Math.random() - 0.5) * variation)),
        headMovement: Math.max(0, Math.min(100, baseConfidence + (Math.random() - 0.5) * variation)),
        overallConfidence: 0,
      }

      analysis.overallConfidence = (analysis.eyeContact + analysis.facialExpression + analysis.headMovement) / 3

      this.currentAnalysis = analysis
      this.analysisData.push({
        timestamp: Date.now(),
        ...analysis,
      })

      if (callback) {
        callback(analysis)
      }

      // Continue analysis
      if (this.isAnalyzing) {
        setTimeout(analyze, window.CONFIG.ANALYSIS_INTERVAL)
      }
    }

    analyze()
  }

  // Analyze face landmarks for confidence metrics
  analyzeFaceLandmarks(face) {
    try {
      const keypoints = face.scaledMesh

      // Eye contact analysis (simplified)
      const leftEye = this.getEyeRegion(keypoints, "left")
      const rightEye = this.getEyeRegion(keypoints, "right")
      const eyeContact = this.calculateEyeContact(leftEye, rightEye)

      // Facial expression analysis
      const mouth = this.getMouthRegion(keypoints)
      const facialExpression = this.calculateFacialExpression(mouth)

      // Head movement analysis
      const nose = keypoints[1] // Nose tip
      const headMovement = this.calculateHeadStability(nose)

      const overallConfidence = (eyeContact + facialExpression + headMovement) / 3

      return {
        eyeContact,
        facialExpression,
        headMovement,
        overallConfidence,
      }
    } catch (error) {
      console.error("Landmark analysis error:", error)

      // Return default values on error
      return {
        eyeContact: 60,
        facialExpression: 65,
        headMovement: 70,
        overallConfidence: 65,
      }
    }
  }

  // Get eye region keypoints
  getEyeRegion(keypoints, eye) {
    // Simplified eye region detection
    const eyeIndices =
      eye === "left"
        ? [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        : [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

    return eyeIndices.map((i) => keypoints[i]).filter((point) => point)
  }

  // Get mouth region keypoints
  getMouthRegion(keypoints) {
    const mouthIndices = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
    return mouthIndices.map((i) => keypoints[i]).filter((point) => point)
  }

  // Calculate eye contact score
  calculateEyeContact(leftEye, rightEye) {
    if (!leftEye.length || !rightEye.length) return 60

    // Simplified calculation based on eye openness
    const leftOpenness = this.calculateEyeOpenness(leftEye)
    const rightOpenness = this.calculateEyeOpenness(rightEye)

    const avgOpenness = (leftOpenness + rightOpenness) / 2

    // Convert to confidence score (0-100)
    return Math.max(0, Math.min(100, avgOpenness * 100))
  }

  // Calculate eye openness
  calculateEyeOpenness(eyePoints) {
    if (eyePoints.length < 4) return 0.6

    // Simple calculation based on vertical distance
    const top = Math.min(...eyePoints.map((p) => p[1]))
    const bottom = Math.max(...eyePoints.map((p) => p[1]))
    const left = Math.min(...eyePoints.map((p) => p[0]))
    const right = Math.max(...eyePoints.map((p) => p[0]))

    const height = bottom - top
    const width = right - left

    return Math.min(1, height / (width * 0.3))
  }

  // Calculate facial expression score
  calculateFacialExpression(mouthPoints) {
    if (!mouthPoints.length) return 65

    // Simplified smile detection
    const leftCorner = mouthPoints[0]
    const rightCorner = mouthPoints[6]
    const topLip = mouthPoints[3]
    const bottomLip = mouthPoints[9]

    if (!leftCorner || !rightCorner || !topLip || !bottomLip) return 65

    const mouthWidth = Math.abs(rightCorner[0] - leftCorner[0])
    const mouthHeight = Math.abs(bottomLip[1] - topLip[1])

    const expressionScore = Math.min(100, (mouthWidth / mouthHeight) * 20)

    return Math.max(40, expressionScore)
  }

  // Calculate head stability
  calculateHeadStability(nosePoint) {
    if (!nosePoint) return 70

    // Store previous positions for stability calculation
    if (!this.previousNosePositions) {
      this.previousNosePositions = []
    }

    this.previousNosePositions.push(nosePoint)

    // Keep only last 10 positions
    if (this.previousNosePositions.length > 10) {
      this.previousNosePositions.shift()
    }

    if (this.previousNosePositions.length < 3) return 70

    // Calculate movement variance
    const movements = []
    for (let i = 1; i < this.previousNosePositions.length; i++) {
      const prev = this.previousNosePositions[i - 1]
      const curr = this.previousNosePositions[i]
      const movement = Math.sqrt(Math.pow(curr[0] - prev[0], 2) + Math.pow(curr[1] - prev[1], 2))
      movements.push(movement)
    }

    const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length

    // Convert to stability score (less movement = higher stability)
    const stabilityScore = Math.max(0, Math.min(100, 100 - avgMovement * 10))

    return stabilityScore
  }

  // Stop analysis
  stopAnalysis() {
    this.isAnalyzing = false
    console.log("Confidence analysis stopped")
  }

  // Get final report
  getFinalReport() {
    if (this.analysisData.length === 0) {
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

    const avgEyeContact = this.analysisData.reduce((sum, data) => sum + data.eyeContact, 0) / this.analysisData.length
    const avgExpression =
      this.analysisData.reduce((sum, data) => sum + data.facialExpression, 0) / this.analysisData.length
    const avgStability = this.analysisData.reduce((sum, data) => sum + data.headMovement, 0) / this.analysisData.length
    const overallScore = (avgEyeContact + avgExpression + avgStability) / 3

    let confidenceLevel = "Needs Improvement"
    if (overallScore >= 80) confidenceLevel = "Excellent"
    else if (overallScore >= 70) confidenceLevel = "Good"
    else if (overallScore >= 60) confidenceLevel = "Average"

    const duration =
      this.analysisData.length > 0
        ? (this.analysisData[this.analysisData.length - 1].timestamp - this.analysisData[0].timestamp) / 1000
        : 0

    return {
      overallScore: Math.round(overallScore),
      confidenceLevel,
      eyeContactScore: Math.round(avgEyeContact),
      expressionScore: Math.round(avgExpression),
      stabilityScore: Math.round(avgStability),
      duration: Math.round(duration),
      dataPoints: this.analysisData.length,
    }
  }

  // Reset analysis data
  reset() {
    this.analysisData = []
    this.previousNosePositions = []
    this.currentAnalysis = {
      eyeContact: 0,
      facialExpression: 0,
      headMovement: 0,
      overallConfidence: 0,
    }
  }
}

// Make it globally available
window.TensorFlowAnalysis = TensorFlowAnalysis
console.log("TensorFlow Analysis class loaded successfully")
