export const initialData = {
  instituteInfo: {
    name: "Goyal Coaching Centre",
    tagline: "Build a Better Future",
    subtitle: "Specialists in Class 8th–10th (Science & Maths) and Class 11th–12th (Commerce)",
    logo: "/goyal-logo.png",
    founded: "2010",
    director: "Goyal Sir (Director & Chief Administrator)",
    phone: "+91 98769 60163",
    email: "admin@goyalcoaching.edu.in",
    address: "SCO 42-45, Educational Complex, Sector 14, Main Road",
    city: "New Delhi",
    pinCode: "110001",
    timings: "Monday - Saturday: 3:00 PM - 8:30 PM | Sunday: 8:30 AM - 1:30 PM (Weekly Test Series)",
    branches: [
      { name: "Main Campus (Head Office)", address: "SCO 42-45, Sector 14, Main Road, New Delhi", phone: "+91 98769 60163" },
      { name: "North Branch (Model Town)", address: "Plot 18, Ring Road, Model Town Part 2, Delhi", phone: "+91 98111 22233" },
      { name: "East Hub (Preet Vihar)", address: "Metro Pillar 104, Main Vikas Marg, Preet Vihar, Delhi", phone: "+91 98222 33344" }
    ],
    stats: {
      studentsTrained: "6,800+",
      perfectCentums: "420+ (100/100 in Maths & Science)",
      boardMeritHolders: "99.2% (CBSE Class 10 & 12)",
      srccDuSelections: "185+ (Commerce Toppers)",
      successRate: "98.4%",
      batchSizeLimit: "30-35 Students Max"
    }
  },

  // Impact Stats Counter (15 Courses, 7286 Students, 25 Teachers)
  impactStats: {
    courses: 15,
    students: 7286,
    teachers: 25
  },

  // Centers & Learning Branches (Managed dynamically by Admin)
  centers: [
    {
      id: "center-bhikhi",
      name: "Goyal Coaching Centre - Bhikhi Center",
      city: "Bhikhi",
      district: "Mansa",
      state: "Punjab",
      pinCode: "151504",
      address: "Goyal Coaching Centre, Near Bus Stand / Main Market, Bhikhi, Mansa, Punjab 151504",
      phone: "+91 98769 60163",
      email: "bhikhi@goyalcoaching.edu.in",
      timings: "Monday – Saturday: 3:00 PM – 8:30 PM | Sunday: 8:30 AM – 1:30 PM",
      courses: "Class 8th–10th (Sci & Maths) • Class 11th–12th (Commerce) • GTSE Exam Center",
      googleMapsUrl: "https://maps.app.goo.gl/g8yZ71a2HLVsZrV67",
      embedMapUrl: "https://maps.google.com/maps?q=30.068777,75.5325527&hl=en&z=16&output=embed",
      isMain: true,
      status: "Active",
      badge: "Flagship Center"
    }
  ],

  // Big Group Photo of Students & Results Celebration (Configured via Admin Panel)
  resultsPhoto: {
    imageUrl: "",
    title: "Our Board Exam Champions & Result Achievers",
    subtitle: "Class 10th & 12th Board Toppers Celebrating 100/100 Perfect Scores & Top College Selections",
    year: "CBSE Board Results Celebration 2026",
    badge: "🏆 Results Felicitation & Hall of Fame",
    description: "Proud moments at Goyal Coaching Centre: Our students celebrating exceptional results with faculty mentors, qualified CAs, and Goyal Sir.",
    photos: []
  },

  // Main Administrator Account (Super Admin)
  admin: {
    username: "HARSHIT",
    password: "Harry@962008",
    name: "Harshit Goyal (Director & Main Administrator)",
    email: "contact@goyalcoaching.edu.in",
    phone: "9876960163",
    role: "admin",
    designation: "Founder & Director"
  },

  // Teachers / Faculty IAM Accounts
  teachers: [
    {
        "name": "Prerna",
        "username": "prerna",
        "password": "Prerna@963",
        "subject": "Mathematics (Class 9-10)",
        "qualification": "M.Sc / B.Ed",
        "phone": "9464539179",
        "email": "",
        "assignedBatches": [
            "Class 10 Board Champions"
        ],
        "id": "TCH-01",
        "status": "Active",
        "joiningDate": "2026-11-20"
    }
],

  // Students Database with passwords for isolated personal logins
  students: [],

  attendanceLogs: [],

  tests: [
    {
      id: "TST-101",
      title: "Class 10 CBSE Board Pattern Mock Exam #1 - Mathematics (Real Numbers & Trigonometry)",
      subject: "Mathematics",
      grade: "Class 10",
      batch: "Class 10th",
      date: "2026-11-15",
      maxMarks: 50,
      passingMarks: 20,
      highestMarks: 49,
      avgMarks: 42.5,
      type: "Offline Classroom Test",
      createdBy: "Er. Alok Goyal",
      createdAt: "2026-11-15T12:00:00.000Z",
      results: []
    },
    {
      id: "TST-102",
      title: "Class 10 Science Sunday Classroom Unit Test - Light: Reflection & Refraction",
      subject: "Science",
      grade: "Class 10",
      batch: "Class 10th",
      date: "2026-11-08",
      maxMarks: 40,
      passingMarks: 16,
      highestMarks: 38,
      avgMarks: 33.0,
      type: "Offline Classroom Test",
      createdBy: "Er. Alok Goyal",
      createdAt: "2026-11-08T12:00:00.000Z",
      results: []
    },
    {
      id: "TST-701",
      title: "Class 7 Mathematics Sunday Center Test - Fractions, Decimals & Integers",
      subject: "Mathematics",
      grade: "Class 7",
      batch: "Class 7th",
      date: "2026-11-16",
      maxMarks: 50,
      passingMarks: 20,
      highestMarks: 48,
      avgMarks: 41.6,
      type: "Offline Classroom Test",
      createdBy: "Er. Alok Goyal",
      createdAt: "2026-11-16T12:00:00.000Z",
      results: []
    }
  ],
  notices: [
    {
      id: "NTC-01",
      title: "Mandatory Parent-Teacher Meeting (PTM) for Class 10 & 12 Board Batches",
      date: "2026-11-16",
      category: "Compulsory Notice",
      priority: "Urgent",
      badge: "Mandatory PTM",
      content: "All parents of Class 10 (Science & Maths) and Class 12 (Commerce) are cordially requested to attend the PTM this Sunday from 9:30 AM to 1:00 PM. Pre-Board mock test answer sheets, handwriting improvement notes, and time-management strategies for the upcoming CBSE Board Examinations will be discussed."
    },
    {
      id: "NTC-02",
      title: "Special Sunday Board Answer-Sheet Presentation Workshop",
      date: "2026-11-12",
      category: "Academic",
      priority: "High",
      badge: "Board Strategy",
      content: "Special masterclass on CBSE official marking schemes: How to avoid step-mark deductions in Class 10 Mathematics & Class 12 Accountancy balance sheets. Model topper answer booklets will be distributed to every student."
    },
    {
      id: "NTC-03",
      title: "Winter Pre-Board 3-Hour Simulated Test Series Schedule Released",
      date: "2026-11-08",
      category: "Examination",
      priority: "Compulsory",
      badge: "Exam Schedule",
      content: "The date sheet for 3-hour Full Syllabus CBSE Simulated Board Tests (December 2026) is now published. 100% attendance is strictly compulsory for all registered students of Class 10 & Class 12."
    },
    {
      id: "NTC-04",
      title: "Goyal Talent Search Examination (GTSE Scholarship Exam) - Science, Maths & Commerce",
      date: "2026-11-01",
      category: "Scholarship",
      priority: "Normal",
      badge: "Scholarship Test",
      content: "Registration open for GTSE Scholarship Exam for students currently in Class 7, 8, 9, 10, and 11. Up to 100% tuition fee waivers available for top scorers in Science & Mathematics (8th-10th) and Commerce (11th-12th)."
    }
  ],
  courses: [
    {
      id: "course-class10",
      title: "Class 10th Board Champions (Science & Maths)",
      target: "Class 10 CBSE / ICSE Students",
      duration: "Full Academic Session (Target: 95%+ in Boards)",
      description: "Dedicated to achieving 100/100 in Class 10 Mathematics and Science. Rigorous NCERT line-by-line coverage, exemplar problem solving, daily home DPPs, and 20+ full-length 3-hour pre-board simulations.",
      features: [
        "100/100 Target in Mathematics & Science",
        "Step-by-step CBSE subjective answer writing drills",
        "Line-by-line NCERT + Exemplar + Previous 10 Yrs Papers",
        "Weekly Sunday Unit Tests & real-time Parent Portal reporting"
      ],
      fee: "₹38,000 / year",
      color: "from-blue-500 to-indigo-600",
      tag: "Board Toppers Batch"
    },
    {
      id: "course-class12commerce",
      title: "Class 12th Commerce Super League (Full Package)",
      target: "Class 12 Commerce Students",
      duration: "Full Academic Year + CUET Preparation",
      description: "The gold standard for Commerce students aiming for 98%+ in CBSE Board exams and top North Campus Delhi University colleges (SRCC, Hindu, Hansraj). Taught by Chartered Accountants and Senior Economists.",
      features: [
        "Complete Accountancy, Economics, Business Studies & Applied Maths",
        "Taught by Qualified CAs & Senior Economics Faculty",
        "Special adjustments in Partnership, Company Accounts & Cash Flow",
        "CUET Domain + General Test preparation included"
      ],
      fee: "₹48,000 / year",
      color: "from-amber-500 to-yellow-600",
      tag: "SRCC & Board Focus"
    },
    {
      id: "course-class9",
      title: "Class 9th Foundation Stars (Science & Maths)",
      target: "Class 9 CBSE Students",
      duration: "Full Academic Year",
      description: "Build unshakeable concepts in Mathematics (Polynomials, Geometry, Number Systems) and Science (Physics Motion/Forces, Chemistry Matter, Biology Cells) to guarantee school rank 1 and smooth transition to Class 10 boards.",
      features: [
        "Concept-first teaching with visual laboratory models",
        "Eliminates fear of Physics numericals and Math geometry",
        "Weekly chapter-wise objective + subjective tests",
        "Biometric daily attendance & instant parent WhatsApp updates"
      ],
      fee: "₹35,000 / year",
      color: "from-emerald-500 to-teal-600",
      tag: "Concept Mastery"
    },
    {
      id: "course-class11commerce",
      title: "Class 11th Commerce Pioneers",
      target: "Class 11 Commerce Students",
      duration: "Full Academic Year",
      description: "Master the foundational pillars of Commerce: Double Entry Bookkeeping, Journal Entries, Financial Statements, Microeconomics, and Business Principles. Prevents the common Class 11 percentage dip.",
      features: [
        "Comprehensive Accountancy (Journal to Balance Sheet)",
        "Microeconomics consumer & producer equilibrium mastery",
        "Applied Mathematics / Core Mathematics support",
        "Base building for CA Foundation & Class 12 Boards"
      ],
      fee: "₹44,000 / year",
      color: "from-purple-500 to-pink-600",
      tag: "Foundation for Class 12"
    },
    {
      id: "course-class8",
      title: "Class 8th Junior Prodigy (Science & Maths)",
      target: "Class 8 CBSE / ICSE Students",
      duration: "Full Academic Year",
      description: "Instill deep love for Mathematics and Science from middle school. Develops fast calculation skills, logical problem solving, and prepares students for future Olympiads and high school excellence.",
      features: [
        "Interactive Mental Math & Formula Drills",
        "Science practical concepts made fun and visual",
        "Small batches of maximum 25 students",
        "Regular feedback sessions with parents"
      ],
      fee: "₹30,000 / year",
      color: "from-cyan-500 to-blue-600",
      tag: "Middle School Prodigy"
    }
  ],
  toppers: [
    {
      name: "Meera Kapoor",
      exam: "CBSE Class 12th Commerce Board 2026",
      rank: "99.4% Aggregate (100 in Accounts & Eco)",
      college: "Admitted to SRCC (Shri Ram College of Commerce), Delhi University",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      quote: "Goyal Coaching Center's CA faculty simplified complex company accounts and partnership adjustments so thoroughly that the CBSE board exam felt just like our Sunday coaching mock tests!"
    },
    {
      name: "Rohan Singhal",
      exam: "CBSE Class 10th Board Exam 2026",
      rank: "99.2% Overall (100/100 in Maths & 99 in Science)",
      college: "School Topper • Delhi State Merit List",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      quote: "Goyal Sir's unique step-by-step method for math proofs and daily doubt counters turned my average scores into a perfect 100 in Class 10 boards."
    },
    {
      name: "Akshat Goyal",
      exam: "CBSE Class 12th Commerce 2026 & CUET",
      rank: "98.8% Aggregate • CUET 100 Percentile",
      college: "Admitted to Hindu College, Delhi University (B.Com Hons)",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      quote: "The Sunday test series, real-time parent portal updates, and continuous feedback from teachers kept me disciplined and on track throughout Class 12."
    }
  ],
  shiningStars: [
    {
      id: "star-1",
      name: "PRACHI",
      score: "670/720",
      exam: "NEET 2024",
      secondaryScore: "",
      secondaryExam: "",
      college: "GMC PATIALA",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      year: "2024"
    },
    {
      id: "star-2",
      name: "BHARTI GARG",
      score: "AIR 958",
      exam: "JEE ADVANCED 2024",
      secondaryScore: "99.98%ile",
      secondaryExam: "JEE MAIN 2024",
      college: "IIT DELHI",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      year: "2024"
    },
    {
      id: "star-3",
      name: "MEHUL SINGH",
      score: "99.03%ile",
      exam: "JEE MAIN 2026",
      secondaryScore: "",
      secondaryExam: "",
      college: "IIT ROORKEE",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      year: "2026"
    },
    {
      id: "star-4",
      name: "KASHISH",
      score: "99.04%ile",
      exam: "JEE MAIN 2026",
      secondaryScore: "",
      secondaryExam: "",
      college: "PEC CHANDIGARH",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      year: "2026"
    },
    {
      id: "star-5",
      name: "AKSHUN SINGLA",
      score: "AIR 9642",
      exam: "JEE ADVANCED 2026",
      secondaryScore: "99.06%ile",
      secondaryExam: "JEE MAIN 2026",
      college: "IIT ROORKEE",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      year: "2026"
    },
    {
      id: "star-6",
      name: "MEERA KAPOOR",
      score: "100/100",
      exam: "ACCOUNTS & ECO",
      secondaryScore: "99.4%",
      secondaryExam: "CBSE 12TH COMMERCE",
      college: "SRCC DELHI",
      photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      year: "2026"
    },
    {
      id: "star-7",
      name: "ROHAN SINGHAL",
      score: "100/100",
      exam: "CBSE 10TH MATHS",
      secondaryScore: "99.2%",
      secondaryExam: "DELHI STATE TOPPER",
      college: "DELHI MERIT HOLDER",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      year: "2026"
    }
  ],
  features: [
    {
      id: "feat-1",
      title: "Extra Support to Weaker Students",
      subtitle: "Special Doubt Counters & Foundation Hand-holding",
      iconKey: "users",
      iconUrl: "/features/feat-1.png",
      badge: "Student Care"
    },
    {
      id: "feat-2",
      title: "CCTV Campus",
      subtitle: "24/7 High-Definition Surveillance & Student Safety",
      iconKey: "cctv",
      iconUrl: "/features/feat-2.png",
      badge: "Campus Safety"
    },
    {
      id: "feat-3",
      title: "Pre-Planned Coursework & Planner",
      subtitle: "Daily NCERT Syllabus Roadmap & Timely Completion",
      iconKey: "calendar",
      iconUrl: "/features/feat-3.png",
      badge: "Planned Study"
    },
    {
      id: "feat-4",
      title: "Biometric Attendance",
      subtitle: "Automated Daily SMS & Parent Dashboard Alerts",
      iconKey: "fingerprint",
      iconUrl: "/features/feat-4.png",
      badge: "Parent Tracking"
    },
    {
      id: "feat-5",
      title: "Revision Classes & Self Study Zone",
      subtitle: "Distraction-Free AC Library & Faculty Supervision",
      iconKey: "library",
      iconUrl: "/features/feat-5.png",
      badge: "Study Zone"
    },
    {
      id: "feat-6",
      title: "Online Testing Lab",
      subtitle: "Computer-Based Test Engine for JEE / NEET / CUET",
      iconKey: "laptop",
      iconUrl: "/features/feat-6.png",
      badge: "Digital Testing"
    },
    {
      id: "feat-7",
      title: "Motivational & Counselling Sessions",
      subtitle: "Stress Management, Exam Mindset & Career Guidance",
      iconKey: "sparkles",
      iconUrl: "/features/feat-7.png",
      badge: "Mental Wellness"
    },
    {
      id: "feat-8",
      title: "Performance Analysis & Report",
      subtitle: "In-Depth Topic Analytics & Real-Time Weak Area Maps",
      iconKey: "chart",
      iconUrl: "/features/feat-8.png",
      badge: "Detailed Reports"
    },
    {
      id: "feat-9",
      title: "Lecture Recording Lab",
      subtitle: "High-Quality Video Backups for Revision & Missed Classes",
      iconKey: "video",
      iconUrl: "/features/feat-9.png",
      badge: "HD Backups"
    },
    {
      id: "feat-10",
      title: "Objective + Subjective",
      subtitle: "Dual Pattern Tests with CBSE Step-Marking Review",
      iconKey: "filecheck",
      iconUrl: "/features/feat-10.png",
      badge: "Dual Pattern"
    },
    {
      id: "feat-11",
      title: "Smart AC Classrooms",
      subtitle: "Ergonomic Seating, Digital Projection & Soundproof Comfort",
      iconKey: "airvent",
      iconUrl: "/features/feat-11.png",
      badge: "Modern Campus"
    }
  ],
  exploreCourses: [
    {
      id: "course-foundation",
      title: "Foundation (Class 7-10)",
      description: "Build a strong academic base with our structured curriculum for students in classes 7 to 10.",
      iconKey: "book",
      points: [
        "Mathematics",
        "Science"
      ],
      classes: [
        "Class 7",
        "Class 8",
        "Class 9",
        "Class 10"
      ]
    },
    {
      id: "course-commerce",
      title: "Commerce (Class 11-12)",
      description: "Comprehensive board exam preparation covering all core Commerce subjects for Class 11 and 12.",
      iconKey: "briefcase",
      points: [
        "Accountancy",
        "Economics",
        "Business Studies",
        "Mathematics / Applied Maths"
      ],
      classes: [
        "Class 11",
        "Class 12"
      ]
    },
    {
      id: "course-accounts-eco",
      title: "Accounts & Economics Special",
      description: "Focused conceptual clarity, numerical practice, and board exam mastery in core subjects:",
      iconKey: "calculator",
      points: [
        "Financial & Corporate Accounts",
        "Micro & Macro Economics",
        "Indian Economic Development"
      ],
      classes: [
        "Class 11",
        "Class 12"
      ]
    }
  ],

  // Student Academic Doubts Counter & Ticket Desk
  doubts: [
    {
      id: "DBT-501",
      studentName: "Aarav Gupta",
      rollNo: "GCC-102",
      grade: "Class 10",
      subject: "Mathematics",
      topic: "Quadratic Equations - Nature of Roots & Word Problems",
      question: "In exercise 4.4 word problem 3, how to correctly frame the speed equation for the express train vs passenger train?",
      status: "Resolved",
      priority: "High",
      assignedTeacher: "Goyal Sir",
      date: "2026-11-19",
      reply: "Assume speed of passenger train = x km/h. Speed of express train = (x + 11) km/h. Distance = 132 km. Equation: 132/x - 132/(x+11) = 1. Fully solved on doubt board."
    },
    {
      id: "DBT-502",
      studentName: "Priya Goyal",
      rollNo: "GCC-101",
      grade: "Class 12",
      subject: "Accountancy",
      topic: "Forfeiture & Re-issue of Shares (Sec 52 Premium Rules)",
      question: "When shares issued at a premium are forfeited, is Securities Premium Account debited if premium was already received?",
      status: "Resolved",
      priority: "Normal",
      assignedTeacher: "CA Deepak Goyal",
      date: "2026-11-19",
      reply: "No. Under Section 52(2) of the Companies Act, once Securities Premium is received, it cannot be debited/reversed on subsequent forfeiture."
    },
    {
      id: "DBT-503",
      studentName: "Ananya Sharma",
      rollNo: "GCC-103",
      grade: "Class 10",
      subject: "Science (Physics)",
      topic: "Light - Refraction through Triangular Glass Prism",
      question: "Need clarification on angle of deviation (D = i + e - A) formula and the ray tracing conditions for minimum deviation.",
      status: "Pending",
      priority: "Urgent",
      assignedTeacher: "Dr. Anita Jain",
      date: "2026-11-20",
      reply: ""
    },
    {
      id: "DBT-504",
      studentName: "Rohan Varma",
      rollNo: "GCC-104",
      grade: "Class 11",
      subject: "Economics",
      topic: "Consumer's Equilibrium - Indifference Curve Analysis",
      question: "Why is the Marginal Rate of Substitution (MRSxy = Px/Py) strictly diminishing along a convex indifference curve?",
      status: "Pending",
      priority: "Normal",
      assignedTeacher: "CA Deepak Goyal",
      date: "2026-11-20",
      reply: ""
    },
    {
      id: "DBT-505",
      studentName: "Aman Kumar",
      rollNo: "GCC-105",
      grade: "Class 9",
      subject: "Science (Chemistry)",
      topic: "Atoms and Molecules - Mole Concept & Avogadro Constant",
      question: "How to calculate the number of aluminium ions present in 0.051 g of aluminium oxide (Al2O3)?",
      status: "In Progress",
      priority: "High",
      assignedTeacher: "Dr. Anita Jain",
      date: "2026-11-20",
      reply: "Assigned to today's 5:30 PM Doubt Counter desk."
    },
    {
      id: "DBT-506",
      studentName: "Simran Kaur",
      rollNo: "GCC-106",
      grade: "Class 12",
      subject: "Business Studies",
      topic: "Principles of Management - Taylor vs Fayol Techniques",
      question: "What is the key difference between Functional Foremanship (Taylor) and Unity of Command (Fayol)?",
      status: "Resolved",
      priority: "Normal",
      assignedTeacher: "Goyal Sir",
      date: "2026-11-18",
      reply: "Functional foremanship violates Unity of Command because each worker gets orders from 8 specialists. Remember Fayol advocates 1 boss."
    }
  ],
  assignments: [
    {
      id: "ASG-101",
      title: "Class 10 Mathematics: Quadratic Equations & AP Sheet",
      subject: "Mathematics",
      grade: "Class 10",
      batch: "Class 10 Board Champions",
      dueDate: "2026-11-25",
      totalMarks: 25,
      description: "Solve all 5 questions on clean ruled sheets. Show step-by-step discriminant calculations and roots. Click clear photos and upload your answer sheet before Friday 5:00 PM.",
      photos: [
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
      ],
      createdAt: "2026-11-18T10:00:00.000Z",
      createdBy: "Er. Alok Goyal",
      submissions: []
    },
    {
      id: "ASG-102",
      title: "Class 10 Science: Light Reflection & Spherical Mirrors DPP-04",
      subject: "Science",
      grade: "Class 10",
      batch: "Class 10 Board Champions",
      dueDate: "2026-11-28",
      totalMarks: 20,
      description: "Draw ray diagrams for concave and convex mirrors for all 6 object positions using sharp pencil and scale. Calculate focal lengths with standard mirror formula.",
      photos: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
      ],
      createdAt: "2026-11-19T11:00:00.000Z",
      createdBy: "Er. Alok Goyal",
      submissions: []
    }
  ]
};
