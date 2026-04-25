const dashboardMockData = {
  siteUrl: 'https://demo-clinic.example',
  scannedAt: new Date().toISOString(),
  status: 'Report ready',
  pagesScanned: 4,
  reportReady: true,
  githubConnected: false,
  violations: [
    {
      id: 'v-001',
      impact: 'critical',
      ruleId: 'color-contrast',
      title: 'Primary appointment button has insufficient contrast',
      description:
        'The foreground and background colors on the booking CTA fail minimum contrast requirements for normal text.',
      pageUrl: 'https://demo-clinic.example/',
      target: '.hero-book-now',
      snippet: '<button class="hero-book-now">Book Appointment</button>',
      whyItMatters:
        'Low contrast makes critical patient actions difficult for users with low vision, especially under bright ambient conditions.',
      helpText: 'Ensure at least 4.5:1 contrast ratio for normal text content.',
      resolved: false,
      category: 'visual',
    },
    {
      id: 'v-002',
      impact: 'serious',
      ruleId: 'label',
      title: 'Patient name input is missing an associated label',
      description:
        'The form control relies on placeholder text and is not programmatically connected to an accessible label.',
      pageUrl: 'https://demo-clinic.example/appointments',
      target: 'input[name="patientName"]',
      snippet: '<input name="patientName" placeholder="Patient name" />',
      whyItMatters:
        'Screen reader users may not reliably identify the control purpose during form completion.',
      helpText: 'Use <label for> with matching input id or aria-label when needed.',
      resolved: false,
      category: 'forms',
    },
    {
      id: 'v-003',
      impact: 'moderate',
      ruleId: 'image-alt',
      title: 'Service card imagery is missing alternative text',
      description:
        'Informational images on key service cards do not include descriptive alt attributes.',
      pageUrl: 'https://demo-clinic.example/services',
      target: '.service-card img',
      snippet: '<img src="/images/cardiology.png" />',
      whyItMatters:
        'People using assistive technologies miss meaningful context when alt text is absent.',
      helpText: 'Provide concise and meaningful alt text for non-decorative images.',
      resolved: false,
      category: 'content',
    },
    {
      id: 'v-004',
      impact: 'minor',
      ruleId: 'link-name',
      title: 'Footer link text is too generic',
      description:
        'Link text like "Click here" does not clearly communicate destination when read out of context.',
      pageUrl: 'https://demo-clinic.example/contact',
      target: '.footer-link-2',
      snippet: '<a href="/insurance">Click here</a>',
      whyItMatters:
        'Ambiguous link names reduce navigation clarity for keyboard and screen reader users.',
      helpText: 'Use descriptive link text that reflects page destination or action.',
      resolved: false,
      category: 'navigation',
    },
  ],
}

export default dashboardMockData
