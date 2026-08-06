# 🚀 CrowdShield – AI-Powered Crowd Management System

**20-Day Hackathon MVP**
Built with **React Native, Appwrite, FastAPI, and AI (YOLO + OpenCV)**

---

## 📌 Overview

CrowdShield is an **AI-powered early-warning system** designed to move crowd management from reactive monitoring to **predictive public safety**.

---

## 🎯 Key Features

* 📊 Real-time crowd monitoring
* ⚠️ AI-based risk prediction (0–100 score)
* 🧠 Intelligent recommendation engine
* 🗺️ Live dashboard with heatmaps & zones
* 📱 Citizen mobile app with alerts & safe routes
* 🚨 Incident reporting system
* 🔔 Push notifications

---

## 🧱 Tech Stack

| Layer           | Technology             |
| --------------- | ---------------------- |
| Mobile App      | React Native + Expo    |
| Dashboard       | React + Vite           |
| Backend         | Appwrite               |
| AI API          | FastAPI                |
| Computer Vision | YOLO + OpenCV          |
| Notifications   | Expo / FCM             |
| Maps            | MapLibre / Google Maps |
| Hosting         | Vercel                 |

---

## 🏗️ Architecture

```bash
Video Feed → AI (YOLO/OpenCV) → FastAPI →
Risk Engine → Appwrite →
Dashboard + Mobile App → Notifications
```

---

## 🧠 Risk Engine

**Weights:**

* Density: 35%
* Speed: 20%
* Flow Conflict: 20%
* Surge: 15%
* Bottleneck: 10%

**Levels:**

* SAFE (0–30)
* WARNING (31–60)
* HIGH (61–80)
* CRITICAL (81–100)

---

## ⚙️ API

```bash
POST   /api/crowd/metrics
POST   /api/risk/calculate
GET    /api/risk/{venueId}
GET    /api/recommendations/{zoneId}
POST   /api/incidents
GET    /api/incidents
POST   /api/alerts
```

---

## 📊 Dashboard

* Live map & heatmap
* Risk zones
* Analytics
* AI recommendations
* Incident tracking

---

## 📱 Mobile App

* Alerts & congestion updates
* Safe route suggestions
* Incident reporting

---

## 🚀 Deployment

* Vercel (Dashboard)
* Appwrite Cloud (Backend)
* FastAPI (API)
* Local GPU (AI processing)
* Expo (Mobile)

---


## 🎬 Demo Flow

AI detects crowd → Risk increases → Dashboard alerts →
System suggests actions → Users receive notifications

---

## 🌟 Future Scope

* Digital twin simulation
* AI crowd prediction
* Voice dashboard
* Multilingual assistant

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built for hackathon innovation 🚀
Focus: **AI + Real-time systems + Public Safety**
