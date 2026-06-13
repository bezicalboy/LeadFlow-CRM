# Demo Video



https://github.com/user-attachments/assets/1bb8dc19-7c01-44fc-8b1f-4be3f28c4b0f



# LeadFlow CRM 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/bezicalboy/LeadFlow-CRM)](https://github.com/bezicalboy/LeadFlow-CRM/issues)
[![GitHub forks](https://img.shields.io/github/forks/bezicalboy/LeadFlow-CRM)](https://github.com/bezicalboy/LeadFlow-CRM/network)

> A modern, streamlined Customer Relationship Management (CRM) system designed to optimize lead tracking, manage sales pipelines, and boost team productivity.

---

## ✨ Features

- **Lead Management:** Capture, track, and organize leads from multiple sources in one centralized dashboard.
- **Visual Sales Pipeline:** Intuitive Kanban-style boards to move leads through different stages of the sales funnel.
- **Analytics & Reporting:** Real-time metrics and charts to track conversion rates and sales performance.
- **User Authentication:** Secure Role-Based Access Control (RBAC) for admins, managers, and sales representatives.
- **Task Automation:** Automated reminders and follow-up scheduling.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile viewing.

---

## 🛠 Tech Stack

*Update this section based on the actual technologies you are using.*

- **Frontend:** React / Next.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL / MongoDB
- **Authentication:** JWT / NextAuth
- **Deployment & DevOps:** Docker, GitHub Actions

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL or MongoDB
- Docker & Docker Compose (Optional, for containerized setup)

### Local Installation

1. **Clone the repository:**
    git clone https://github.com/bezicalboy/LeadFlow-CRM.git
    cd LeadFlow-CRM

2. **Install dependencies:**
    # Install backend dependencies
    cd backend && npm install
   
    # Install frontend dependencies
    cd ../frontend && npm install

3. **Configure Environment Variables:**
   Duplicate the `.env.example` file in both your backend and frontend directories and rename them to `.env`. Update the values with your local database credentials and API keys.
    cp .env.example .env

4. **Run Database Migrations (If applicable):**
    npm run db:migrate

5. **Start the Development Servers:**
    # Start backend
    npm run dev:backend
   
    # Start frontend
    npm run dev:frontend

   *The app should now be running on http://localhost:3000.*

---

### 🐳 Docker Setup (Recommended)

If you prefer using Docker to run the complete environment, simply run:

    docker-compose up -d --build

This will spin up all necessary containers. You can view the application at `http://localhost:3000`. To stop the containers, run `docker-compose down`.

---

## 📂 Project Structure

    LeadFlow-CRM/
    ├── frontend/                # Client-side application
    │   ├── src/
    │   │   ├── components/      # Reusable UI components
    │   │   ├── pages/           # Application views/routes
    │   │   └── utils/           # Helper functions
    ├── backend/                 # Server-side application
    │   ├── controllers/         # API route logic
    │   ├── models/              # Database schemas
    │   └── routes/              # API endpoints
    ├── docs/                    # Additional documentation
    ├── docker-compose.yml       # Docker configuration
    └── README.md                # Project documentation

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your Changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

** (Bezicalboy)** 
GitHub: [@bezicalboy](https://github.com/bezicalboy)  
Project Link: [https://github.com/bezicalboy/LeadFlow-CRM](https://github.com/bezicalboy/LeadFlow-CRM)
