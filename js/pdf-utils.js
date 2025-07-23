// PDF utilities for JobSeeker Pro
class PDFUtils {
  constructor() {
    this.pdfjsLib = window.pdfjsLib

    if (this.pdfjsLib) {
      // Set worker source
      this.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      console.log("PDF.js initialized successfully")
    } else {
      console.warn("PDF.js not available")
    }
  }

  // Validate PDF file
  validatePDFFile(file) {
    if (!file) {
      if (window.Utils) {
        window.Utils.showNotification("Please select a file", "error")
      }
      return false
    }

    // Check file type
    if (file.type !== "application/pdf") {
      if (window.Utils) {
        window.Utils.showNotification("Please select a PDF file", "error")
      }
      return false
    }

    // Check file size (10MB limit)
    if (file.size > window.CONFIG.MAX_FILE_SIZE) {
      if (window.Utils) {
        window.Utils.showNotification("File size too large. Please select a file under 10MB", "error")
      }
      return false
    }

    return true
  }

  // Extract text from PDF file
  async extractTextFromPDF(file) {
    if (!this.validatePDFFile(file)) {
      return null
    }

    if (!this.pdfjsLib) {
      console.error("PDF.js not available")
      if (window.Utils) {
        window.Utils.showNotification("PDF processing not available", "error")
      }
      return null
    }

    try {
      console.log("Extracting text from PDF...")

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer()

      // Load PDF document
      const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ""

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        const pageText = textContent.items.map((item) => item.str).join(" ")

        fullText += pageText + "\n"
      }

      console.log("PDF text extraction completed")

      if (fullText.trim().length === 0) {
        if (window.Utils) {
          window.Utils.showNotification(
            "No text found in PDF. Please ensure the PDF contains readable text.",
            "warning",
          )
        }
        return null
      }

      return fullText.trim()
    } catch (error) {
      console.error("PDF text extraction failed:", error)

      if (window.Utils) {
        window.Utils.showNotification("Failed to extract text from PDF. Please try again.", "error")
      }

      return null
    }
  }

  // Get PDF metadata
  async getPDFMetadata(file) {
    if (!this.validatePDFFile(file)) {
      return null
    }

    if (!this.pdfjsLib) {
      console.error("PDF.js not available")
      return null
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const metadata = await pdf.getMetadata()

      return {
        numPages: pdf.numPages,
        title: metadata.info.Title || "Unknown",
        author: metadata.info.Author || "Unknown",
        subject: metadata.info.Subject || "Unknown",
        creator: metadata.info.Creator || "Unknown",
        producer: metadata.info.Producer || "Unknown",
        creationDate: metadata.info.CreationDate || null,
        modificationDate: metadata.info.ModDate || null,
      }
    } catch (error) {
      console.error("Failed to get PDF metadata:", error)
      return null
    }
  }

  // Convert PDF to images (for preview)
  async convertPDFToImages(file, maxPages = 3) {
    if (!this.validatePDFFile(file)) {
      return []
    }

    if (!this.pdfjsLib) {
      console.error("PDF.js not available")
      return []
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const images = []
      const pagesToConvert = Math.min(pdf.numPages, maxPages)

      for (let pageNum = 1; pageNum <= pagesToConvert; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.0 })

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        images.push({
          pageNumber: pageNum,
          dataURL: canvas.toDataURL("image/png"),
          width: viewport.width,
          height: viewport.height,
        })
      }

      return images
    } catch (error) {
      console.error("PDF to image conversion failed:", error)
      return []
    }
  }

  // Analyze resume structure
  analyzeResumeStructure(text) {
    if (!text || text.trim().length === 0) {
      return {
        hasContactInfo: false,
        hasExperience: false,
        hasEducation: false,
        hasSkills: false,
        sections: [],
        wordCount: 0,
        estimatedReadingTime: 0,
      }
    }

    const lowerText = text.toLowerCase()
    const lines = text.split("\n").filter((line) => line.trim().length > 0)

    // Check for common resume sections
    const hasContactInfo = /\b(email|phone|address|linkedin|github)\b/.test(lowerText)
    const hasExperience = /\b(experience|work|employment|job|position|role)\b/.test(lowerText)
    const hasEducation = /\b(education|degree|university|college|school|graduated)\b/.test(lowerText)
    const hasSkills = /\b(skills|technologies|programming|languages|tools)\b/.test(lowerText)

    // Identify sections
    const sections = []
    const sectionKeywords = {
      "Contact Information": ["contact", "email", "phone", "address"],
      "Professional Summary": ["summary", "objective", "profile"],
      "Work Experience": ["experience", "work", "employment", "professional"],
      Education: ["education", "degree", "university", "college"],
      Skills: ["skills", "technologies", "technical", "programming"],
      Projects: ["projects", "portfolio", "work samples"],
      Certifications: ["certifications", "certificates", "licensed"],
      Awards: ["awards", "honors", "achievements", "recognition"],
    }

    for (const [sectionName, keywords] of Object.entries(sectionKeywords)) {
      const hasSection = keywords.some((keyword) => lowerText.includes(keyword))
      if (hasSection) {
        sections.push(sectionName)
      }
    }

    // Calculate word count and reading time
    const words = text.split(/\s+/).filter((word) => word.length > 0)
    const wordCount = words.length
    const estimatedReadingTime = Math.ceil(wordCount / 200) // 200 words per minute

    return {
      hasContactInfo,
      hasExperience,
      hasEducation,
      hasSkills,
      sections,
      wordCount,
      estimatedReadingTime,
      lineCount: lines.length,
      characterCount: text.length,
    }
  }

  // Extract contact information
  extractContactInfo(text) {
    if (!text) return {}

    const contactInfo = {}

    // Email extraction
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch) {
      contactInfo.email = emailMatch[0]
    }

    // Phone extraction
    const phoneMatch = text.match(/\b(?:\+?1[-.\s]?)?$$?([0-9]{3})$$?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/)
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0]
    }

    // LinkedIn extraction
    const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([\w-]+)/i)
    if (linkedinMatch) {
      contactInfo.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`
    }

    // GitHub extraction
    const githubMatch = text.match(/(?:github\.com\/)([\w-]+)/i)
    if (githubMatch) {
      contactInfo.github = `https://github.com/${githubMatch[1]}`
    }

    return contactInfo
  }

  // Generate resume suggestions
  generateResumeSuggestions(analysisResult, contactInfo) {
    const suggestions = []

    if (!analysisResult.hasContactInfo) {
      suggestions.push({
        type: "missing_section",
        priority: "high",
        message: "Add contact information including email and phone number",
      })
    }

    if (!analysisResult.hasExperience) {
      suggestions.push({
        type: "missing_section",
        priority: "high",
        message: "Include work experience or relevant projects",
      })
    }

    if (!analysisResult.hasEducation) {
      suggestions.push({
        type: "missing_section",
        priority: "medium",
        message: "Add education background",
      })
    }

    if (!analysisResult.hasSkills) {
      suggestions.push({
        type: "missing_section",
        priority: "medium",
        message: "Include a skills section with relevant technologies",
      })
    }

    if (analysisResult.wordCount < 200) {
      suggestions.push({
        type: "content_length",
        priority: "medium",
        message: "Resume appears too short. Consider adding more details about your experience",
      })
    }

    if (analysisResult.wordCount > 800) {
      suggestions.push({
        type: "content_length",
        priority: "low",
        message: "Resume might be too long. Consider condensing to 1-2 pages",
      })
    }

    if (!contactInfo.email) {
      suggestions.push({
        type: "contact_info",
        priority: "high",
        message: "Email address not found. Make sure to include a professional email",
      })
    }

    return suggestions
  }
}

// Make it globally available
window.PDFUtils = PDFUtils
console.log("PDF Utils class loaded successfully")
