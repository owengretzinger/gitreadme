<div align="center">
  <img src="https://gitreadme.dev/favicon.ico" alt="gitreadme.dev Logo" width="80" height="80">

<h3 align="center"><a href="https://gitreadme.dev">gitreadme.dev</a></h3>
  <p align="center">
    Instantly generate high-quality README files using AI that understands your codebase
  </p>
</div>

<!-- <div align="center">
  <a href="https://example.com">
    <img src="https://github.com/user-attachments/assets/f45c9ee9-ad2f-40f4-bb60-e9bbd1472c45" alt="Project Demo">
    <p>Watch Demo Video</p>
  </a>
</div> -->

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
    <li><a href="#support-feedback">Support & Feedback</a></li>
    <li><a href="#todo">Todo</a></li>
  </ol>
</details>

## About The Project

Using gitreadme.dev is as simple as inputting a repository URL and hitting generate. You can also replace "github.com" with "gitreadme.dev" inside any GitHub repo to immediately start generating a README for that repo.

Optionally, you can select & edit a template, provide additional instructions, and exclude specific files/folders from the analysis process.

Every generated README is assigned a unique URL so that it can be viewed and edited later, or even shared with others.

gitreadme.dev was originally built as part of [HackMate](https://github.com/owengretzinger/hackmate) for the GDG Mac-a-Thon 2025 (1st overall).

### Key Features

- **Customizable Templates:** Select from and customize a variety of templates to customize the look and feel of your README.
- **File Exclusion:** Exclude specific files/folders from the analysis process to reduce token count.
- **Additional Instructions:** Provide additional instructions to the AI to further customize the generated README files.
- **Save & Share:** README files are stored in a database with a unique URL and can be viewed and shared with others.
- **User Authentication:** Secure user authentication using NextAuth.js and Google Provider.
- **Dashboard:** View and manage generated README files.

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

## Support & Feedback

Reach out via email (owengretzinger@gmail.com) or LinkedIn (https://www.linkedin.com/in/owengretzinger/) with any questions or feedback.

If this tool was helpful to you, please give it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=owengretzinger/gitreadme&type=Date)](https://star-history.com/#owengretzinger/gitreadme&Date)

## Todo

- [ ] doesn't handle error when directly opening an invalid readme url