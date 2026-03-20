
# Automated Financial Health Monitor  - FINPILOT

This project is a full-stack web application designed to help users monitor, analyze, and improve their financial health. It provides a structured way to track income, expenses, and financial goals while offering insights based on user data.

The application is built using a modern tech stack with a React frontend and a Node.js backend, focusing on performance, scalability, and real-time interaction.

## Feature

User authentication and secure session handling
Add, manage, and categorize income and expenses
Dashboard with financial overview and key metrics
Budget tracking and goal management
Analytical insights based on financial data
Data visualization using charts and graphs
Export functionality for reports
Responsive user interface

## Tech Stack

Frontend: React, TypeScript, Vite
Backend: Node.js, Express, TypeScript
Database and Auth: Supabase
Other Libraries: Axios, Recharts, jsPDF, html2canvas

## Project Structure

project-root/

client/
 src/
 public/
 vite.config.ts

server/
 src/
 dist/
 tsconfig.json

package.json
package-lock.json

## Installation

Clone the repository

git clone https://github.com/your-username/automated-financial-health-monitor.git
cd automated-financial-health-monitor

Install dependencies

npm install

## Running the Project

Start both frontend and backend in development mode

npm run dev

The client will run on a local Vite server and the backend will run using Express.

## Build

To create production builds for both client and server

npm run build

## Usage

Open the application in your browser after starting the development server
Register or log in using your credentials
Add financial transactions such as income and expenses
View analytics and insights on the dashboard
Track budgets and financial goals
Export reports if needed

## Future Improvements

Integration with real bank APIs for automatic transaction tracking
AI-based financial recommendations
Improved data security and encryption
Mobile application support
Advanced filtering and reporting options
