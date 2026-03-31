# TechStore — ITS 2130 Enterprise Cloud Architecture
## Final Project — Higher Diploma in Software Engineering

---

## 🔗 Eureka Dashboard
**Public URL:** `http://YOUR_EUREKA_VM_EXTERNAL_IP:8761`

> ⚠️ GCP deploy කළාට පස්සේ මේ IP එක update කරන්න

---

## 📋 Project Overview
TechStore යනු microservice architecture එකක් use කරලා build කළ online tech store system එකක්.

## 🏗️ Services & Ports

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| Config Server | 8888 | — | Centralized configuration |
| Eureka Server | 8761 | — | Service discovery & registry |
| API Gateway | 8080 | — | Single entry point |
| User Service | 8081 | MySQL (Cloud SQL) | User auth & profiles |
| Product Service | 8082 | MongoDB (Firestore) | Product catalog |
| Media Service | 8083 | Cloud Storage | File/image uploads |

## 🔧 Tech Stack
- Java 25
- Spring Boot 3.4.1
- Spring Cloud 2024.0.0
- Maven

## ☁️ GCP Infrastructure
- VPC Network: `techstore-vpc`
- Load Balancer: HTTP(S) Load Balancer
- Cloud SQL: MySQL 8.0
- Cloud Storage Bucket: `techstore-media-bucket`
- VM Instance Groups with Auto-Scaling
- Cloud NAT + Cloud Router
- Cloud DNS
- Firestore

## 📁 Repository Structure (Polyrepo + Submodules)
```
techstore-main/          ← Main repo (submit this)
├── user-service/        ← Git submodule
├── product-service/     ← Git submodule
├── media-service/       ← Git submodule
├── config-server/       ← Git submodule
├── eureka-server/       ← Git submodule
├── api-gateway/         ← Git submodule
└── frontend/            ← Git submodule
```

## 🚀 API Endpoints (via Gateway)

### User Service — `/api/users`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | Get all users |
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| GET | `/api/users/{id}` | Get user by ID |

### Product Service — `/api/products`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/category/{cat}` | Filter by category |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### Media Service — `/api/media`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/media/upload` | Upload file to GCS |
| GET | `/api/media/files` | List all files |
| DELETE | `/api/media/files/{name}` | Delete file |

## 📹 Screen Recording
[Link to screen recording — GCP Console + pm2 monit]

## 👨‍💻 Student Info
- Name: YOUR_NAME
- Student ID: YOUR_STUDENT_ID
- Module: ITS 2130 — Enterprise Cloud Architecture
