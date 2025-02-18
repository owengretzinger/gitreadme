<div align="center">
  <a href="https://readme-generator-psi.vercel.app/readme">
    <img src="https://readme-generator-psi.vercel.app/favicon.ico" alt="HackMate Logo" width="80" height="80">
  </a>

<h3 align="center">README Generator</h3>
  <p align="center">
    Generate READMEs and architecture diagrams using AI that understands your codebase
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
- **Architecture Diagram Generation:** Creates architecture diagrams to visualize the structure of your project.
- **Integration with Vertex AI:** Leverages Google Cloud Vertex AI for AI-powered features.
- **Next.js Frontend:** Modern and responsive user interface built with Next.js.
- **TRPC API:** Type-safe API communication between frontend and backend.
- **Authentication:** Secure user authentication using NextAuth.js and Google Provider.

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

## Todo

- [ ] Fix bug where error shows for a split second on the view readme page before redirecting
- [ ] Not refetching stuff when clicking logo in nav instead of back button
- [ ] Make repo packer internal server more descriptive
- [ ] Make pen in logo orange instead of yellow, make background lighter in favicon
- [ ] Save to DB when editing generated README
- [ ] New font
- [ ] Add FAQ
- [ ] Get a domain name
- [ ] Film demo video
