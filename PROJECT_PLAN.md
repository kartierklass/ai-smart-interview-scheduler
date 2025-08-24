AI Smart Interview Scheduler — Master Blueprint (v2)
1. Vision
To build a real-time, AI-powered interview scheduling platform using a modern, stable tech stack. The core features are a "Saturn-inspired" batch allocation engine, automated Google Calendar integration, and an AI model that optimizes schedules to reduce conflicts and maximize interviewer utilization.

2. Technical Stack
Framework: Next.js 14 (App Router)

Styling: Tailwind CSS and Shadcn/ui

Authentication: Auth.js (v5) with Google Provider

Database: Firebase Firestore (for real-time data)

AI Engine: OpenAI API (GPT-4)

Calendar Integration: Google Calendar API

3. Detailed Build Plan
Phase 1: Foundation & Modern Authentication

Goal: Create the project and implement a stable, secure login system using the latest official packages.

Steps:

Initialize Next.js 14 project with TypeScript and Tailwind CSS. (✅ Done).

Set up all necessary environment variables for Google and Auth.js in .env.local.

Implement user login/logout using Auth.js (v5). The UI should show "Login" or "Logout" based on user state.

Phase 2: Core UI & Database Connection

Goal: Create the main dashboard and connect it to a live database.

Steps:

Create a protected /dashboard page, only accessible after login.

Create an AddInterviewerForm component to add new interviewers (name, email) to the interviewers collection in Firestore.

Create an InterviewerList component to display all interviewers from Firestore in real-time.

Phase 3: The 'Saturn Principle' Batch Allocation Engine

Goal: Build the main feature for scheduling multiple interviews at once.

Components:

A BatchUploadForm component on the dashboard for uploading a CSV of candidates.

A multi-select dropdown to choose from the available interviewers.

A ResultsDisplay component to show the AI-generated schedule before confirming.

Phase 4: The AI Scheduling Engine & Calendar Sync

Goal: Create the backend logic to generate schedules and create calendar events.

Steps:

Create a Next.js API route (/api/generate-schedule) that takes the batch data and uses a sophisticated prompt to get an optimized schedule from the OpenAI API.

Create another API route (/api/confirm-schedule) that takes the final schedule, uses the Google Calendar API to create events, and updates Firestore.

Phase 5: Final Touches

Goal: Polish the project for presentation.

Steps:

Write a comprehensive README.md file detailing the features and modern tech stack.

Push the final, clean code to GitHub.