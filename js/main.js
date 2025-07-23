// Main JavaScript file for JobSeeker Pro
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the application based on current page
  const currentPage = getCurrentPage()
  initializePage(currentPage)

  // Setup common event listeners
  setupCommonEventListeners()

  // Load saved data
  loadUserData()
})

// Get current page name
function getCurrentPage() {
  const path = window.location.pathname
  const page = path.split("/").pop() || "index.html"
  return page.replace(".html", "")
}

// Initialize page-specific functionality
function initializePage(page) {
  switch (page) {
    case "index":
      initializeLandingPage()
      break
    case "job-seeker-dashboard":
      initializeJobSeekerDashboard()
      break
    case "employer-dashboard":
      initializeEmployerDashboard()
      break
    case "practice-interview":
      const InterviewPractice = window.InterviewPractice // Declare InterviewPractice
      if (InterviewPractice) {
        const interviewPractice = new InterviewPractice()
        interviewPractice.initialize()
      }
      break
    case "mock-interview":
      const InterviewPracticeMock = window.InterviewPractice // Declare InterviewPractice for mock interview
      if (InterviewPracticeMock) {
        const mockInterview = new InterviewPracticeMock()
        mockInterview.initialize()
      }
      break
    case "resume-builder":
      const resumeBuilder = window.resumeBuilder // Declare resumeBuilder
      if (resumeBuilder) {
        resumeBuilder.initialize()
      }
      break
    case "job-search":
      const JobSearch = window.JobSearch // Declare JobSearch
      if (JobSearch) {
        const jobSearch = new JobSearch()
        jobSearch.initialize()
      }
      break
    case "create-job":
    case "manage-candidates":
      const EmployerManager = window.EmployerManager // Declare EmployerManager
      if (EmployerManager) {
        const employerManager = new EmployerManager()
        employerManager.initialize()
      }
      break
  }
}

// Initialize landing page
function initializeLandingPage() {
  // Add any landing page specific initialization
  console.log("Landing page initialized")
}

// Initialize job seeker dashboard
function initializeJobSeekerDashboard() {
  updateRecentActivity()
  loadJobSeekerStats()
}

// Initialize employer dashboard
function initializeEmployerDashboard() {
  updateEmployerStats()
  loadEmployerActivity()
}

// Setup common event listeners
function setupCommonEventListeners() {
  // Handle navigation
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-navigate]")) {
      e.preventDefault()
      const url = e.target.getAttribute("data-navigate")
      window.location.href = url
    }
  })

  // Handle form submissions
  document.addEventListener("submit", (e) => {
    if (e.target.matches("form[data-ajax]")) {
      e.preventDefault()
      handleAjaxForm(e.target)
    }
  })
}

// Update recent activity for job seeker dashboard
function updateRecentActivity() {
  const activityElement = document.getElementById("recentActivity")
  if (!activityElement) return

  const activities = getRecentActivities()

  if (activities.length === 0) {
    activityElement.innerHTML =
      '<p class="text-gray-500">No recent activity. Start using our tools to see your progress here!</p>'
    return
  }

  const activityHTML = activities
    .map(
      (activity) => `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <i class="fas ${activity.icon} text-${activity.color}-500"></i>
            <div>
                <p class="text-sm font-medium">${activity.title}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `,
    )
    .join("")

  activityElement.innerHTML = activityHTML
}

// Get recent activities from localStorage
function getRecentActivities() {
  try {
    const activities = localStorage.getItem("recent_activities")
    return activities ? JSON.parse(activities) : []
  } catch (error) {
    console.error("Error loading recent activities:", error)
    return []
  }
}

// Add activity to recent activities
function addActivity(title, icon, color) {
  try {
    const activities = getRecentActivities()
    const newActivity = {
      title,
      icon,
      color,
      time: new Date().toLocaleString(),
      timestamp: Date.now(),
    }

    activities.unshift(newActivity)

    // Keep only last 10 activities
    if (activities.length > 10) {
      activities.splice(10)
    }

    localStorage.setItem("recent_activities", JSON.stringify(activities))

    // Update UI if on dashboard
    if (getCurrentPage() === "job-seeker-dashboard") {
      updateRecentActivity()
    }
  } catch (error) {
    console.error("Error adding activity:", error)
  }
}

// Load job seeker stats
function loadJobSeekerStats() {
  // This would typically load from a backend API
  // For now, we'll use localStorage
  const stats = {
    interviewsPracticed: localStorage.getItem("interviews_practiced") || 0,
    resumesCreated: localStorage.getItem("resumes_created") || 0,
    jobsApplied: localStorage.getItem("jobs_applied") || 0,
  }

  // Update dashboard if elements exist
  updateStatElement("interviewsPracticed", stats.interviewsPracticed)
  updateStatElement("resumesCreated", stats.resumesCreated)
  updateStatElement("jobsApplied", stats.jobsApplied)
}

// Update employer stats
function updateEmployerStats() {
  const stats = {
    activeJobs: getActiveJobsCount(),
    totalApplications: getTotalApplicationsCount(),
    scheduledInterviews: getScheduledInterviewsCount(),
  }

  updateStatElement("activeJobsCount", stats.activeJobs)
  updateStatElement("applicationsCount", stats.totalApplications)
  updateStatElement("interviewsCount", stats.scheduledInterviews)
}

// Load employer activity
function loadEmployerActivity() {
  const activityElement = document.getElementById("employerActivity")
  if (!activityElement) return

  const activities = getEmployerActivities()

  if (activities.length === 0) {
    activityElement.innerHTML =
      '<p class="text-gray-500">No recent activity. Start by creating your first job posting!</p>'
    return
  }

  const activityHTML = activities
    .map(
      (activity) => `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <i class="fas ${activity.icon} text-${activity.color}-500"></i>
            <div>
                <p class="text-sm font-medium">${activity.title}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `,
    )
    .join("")

  activityElement.innerHTML = activityHTML
}

// Get employer activities
function getEmployerActivities() {
  try {
    const activities = localStorage.getItem("employer_activities")
    return activities ? JSON.parse(activities) : []
  } catch (error) {
    console.error("Error loading employer activities:", error)
    return []
  }
}

// Update stat element
function updateStatElement(elementId, value) {
  const element = document.getElementById(elementId)
  if (element) {
    element.textContent = value
  }
}

// Get active jobs count
function getActiveJobsCount() {
  try {
    const jobs = localStorage.getItem(window.CONFIG.STORAGE_KEYS.jobs) // Use window.CONFIG
    if (!jobs) return 0
    const jobsArray = JSON.parse(jobs)
    return jobsArray.filter((job) => job.status === "active").length
  } catch (error) {
    return 0
  }
}

// Get total applications count
function getTotalApplicationsCount() {
  try {
    const applications = localStorage.getItem(window.CONFIG.STORAGE_KEYS.applications) // Use window.CONFIG
    if (!applications) return 0
    return JSON.parse(applications).length
  } catch (error) {
    return 0
  }
}

// Get scheduled interviews count
function getScheduledInterviewsCount() {
  try {
    const applications = localStorage.getItem(window.CONFIG.STORAGE_KEYS.applications) // Use window.CONFIG
    if (!applications) return 0
    const applicationsArray = JSON.parse(applications)
    return applicationsArray.filter((app) => app.status === "interview").length
  } catch (error) {
    return 0
  }
}

// Load user data
function loadUserData() {
  // Load any saved user preferences or data
  const theme = localStorage.getItem("theme")
  if (theme) {
    document.body.classList.add(theme)
  }
}

// Handle AJAX form submissions
function handleAjaxForm(form) {
  const formData = new FormData(form)
  const action = form.getAttribute("action") || "#"
  const method = form.getAttribute("method") || "POST"

  // Show loading state
  const submitBtn = form.querySelector('[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Processing..."
  submitBtn.disabled = true

  // Simulate API call (replace with actual API call)
  setTimeout(() => {
    // Reset button
    submitBtn.textContent = originalText
    submitBtn.disabled = false

    // Show success message
    window.Utils.showNotification("Form submitted successfully!", "success") // Use window.Utils
  }, 2000)
}

// Utility functions for cross-page functionality
window.JobSeekerPro = {
  addActivity,
  updateRecentActivity,
  getCurrentPage,
  loadJobSeekerStats,
  updateEmployerStats,
}

// Declare global variables
window.CONFIG = {
  STORAGE_KEYS: {
    jobs: "jobs",
    applications: "applications",
  },
}

window.Utils = {
  showNotification: (message, type) => {
    console.log(`Notification (${type}): ${message}`)
  },
}
