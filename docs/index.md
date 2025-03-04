# Spots Documentation

Welcome to the Spots documentation! This guide will help you understand the application architecture, development workflow, and codebase organization.

## Overview

Spots is a location discovery application that provides personalized recommendations for places based on user interests and context. The app uses advanced AI capabilities through the Vercel AI SDK to deliver tailored suggestions and natural language interaction.

## Tech Stack

Spots is built with modern technologies:

- **Frontend**:
  - React 19 with Server and Client Components
  - Next.js 15 with App Router
  - Tailwind CSS 4 for styling
  - shadcn/ui (canary) for UI components
  - Zustand for client-side state management
  - useSWR for data fetching

- **Backend**:
  - Next.js API Routes with Edge Runtime
  - NextAuth.js for authentication
  - Prisma ORM with PostgreSQL
  - Upstash for Redis caching

- **AI Integration**:
  - Vercel AI SDK for AI model integration
  - OpenAI API for natural language processing

- **Infrastructure**:
  - Vercel for deployment and hosting
  - Vercel Edge Network for global distribution
  - PostgreSQL on Vercel Storage or Railway

## Documentation Sections

### Architecture and Design

- [Architecture Documentation](architecture.md): System architecture, data flow, and technology choices
- [Design Documentation](design.md): Design system, UI components, and visual guidelines

### Development

- [Development Workflow](development_workflow.md): Environment setup, development process, and best practices
- [Code Documentation](code.md): Codebase structure, coding conventions, and example patterns
- [API Documentation](api_documentation.md): API endpoints, request/response formats, and usage examples

### AI and Prompts

- [Prompt Engineering](prompt_engineering.md): Guidelines for crafting prompts using the Vercel AI SDK
- [Memory Bank](memory_bank.md): Known issues, solutions, and learnings

## Getting Started

To set up the development environment:

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/spots.git
   cd spots
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration

4. Start the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Features

- **Personalized Recommendations**: AI-powered location suggestions based on user interests
- **Natural Language Search**: Ask for recommendations in natural language
- **Interest Expansion**: AI helps users discover related interests
- **Contextual Awareness**: Recommendations consider time, weather, and location
- **Social Integration**: Share and collaborate on place collections
- **Progressive Web App**: Installable on mobile devices with offline capabilities

## Deployment

The application is deployed on Vercel with the following pipeline:

- **Development**: Automatically deploys from the `develop` branch
- **Staging**: Deploys from the `staging` branch for pre-release testing
- **Production**: Deploys from the `main` branch

Each pull request gets a unique preview URL for testing and review.

## Contributing

Please read [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the repository or contact the development team.