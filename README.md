# OnMangeQuoi - Weekly Menu Generator

A modern Next.js application for generating weekly menus and grocery lists.

## Features

- Generate weekly menus with breakfast, lunch, and dinner for each day
- View and manage your recipes
- Add new recipes to your collection
- Generate grocery lists for your weekly menu
- Modern, responsive UI with a friendly design

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- FastAPI backend (see Backend Setup section)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/onmangequoi_ui.git
cd onmangequoi_ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following content:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Replace the URL with your FastAPI backend URL if it's different.

### Running the Application

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Backend Setup

This application requires a FastAPI backend to function properly. The backend should be running and accessible at the URL specified in your `.env.local` file.

### CORS Configuration

The backend needs to have CORS enabled to allow requests from the frontend. Add the following to your FastAPI application:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: React components
- `/src/services`: API services
- `/src/types`: TypeScript type definitions
- `/public`: Static assets

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS

## License

This project is licensed under the MIT License.
