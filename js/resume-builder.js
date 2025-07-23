// Resume builder functionality for JobSeeker Pro
class ResumeBuilder {
  constructor() {
    this.currentResume = {
      personalInfo: {},
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    }
    this.templates = this.getTemplates()
    this.currentTemplate = "modern"
  }

  // Initialize resume builder
  initialize() {
    console.log("Initializing Resume Builder...")
    this.setupEventListeners()
    this.loadSavedResume()
    this.renderPreview()
  }

  // Setup event listeners
  setupEventListeners() {
    // Personal info form
    const personalForm = document.getElementById("personalInfoForm")
    if (personalForm) {
      personalForm.addEventListener("input", (e) => {
        this.updatePersonalInfo(e.target.name, e.target.value)
      })
    }

    // Summary textarea
    const summaryTextarea = document.getElementById("summary")
    if (summaryTextarea) {
      summaryTextarea.addEventListener("input", (e) => {
        this.currentResume.summary = e.target.value
        this.renderPreview()
        this.saveResume()
      })
    }

    // Add section buttons
    document.getElementById("addExperienceBtn")?.addEventListener("click", () => {
      this.addExperience()
    })

    document.getElementById("addEducationBtn")?.addEventListener("click", () => {
      this.addEducation()
    })

    document.getElementById("addProjectBtn")?.addEventListener("click", () => {
      this.addProject()
    })

    // Template selection
    const templateSelect = document.getElementById("templateSelect")
    if (templateSelect) {
      templateSelect.addEventListener("change", (e) => {
        this.currentTemplate = e.target.value
        this.renderPreview()
      })
    }

    // Export buttons
    document.getElementById("exportPDFBtn")?.addEventListener("click", () => {
      this.exportToPDF()
    })

    document.getElementById("exportHTMLBtn")?.addEventListener("click", () => {
      this.exportToHTML()
    })

    // Skills input
    const skillsInput = document.getElementById("skillsInput")
    if (skillsInput) {
      skillsInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.addSkill(e.target.value.trim())
          e.target.value = ""
        }
      })
    }

    console.log("Resume Builder event listeners set up")
  }

  // Update personal information
  updatePersonalInfo(field, value) {
    this.currentResume.personalInfo[field] = value
    this.renderPreview()
    this.saveResume()
  }

  // Add work experience
  addExperience() {
    const experience = {
      id: Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [],
    }

    this.currentResume.experience.push(experience)
    this.renderExperienceForm()
    this.renderPreview()
  }

  // Add education
  addEducation() {
    const education = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      achievements: [],
    }

    this.currentResume.education.push(education)
    this.renderEducationForm()
    this.renderPreview()
  }

  // Add project
  addProject() {
    const project = {
      id: Date.now(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      github: "",
      startDate: "",
      endDate: "",
    }

    this.currentResume.projects.push(project)
    this.renderProjectForm()
    this.renderPreview()
  }

  // Add skill
  addSkill(skill) {
    if (skill && !this.currentResume.skills.includes(skill)) {
      this.currentResume.skills.push(skill)
      this.renderSkills()
      this.renderPreview()
      this.saveResume()
    }
  }

  // Remove skill
  removeSkill(skill) {
    const index = this.currentResume.skills.indexOf(skill)
    if (index > -1) {
      this.currentResume.skills.splice(index, 1)
      this.renderSkills()
      this.renderPreview()
      this.saveResume()
    }
  }

  // Render experience form
  renderExperienceForm() {
    const container = document.getElementById("experienceContainer")
    if (!container) return

    container.innerHTML = this.currentResume.experience
      .map(
        (exp) => `
      <div class="experience-item border border-gray-200 rounded-lg p-4 mb-4" data-id="${exp.id}">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" value="${exp.company}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateExperience(${exp.id}, 'company', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input type="text" value="${exp.position}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateExperience(${exp.id}, 'position', this.value)">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="month" value="${exp.startDate}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateExperience(${exp.id}, 'startDate', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="month" value="${exp.endDate}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   ${exp.current ? "disabled" : ""}
                   onchange="window.resumeBuilder.updateExperience(${exp.id}, 'endDate', this.value)">
          </div>
          <div class="flex items-center">
            <label class="flex items-center">
              <input type="checkbox" ${exp.current ? "checked" : ""} 
                     class="mr-2"
                     onchange="window.resumeBuilder.updateExperience(${exp.id}, 'current', this.checked)">
              <span class="text-sm text-gray-700">Current Position</span>
            </label>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows="3" class="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe your role and responsibilities..."
                    onchange="window.resumeBuilder.updateExperience(${exp.id}, 'description', this.value)">${exp.description}</textarea>
        </div>
        <button type="button" class="text-red-600 hover:text-red-800 text-sm"
                onclick="window.resumeBuilder.removeExperience(${exp.id})">
          <i class="fas fa-trash"></i> Remove Experience
        </button>
      </div>
    `,
      )
      .join("")
  }

  // Render education form
  renderEducationForm() {
    const container = document.getElementById("educationContainer")
    if (!container) return

    container.innerHTML = this.currentResume.education
      .map(
        (edu) => `
      <div class="education-item border border-gray-200 rounded-lg p-4 mb-4" data-id="${edu.id}">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <input type="text" value="${edu.institution}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateEducation(${edu.id}, 'institution', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Degree</label>
            <input type="text" value="${edu.degree}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateEducation(${edu.id}, 'degree', this.value)">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
            <input type="text" value="${edu.field}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateEducation(${edu.id}, 'field', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="month" value="${edu.startDate}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateEducation(${edu.id}, 'startDate', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="month" value="${edu.endDate}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateEducation(${edu.id}, 'endDate', this.value)">
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
          <input type="text" value="${edu.gpa}" 
                 class="w-full p-2 border border-gray-300 rounded-md"
                 placeholder="3.8/4.0"
                 onchange="window.resumeBuilder.updateEducation(${edu.id}, 'gpa', this.value)">
        </div>
        <button type="button" class="text-red-600 hover:text-red-800 text-sm"
                onclick="window.resumeBuilder.removeEducation(${edu.id})">
          <i class="fas fa-trash"></i> Remove Education
        </button>
      </div>
    `,
      )
      .join("")
  }

  // Render project form
  renderProjectForm() {
    const container = document.getElementById("projectContainer")
    if (!container) return

    container.innerHTML = this.currentResume.projects
      .map(
        (project) => `
      <div class="project-item border border-gray-200 rounded-lg p-4 mb-4" data-id="${project.id}">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input type="text" value="${project.name}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   onchange="window.resumeBuilder.updateProject(${project.id}, 'name', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
            <input type="text" value="${project.technologies.join(", ")}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   placeholder="React, Node.js, MongoDB"
                   onchange="window.resumeBuilder.updateProject(${project.id}, 'technologies', this.value.split(',').map(t => t.trim()))">
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows="3" class="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe the project and your contributions..."
                    onchange="window.resumeBuilder.updateProject(${project.id}, 'description', this.value)">${project.description}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
            <input type="url" value="${project.url}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   placeholder="https://project-demo.com"
                   onchange="window.resumeBuilder.updateProject(${project.id}, 'url', this.value)">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input type="url" value="${project.github}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   placeholder="https://github.com/username/project"
                   onchange="window.resumeBuilder.updateProject(${project.id}, 'github', this.value)">
          </div>
        </div>
        <button type="button" class="text-red-600 hover:text-red-800 text-sm"
                onclick="window.resumeBuilder.removeProject(${project.id})">
          <i class="fas fa-trash"></i> Remove Project
        </button>
      </div>
    `,
      )
      .join("")
  }

  // Render skills
  renderSkills() {
    const container = document.getElementById("skillsContainer")
    if (!container) return

    container.innerHTML = this.currentResume.skills
      .map(
        (skill) => `
      <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
        ${skill}
        <button type="button" class="ml-2 text-blue-600 hover:text-blue-800"
                onclick="window.resumeBuilder.removeSkill('${skill}')">
          <i class="fas fa-times"></i>
        </button>
      </span>
    `,
      )
      .join("")
  }

  // Update experience
  updateExperience(id, field, value) {
    const experience = this.currentResume.experience.find((exp) => exp.id === id)
    if (experience) {
      experience[field] = value
      this.renderPreview()
      this.saveResume()
    }
  }

  // Update education
  updateEducation(id, field, value) {
    const education = this.currentResume.education.find((edu) => edu.id === id)
    if (education) {
      education[field] = value
      this.renderPreview()
      this.saveResume()
    }
  }

  // Update project
  updateProject(id, field, value) {
    const project = this.currentResume.projects.find((proj) => proj.id === id)
    if (project) {
      project[field] = value
      this.renderPreview()
      this.saveResume()
    }
  }

  // Remove experience
  removeExperience(id) {
    this.currentResume.experience = this.currentResume.experience.filter((exp) => exp.id !== id)
    this.renderExperienceForm()
    this.renderPreview()
    this.saveResume()
  }

  // Remove education
  removeEducation(id) {
    this.currentResume.education = this.currentResume.education.filter((edu) => edu.id !== id)
    this.renderEducationForm()
    this.renderPreview()
    this.saveResume()
  }

  // Remove project
  removeProject(id) {
    this.currentResume.projects = this.currentResume.projects.filter((proj) => proj.id !== id)
    this.renderProjectForm()
    this.renderPreview()
    this.saveResume()
  }

  // Render preview
  renderPreview() {
    const previewContainer = document.getElementById("resumePreview")
    if (!previewContainer) return

    const template = this.templates[this.currentTemplate]
    if (!template) return

    previewContainer.innerHTML = template.render(this.currentResume)
  }

  // Get available templates
  getTemplates() {
    return {
      modern: {
        name: "Modern",
        render: (resume) => this.renderModernTemplate(resume),
      },
      classic: {
        name: "Classic",
        render: (resume) => this.renderClassicTemplate(resume),
      },
      minimal: {
        name: "Minimal",
        render: (resume) => this.renderMinimalTemplate(resume),
      },
    }
  }

  // Render modern template
  renderModernTemplate(resume) {
    return `
      <div class="bg-white p-8 shadow-lg max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-blue-600 pb-6 mb-6">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            ${resume.personalInfo.firstName || "First Name"} ${resume.personalInfo.lastName || "Last Name"}
          </h1>
          <p class="text-xl text-blue-600 mb-4">${resume.personalInfo.title || "Professional Title"}</p>
          <div class="flex flex-wrap gap-4 text-gray-600">
            ${resume.personalInfo.email ? `<span><i class="fas fa-envelope"></i> ${resume.personalInfo.email}</span>` : ""}
            ${resume.personalInfo.phone ? `<span><i class="fas fa-phone"></i> ${resume.personalInfo.phone}</span>` : ""}
            ${resume.personalInfo.location ? `<span><i class="fas fa-map-marker-alt"></i> ${resume.personalInfo.location}</span>` : ""}
            ${resume.personalInfo.linkedin ? `<span><i class="fab fa-linkedin"></i> ${resume.personalInfo.linkedin}</span>` : ""}
          </div>
        </div>

        <!-- Summary -->
        ${
          resume.summary
            ? `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-3">Professional Summary</h2>
            <p class="text-gray-700 leading-relaxed">${resume.summary}</p>
          </div>
        `
            : ""
        }

        <!-- Experience -->
        ${
          resume.experience.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-3">Work Experience</h2>
            ${resume.experience
              .map(
                (exp) => `
              <div class="mb-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">${exp.position}</h3>
                    <p class="text-blue-600 font-medium">${exp.company}</p>
                  </div>
                  <span class="text-gray-600 text-sm">
                    ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                ${exp.description ? `<p class="text-gray-700 mb-2">${exp.description}</p>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Education -->
        ${
          resume.education.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-3">Education</h2>
            ${resume.education
              .map(
                (edu) => `
              <div class="mb-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">${edu.degree} ${edu.field ? `in ${edu.field}` : ""}</h3>
                    <p class="text-blue-600 font-medium">${edu.institution}</p>
                  </div>
                  <span class="text-gray-600 text-sm">
                    ${edu.startDate} - ${edu.endDate}
                  </span>
                </div>
                ${edu.gpa ? `<p class="text-gray-700">GPA: ${edu.gpa}</p>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Skills -->
        ${
          resume.skills.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-3">Skills</h2>
            <div class="flex flex-wrap gap-2">
              ${resume.skills
                .map(
                  (skill) => `
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${skill}</span>
              `,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        <!-- Projects -->
        ${
          resume.projects.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-3">Projects</h2>
            ${resume.projects
              .map(
                (project) => `
              <div class="mb-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">${project.name}</h3>
                  <div class="text-sm text-gray-600">
                    ${project.url ? `<a href="${project.url}" class="text-blue-600 hover:underline mr-2">Demo</a>` : ""}
                    ${project.github ? `<a href="${project.github}" class="text-blue-600 hover:underline">GitHub</a>` : ""}
                  </div>
                </div>
                ${project.description ? `<p class="text-gray-700 mb-2">${project.description}</p>` : ""}
                ${
                  project.technologies.length > 0
                    ? `
                  <div class="flex flex-wrap gap-1">
                    ${project.technologies
                      .map(
                        (tech) => `
                      <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${tech}</span>
                    `,
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `
  }

  // Render classic template
  renderClassicTemplate(resume) {
    return `
      <div class="bg-white p-8 shadow-lg max-w-4xl mx-auto font-serif">
        <!-- Header -->
        <div class="text-center border-b border-gray-300 pb-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            ${resume.personalInfo.firstName || "First Name"} ${resume.personalInfo.lastName || "Last Name"}
          </h1>
          <p class="text-lg text-gray-600 mb-3">${resume.personalInfo.title || "Professional Title"}</p>
          <div class="text-gray-600 text-sm">
            ${resume.personalInfo.email || "email@example.com"} | 
            ${resume.personalInfo.phone || "(555) 123-4567"} | 
            ${resume.personalInfo.location || "City, State"}
          </div>
        </div>

        <!-- Summary -->
        ${
          resume.summary
            ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">PROFESSIONAL SUMMARY</h2>
            <p class="text-gray-700 leading-relaxed">${resume.summary}</p>
          </div>
        `
            : ""
        }

        <!-- Experience -->
        ${
          resume.experience.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">WORK EXPERIENCE</h2>
            ${resume.experience
              .map(
                (exp) => `
              <div class="mb-4">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-lg font-semibold text-gray-800">${exp.position}</h3>
                  <span class="text-gray-600 text-sm">
                    ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p class="text-gray-600 font-medium mb-2">${exp.company}</p>
                ${exp.description ? `<p class="text-gray-700">${exp.description}</p>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Education -->
        ${
          resume.education.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">EDUCATION</h2>
            ${resume.education
              .map(
                (edu) => `
              <div class="mb-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-800">${edu.degree} ${edu.field ? `in ${edu.field}` : ""}</h3>
                    <p class="text-gray-600">${edu.institution}</p>
                  </div>
                  <span class="text-gray-600 text-sm">
                    ${edu.startDate} - ${edu.endDate}
                  </span>
                </div>
                ${edu.gpa ? `<p class="text-gray-700 text-sm">GPA: ${edu.gpa}</p>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Skills -->
        ${
          resume.skills.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">SKILLS</h2>
            <p class="text-gray-700">${resume.skills.join(" • ")}</p>
          </div>
        `
            : ""
        }

        <!-- Projects -->
        ${
          resume.projects.length > 0
            ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">PROJECTS</h2>
            ${resume.projects
              .map(
                (project) => `
              <div class="mb-3">
                <h3 class="font-semibold text-gray-800">${project.name}</h3>
                ${project.description ? `<p class="text-gray-700 mb-1">${project.description}</p>` : ""}
                ${
                  project.technologies.length > 0
                    ? `
                  <p class="text-gray-600 text-sm">Technologies: ${project.technologies.join(", ")}</p>
                `
                    : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `
  }

  // Render minimal template
  renderMinimalTemplate(resume) {
    return `
      <div class="bg-white p-8 shadow-lg max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-light text-gray-800 mb-1">
            ${resume.personalInfo.firstName || "First Name"} ${resume.personalInfo.lastName || "Last Name"}
          </h1>
          <p class="text-gray-600 mb-4">${resume.personalInfo.title || "Professional Title"}</p>
          <div class="text-gray-500 text-sm space-y-1">
            ${resume.personalInfo.email ? `<div>${resume.personalInfo.email}</div>` : ""}
            ${resume.personalInfo.phone ? `<div>${resume.personalInfo.phone}</div>` : ""}
            ${resume.personalInfo.location ? `<div>${resume.personalInfo.location}</div>` : ""}
          </div>
        </div>

        <!-- Summary -->
        ${
          resume.summary
            ? `
          <div class="mb-8">
            <p class="text-gray-700 leading-relaxed">${resume.summary}</p>
          </div>
        `
            : ""
        }

        <!-- Experience -->
        ${
          resume.experience.length > 0
            ? `
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Experience</h2>
            ${resume.experience
              .map(
                (exp) => `
              <div class="mb-6">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-medium text-gray-800">${exp.position}</h3>
                  <span class="text-gray-500 text-sm">
                    ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p class="text-gray-600 mb-2">${exp.company}</p>
                ${exp.description ? `<p class="text-gray-700 text-sm">${exp.description}</p>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Education -->
        ${
          resume.education.length > 0
            ? `
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Education</h2>
            ${resume.education
              .map(
                (edu) => `
              <div class="mb-4">
                <div class="flex justify-between items-baseline">
                  <div>
                    <h3 class="font-medium text-gray-800">${edu.degree} ${edu.field ? `in ${edu.field}` : ""}</h3>
                    <p class="text-gray-600">${edu.institution}</p>
                  </div>
                  <span class="text-gray-500 text-sm">
                    ${edu.startDate} - ${edu.endDate}
                  </span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Skills -->
        ${
          resume.skills.length > 0
            ? `
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Skills</h2>
            <p class="text-gray-700">${resume.skills.join(", ")}</p>
          </div>
        `
            : ""
        }

        <!-- Projects -->
        ${
          resume.projects.length > 0
            ? `
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Projects</h2>
            ${resume.projects
              .map(
                (project) => `
              <div class="mb-4">
                <h3 class="font-medium text-gray-800">${project.name}</h3>
                ${project.description ? `<p class="text-gray-700 text-sm mb-1">${project.description}</p>` : ""}
                ${
                  project.technologies.length > 0
                    ? `
                  <p class="text-gray-500 text-xs">${project.technologies.join(", ")}</p>
                `
                    : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `
  }

  // Export to PDF
  exportToPDF() {
    if (window.Utils) {
      window.Utils.showNotification("PDF export feature coming soon!", "info")
    }

    // For now, open print dialog
    window.print()
  }

  // Export to HTML
  exportToHTML() {
    const template = this.templates[this.currentTemplate]
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.currentResume.personalInfo.firstName} ${this.currentResume.personalInfo.lastName} - Resume</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 py-8">
        ${template.render(this.currentResume)}
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${this.currentResume.personalInfo.firstName || "Resume"}_${this.currentResume.personalInfo.lastName || "Export"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    if (window.Utils) {
      window.Utils.showNotification("Resume exported as HTML!", "success")
    }
  }

  // Save resume to localStorage
  saveResume() {
    try {
      localStorage.setItem(window.CONFIG.STORAGE_KEYS.resumes, JSON.stringify(this.currentResume))
      console.log("Resume saved successfully")
    } catch (error) {
      console.error("Failed to save resume:", error)
    }
  }

  // Load saved resume
  loadSavedResume() {
    try {
      const saved = localStorage.getItem(window.CONFIG.STORAGE_KEYS.resumes)
      if (saved) {
        this.currentResume = { ...this.currentResume, ...JSON.parse(saved) }
        this.populateForm()
        console.log("Resume loaded successfully")
      }
    } catch (error) {
      console.error("Failed to load resume:", error)
    }
  }

  // Populate form with saved data
  populateForm() {
    // Populate personal info
    Object.keys(this.currentResume.personalInfo).forEach((key) => {
      const input = document.querySelector(`[name="${key}"]`)
      if (input) {
        input.value = this.currentResume.personalInfo[key]
      }
    })

    // Populate summary
    const summaryTextarea = document.getElementById("summary")
    if (summaryTextarea) {
      summaryTextarea.value = this.currentResume.summary
    }

    // Render dynamic sections
    this.renderExperienceForm()
    this.renderEducationForm()
    this.renderProjectForm()
    this.renderSkills()
  }

  // Clear all data
  clearResume() {
    if (confirm("Are you sure you want to clear all resume data? This action cannot be undone.")) {
      this.currentResume = {
        personalInfo: {},
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      }

      localStorage.removeItem(window.CONFIG.STORAGE_KEYS.resumes)

      // Clear form
      document.querySelectorAll("input, textarea").forEach((input) => {
        input.value = ""
      })

      // Re-render everything
      this.renderExperienceForm()
      this.renderEducationForm()
      this.renderProjectForm()
      this.renderSkills()
      this.renderPreview()

      if (window.Utils) {
        window.Utils.showNotification("Resume cleared successfully", "success")
      }
    }
  }
}

// Make it globally available
window.ResumeBuilder = ResumeBuilder
console.log("Resume Builder class loaded successfully")
