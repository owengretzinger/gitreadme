<div align="center">
  <img src="https://gitreadme.dev/favicon.ico" alt="gitreadme.dev Logo" width="80" height="80">

<h3 align="center"><a href="https://gitreadme.dev">gitreadme.dev</a></h3>
  <p align="center">
    Instantly generate high-quality README files using AI that understands your codebase
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <!-- <li><a href="#demo">Demo</a></li> -->
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
  </ol>
</details>

## About The Project

This project was originally built as part of [HackMate](https://github.com/owengretzinger/hackmate) for the GDG Mac-a-Thon 2025, which won 1st overall.

<!-- ### Demo

<div align="center">
  <a href="https://youtu.be/sD66NuLWxFw?si=YTVOI7qggv-7y0mL&t=23">
    <img src="https://github.com/user-attachments/assets/6153bf9a-325a-4df2-a8c7-3f9afab40a38" alt="HackMate Demo">
  </a>
  <p>
    Click the image to see a short demo (HackMate demo video)
  </p>
</div> -->

### Key Features

- **AI-Powered README Generation:** Generates README files using AI that understands your codebase.
- **Customizable Templates:** Allows users to select from a variety of README templates to customize the look and feel of their README files.
- **File Exclusion:** Allows users to exclude specific files from the analysis process to reduce token count and improve accuracy.
- **Additional Instructions:** Allows users to provide additional instructions to the AI to further customize the generated README files.
- **Rate Limiting:** Implements rate limiting to prevent abuse and ensure fair usage for all users.
- **User Authentication:** Secure user authentication using NextAuth.js and Google Provider.
- **Dashboard:** Allows users to view and manage their generated README files.

## Architecture

- **Frontend:**
  - Next.js (T3 Stack)
  - TypeScript
  - Shadcn UI
  - Tailwind CSS
  - Next-themes for dark/light mode support
- **Backend (Next.js)**
  - tRPC (type-safe communication between frontend and backend)
  - Postgres Database (hosted on Neon)
  - Drizzle ORM with drizzle-kit for migrations
  - Vercel for deployment
- **Repo Packing Service:**
  - Python
  - gitingest
  - Google Cloud Run
