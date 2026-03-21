# StudyForge AI - Frontend Application

This directory contains the Next.js frontend for **StudyForge AI**, an adaptive AI-powered study planning and coaching system. 
The application provides a gorgeous, modern UI for interacting with the Machine Learning and LLM APIs served by the backend.

## 🌟 Key Features
- **Dashboard & Analytics**: Track active students, optimization hours, XP, and weekly study streaks.
- **Adaptive Planner UI**: Easily input your upcoming exam details and course difficulty to receive a tailored Groq LLM study plan.
- **AI Chat Tutor**: A seamlessly integrated LLM chat interface providing context-aware answers to student questions based on their generated study schedule.
- **Progress Tracking**: Log your actual study hours and test scores, updating your live mastery stats.
- **Responsive & Dynamic Design**: Built with Next.js 15, React 19, and TailwindCSS 4, featuring a beautiful dark/light mode adaptable layout with micro-animations.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and NPM installed. Also ensure your FastAPI backend is running locally on port `8000` or hosted remotely.

### Installation
Clone the repository, navigate into this frontend folder, and install the modules:

```bash
cd ai-study-planner-frontend
npm install
```

### Environment Variables
For local development, the application defaults to connecting to `http://127.0.0.1:8000/`. 
If you are deploying to Vercel, simply provide the URL of your Render backend as an environment variable in your Vercel project settings:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-app.onrender.com
```

### Running the App Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the outcome.

## 🌐 Deployment
This front-end is fully optimized to be deployed seamlessly on **Vercel**. 
1. Link your GitHub repository to Vercel.
2. Select the `ai-study-planner-frontend` directory as the Root Directory.
3. Configure the `NEXT_PUBLIC_API_BASE_URL` Environment Variable to point to your live backend.
4. Click **Deploy**.
