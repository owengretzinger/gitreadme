export const MOCK_REPO_CONTENT = `
# Repository Structure
/src
  /components
    - mermaid.tsx
    - ui/
  /pages
    - index.tsx
    - api/
  /utils
    - vertex-ai.ts
/public
  - assets/
/docs
  - README.md
`;

export const EXAMPLE_README = `# HackMate: Your AI-Powered Hackathon Companion

## 🎯 Overview

HackMate is an intelligent assistant designed to help hackathon participants excel in their projects. It combines project analysis, documentation automation, and pitch optimization to give teams a competitive edge.

## 🚀 Key Features

### 1. Project Insight Engine

- **Scrapes and analyzes winning hackathon projects:** HackMate scours platforms like Devpost to gather data on successful projects.
- **Provides similarity analysis:** This feature helps teams validate the uniqueness of their project idea by comparing it to existing solutions.
- **Offers intelligent suggestions:** Based on successful project patterns, HackMate provides tailored recommendations to enhance project feasibility and innovation.

### 2. Documentation Autopilot

- **Generates comprehensive README files:** HackMate automatically creates well-structured README files that provide clear project context.
- **Creates automatic architecture diagrams:**  Visualize your project's structure effortlessly with automated architecture diagrams generated from your codebase.
- **Ensures clear project documentation:**  HackMate ensures your project is well-documented for judges, making it easier for them to understand your work.

### 3. Pitch Perfect Assistant

- **Analyzes pitch recordings:** HackMate analyzes your pitch recordings to identify areas for improvement.
- **Provides structured feedback:**  Receive actionable feedback on your pitch, including suggestions for clarity, flow, and impact.
- **Helps teams craft compelling project narratives:** HackMate guides teams in crafting a compelling story that effectively communicates the value of their project.

## 🛠️ Tech Stack

### Frontend

- **Next.js** with T3 Stack (create-t3-app): A powerful framework for building modern web applications with server-side rendering and static site generation.
- **TypeScript:** Ensures type safety and code maintainability.
- **Tailwind CSS:** A utility-first CSS framework for rapid and consistent styling.
- **tRPC:** Provides a type-safe way to communicate between the frontend and backend.

### Backend & Database

- **Firebase:** A comprehensive backend platform offering database, authentication, and serverless functions.
- **Firestore:** A NoSQL database for storing and managing project data.
- **Google Cloud Functions:** Serverless computing platform for running backend logic.

### AI/ML Services (Google Cloud)

- **Vertex AI:**  Google's managed machine learning platform for building and deploying AI models.
- **Speech-to-Text API:** Transcribes audio recordings for pitch analysis.
- **Natural Language API:**  Provides natural language understanding capabilities for documentation generation.

### Development Tools

- **Firebase CLI:**  Command-line interface for interacting with Firebase services.
- **Google Cloud SDK:**  Command-line tools for managing Google Cloud resources.
- **TypeScript:**  A superset of JavaScript that adds static typing.
- **ESLint & Prettier:**  Tools for code linting and formatting.

## 🌟 Why These Technologies?

- **Aligned with GDSC Mac-a-Thon requirements:**  HackMate leverages Google Cloud technologies to meet the competition's guidelines.
- **Enables rapid development with production-ready features:**  The T3 Stack and Firebase provide a robust and efficient foundation for building a feature-rich application.
- **Strong typing and developer experience:**  TypeScript and tRPC ensure type safety and a smooth development workflow.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.`;

export const EXAMPLE_DIAGRAM = `graph TD
    subgraph Bot
        A[Discord Bot] --> B[Command Handler]
        B --> C[Cogs]
    end
    
    subgraph Cogs
        C --> D[Help Commands]
        C --> E[Insight Commands]
        C --> F[Misc Commands]
    end
    
    subgraph Data
        E --> G[Server Archive]
        E --> H[Swear Words]
        E --> I[Prefixes]
    end
    
    subgraph Services
        E --> J[Matplotlib]
        E --> K[Discord API]
    end
    
    subgraph External
        J --> L[Graphing Library]
        K --> M[Discord Servers]
    end`;

export const MOCK_PITCH_DRAFT = `## HackMate: Your AI-Powered Hackathon Companion

**Quick Intro (1 min)**

* **Hook:** Imagine a hackathon where you have an AI sidekick that helps you build a winning project, document it flawlessly, and deliver a killer pitch. That's HackMate!
* **Problem:** Hackathons are intense, requiring teams to juggle coding, documentation, and presentation. It's hard to stand out from the crowd.
* **Solution:** HackMate is an AI-powered assistant that streamlines the entire hackathon process, giving you a competitive edge.
* **Value Proposition:** HackMate helps you build better projects, document them effectively, and deliver impactful pitches, maximizing your chances of winning.

**Technical Overview (2 mins)**

* **Focus on the core features:**
* **Project Insight Engine:** Powered by Vertex AI, it analyzes winning hackathon projects from platforms like Devpost, providing insights on project uniqueness and suggesting winning patterns.
* **Documentation Autopilot:** Leveraging Google Cloud's Natural Language API, it automatically generates comprehensive READMEs, architecture diagrams, and ensures clear documentation for judges.
* **Pitch Perfect Assistant:** Using Google Cloud's Speech-to-Text API, it analyzes pitch recordings, provides structured feedback, and suggests improvements based on successful presentations.
* **Highlight the tech stack:**
* **Frontend:** Next.js with T3 Stack for rapid development, TypeScript for type safety, Tailwind CSS for styling, and tRPC for type-safe API calls.
* **Backend & Database:** Firebase for backend services, Firestore for database, and Google Cloud Functions for serverless computing.
* **Emphasize the benefits of the chosen technologies:**
* Aligned with GDSC Mac-a-Thon requirements.
* Enables rapid development with production-ready features.
* Strong typing and developer experience with T3 Stack.

**Live Demo Script (3 mins)**

* **Demo 1: Project Insight Engine:**
* **Show:** Input a project idea into HackMate.
* **Highlight:** The AI analyzes similar projects and provides insights on uniqueness, potential improvements, and relevant trends.
* **Demo 2: Documentation Autopilot:**
* **Show:** Connect a codebase to HackMate.
* **Highlight:** The AI generates a comprehensive README file, architecture diagrams, and ensures clear project documentation.
* **Demo 3: Pitch Perfect Assistant:**
* **Show:** Record a pitch using HackMate.
* **Highlight:** The AI analyzes the pitch, provides structured feedback on content, delivery, and suggests improvements based on successful presentations.

**Innovation Highlights (2 mins)**

* **Unique combination of features:** HackMate is the only solution that combines project analysis, documentation automation, and pitch optimization in one platform.
* **AI-powered insights:** Leveraging cutting-edge AI technologies, HackMate provides actionable insights that help teams make informed decisions and improve their projects.
* **Time-saving and efficient:** HackMate automates tedious tasks, allowing teams to focus on building innovative solutions and delivering impactful presentations.

**Future Roadmap (1 min)**

* **Integration with other hackathon platforms:** Expand support to other platforms like HackerRank and Major League Hacking.
* **Personalized recommendations:** Develop a system that provides personalized recommendations based on team skills and project goals.
* **Gamification and community features:** Introduce gamification elements and community features to enhance user engagement and learning.

**Delivery Tips:**

* **Be enthusiastic and passionate:** Show your excitement for the project and its potential impact.
* **Use clear and concise language:** Explain complex concepts in a way that is easy to understand.
* **Engage the audience:** Ask questions, encourage interaction, and make the presentation interactive.
* **Practice your delivery:** Rehearse the presentation multiple times to ensure a smooth and confident delivery.

**Remember:** Focus on the value proposition and the benefits HackMate provides to hackathon participants. Highlight the unique features and the potential for future growth. Good luck with your pitch!`;

export const MOCK_PITCH_FEEDBACK = `Great pitch! Here's my feedback:

1. Clarity and structure
- Strong opening hook that immediately captures attention
- Clear problem-solution structure
- Well-organized sections with good flow

2. Pacing and timing
- Good time management across sections
- Quick intro is appropriately concise
- Technical overview could be slightly more condensed

3. Key points coverage
- Excellent coverage of core features
- Strong emphasis on technical stack
- Clear value proposition

4. Engagement and delivery
- Enthusiastic and confident tone
- Good use of rhetorical questions
- Interactive elements well incorporated

5. Technical explanation quality
- Clear explanation of complex features
- Good balance of technical depth and accessibility
- Strong emphasis on practical benefits

6. Improvement suggestions
- Consider adding a brief customer testimonial or use case
- Could include more specific metrics or benchmarks
- Add a stronger call to action at the end`;
