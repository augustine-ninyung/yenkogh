# Project
Final year project

# Smart Tourism and Transportation Planning Web Application

A modern AI-powered web application designed to simplify tourism planning in Ghana by providing destination discovery, transportation guidance, budget estimation, festival information, and personalized travel itinerary generation—all in one platform.

---

## 📖 Overview

Planning a trip in Ghana often requires navigating multiple websites for attractions, transportation, accommodation, events, and travel costs. This project addresses that challenge by providing a centralized platform that enables users to discover destinations, plan trips, estimate budgets, and generate intelligent travel itineraries using Artificial Intelligence.

---

## ✨ Features

### User Features

- User Registration & Authentication
- Secure Login System
- Destination Discovery
- Tourist Attraction Details
- Festival & Event Listings
- Transportation Guide
- Budget Calculator
- AI-Powered Trip Recommendations
- AI Itinerary Generator
- Responsive User Interface
- User Profile Management

### Admin Features

- Dashboard
- Manage Destinations
- Manage Events
- Manage Transportation Data
- User Management
- Content Management
- Basic Analytics

---

## 🧠 AI Capabilities

The application integrates a Large Language Model (LLM) to:

- Generate personalized travel itineraries
- Recommend destinations based on user interests
- Suggest transportation options
- Estimate travel costs
- Build day-by-day travel plans

To improve reliability, AI responses are grounded using Retrieval-Augmented Generation (RAG) with a curated knowledge base of Ghanaian tourism information.

---

## 🛠 Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Nest.js
- Express.js

### Database

- PostgreSQL

### Authentication

- JSON Web Tokens (JWT)

### Artificial Intelligence

- OpenAI API
- Retrieval-Augmented Generation (RAG)

---

## 🏗 System Architecture

```
Frontend (Next.js)

        │

REST API

        │

Backend (Node.js + Express)

        │

PostgreSQL Database

        │

OpenAI API (AI Recommendation Engine)
```

---

## Project Structure

```
smart-tourism-app/
│
├── client/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── public/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── models/
│   └── config/
│
├── database/
│
├── docs/
│
├── README.md
└── package.json
```

---

## Core Modules

- Authentication
- Destination Management
- Transportation Management
- Event & Festival Management
- Budget Planner
- AI Recommendation Engine
- AI Itinerary Generator
- Admin Dashboard

---

## Functional Requirements

- User registration and login
- Destination search
- View attraction details
- Browse festivals
- Transportation guidance
- Budget estimation
- AI itinerary generation
- Admin CRUD operations
- Responsive interface

---

## Non-Functional Requirements

- Performance
- Security
- Scalability
- Reliability
- Maintainability
- Accessibility
- Responsive Design

---

## Security

The application follows modern security practices including:

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Input Validation
- SQL Injection Prevention
- XSS Protection
- CSRF Protection
- OWASP Top 10 Considerations

---

## Future Improvements

- Hotel Booking
- Flight Booking
- Mobile Money Integration
- Real-time Transportation Tracking
- Weather Integration
- Google Maps Integration
- Multi-language Support
- Mobile Application
- Offline Mode

---

## Target Users

- Local Tourists
- International Visitors
- Students
- Tour Operators
- Travel Agencies
- Tourism Authorities

---

## Development Methodology

The project follows the Agile Software Development methodology with iterative development cycles involving:

- Requirements Gathering
- System Design
- Development
- Testing
- Deployment
- Documentation

---

## Screens (Planned)

- Landing Page
- Login
- Register
- Home Dashboard
- Explore Destinations
- Destination Details
- AI Planner
- Budget Planner
- Events & Festivals
- Transportation Guide
- Profile
- Admin Dashboard

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/smart-tourism.git
```

### Navigate into the project

```bash
cd smart-tourism
```

### Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

### Run Development Servers

Frontend

```bash
npm run dev
```

Backend

```bash
npm run dev
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

## Author

**Augustine Ninyung**

- BSc Information Technology
- University of Ghana
- Frontend Developer
- Cybersecurity Enthusiast

---

## License

This project is intended for academic and educational purposes.
