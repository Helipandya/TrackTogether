# 📍 TrackTogether

**TrackTogether** is an open-source, full-stack web application built with the MERN stack (MongoDB, Express.js, React, Node.js). It facilitates real-time location sharing, allowing users to stay connected with friends, family, or team members.

![TrackTogether Demo](demo-screenshot.png)

## 🌐 Live Demo

[Access the Live Application](https://your-deployment-link.com)

## 🚀 Features

- Real-time location tracking using WebSockets
- Interactive map integration with Leaflet.js
- User authentication and authorization
- Geofencing alerts for designated areas
- Responsive design for mobile and desktop devicees

## 🛠️ Tech Stack

- **Frontend:** React, Leaflet.js, Socket.IO-client
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Vercel (Frontend), Render (Backend)

## 📁 Project Structure

```bash
TrackTogether/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.js
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── .env
├── package.json
└── README.md
