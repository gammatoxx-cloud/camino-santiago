# Camino de Santiago con Magnolias

A beautiful, mobile-first web application for a 52-week progressive training program designed to prepare women aged 40-65 for walking the Camino de Santiago.

## Features

- 🚶 **52-Week Progressive Training Program** - Structured phases from beginner to advanced
- 📱 **Mobile-First Design** - Optimized for one-handed mobile use with glassmorphic UI
- 🔒 **Progressive Phase Unlocking** - Complete current phase to unlock the next
- ✅ **Walk Tracking** - Mark daily walks as complete with easy tap interactions
- 📊 **Progress Visualization** - See your weekly and phase progress at a glance
- 👤 **User Profiles** - Track your journey with personalized profiles

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom glassmorphic design
- **Supabase** for authentication, database, and backend services
- **React Router** for navigation
- **Date-fns** for date calculations

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account and project

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your Supabase database:

   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Run the SQL script from `SUPABASE_SETUP.md`

3. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

4. Start the development server:

```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # Navigation and layout components
│   ├── training/      # Training-specific components
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utilities, Supabase client, training data
├── pages/             # Route components
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component with routing
└── main.tsx           # Application entry point
```

## Design System

- **Main Background**: Warm cream (#e7e3d0)
- **Accent Color**: Deep teal (#0c4c6d)
- **Glassmorphic Elements**: Semi-transparent white cards with backdrop blur
- **Typography**: Large, readable fonts optimized for 40-65 age group
- **Touch Targets**: Minimum 44px for mobile accessibility

## Training Program

The app includes a complete 52-week training program divided into 5 phases:

1. **Phase 1: Adaptation** (Weeks 1-8) - Build foundation and habits
2. **Phase 2: Progressive Increase** (Weeks 9-20) - Gradually increase distance
3. **Phase 3: Consolidation** (Weeks 21-36) - Build strength and stamina
4. **Phase 4: Advanced Endurance** (Weeks 37-48) - Long-distance preparation
5. **Phase 5: Peak Preparation** (Weeks 49-52) - Peak distances and tapering

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to any static hosting service.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Configure environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
     - `VITE_MAPBOX_API_KEY` = your Mapbox API key (optional, only needed for geocoding features)

4. Vercel will automatically detect Vite and use the build command: `npm run build`

5. Your app will be deployed automatically on every push to your main branch

### Environment Variables

For production deployment, ensure these environment variables are set:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

**Optional:**
- `VITE_MAPBOX_API_KEY` - Your Mapbox API key (only needed if using address geocoding features)

⚠️ **Important**: Never commit `.env` files to version control. The `.env.example` file serves as a template.

### Supabase Edge Functions

If you're using Supabase Edge Functions (e.g., `wix-payments`), these must be deployed separately to your Supabase project using the Supabase CLI or Dashboard. They are not deployed with the Vercel application.

## License

This project is private and proprietary.

