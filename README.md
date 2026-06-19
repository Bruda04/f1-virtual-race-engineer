# F1 Virtual Race Engineer

This repository contains the implementation of an F1 Virtual Race Engineer — a knowledge-based system that combines rule engines, simulation inputs and services to provide race strategy, safety and performance recommendations.

## Overview

- **Backend (rules & kjar):** Drools rule modules and templates live under [backend/kjar/src/main/resources](backend/kjar/src/main/resources). Business rules cover tyre strategy, pitstop decisions, track status, weather and engine/resource management.
- **Model:** Java model classes and domain objects are in [model/src/main/java](model/src/main/java).
- **Service:** Application layer and REST service live in [service/src/main/java](service/src/main/java) and configuration in [service/src/main/resources/application.properties](service/src/main/resources/application.properties).
- **Frontend:** Web UI built with Vite/React in the `frontend` folder. Entry point: [frontend/src/main.jsx](frontend/src/main.jsx).
- **Simulations:** Example CEP event streams and templates are in the `simulations` folder (JSON files used for testing and simulation scenarios).

## Key features

- Rule-driven decision engine (Drools) for strategy and safety recommendations.
- Modular Maven structure separating rules (`kjar`), domain model and service layer.
- Frontend dashboard for visualization and interaction with the service.
- Example CEP scenarios to simulate incidents, tyre issues, overheating and strategy events.

## Repo structure

- [backend/](backend) — contains Drools kjar module and resources.
	- [backend/kjar/src/main/resources/rules](backend/kjar/src/main/resources/rules) — DRL rule files.
	- [backend/kjar/src/main/resources/templates](backend/kjar/src/main/resources/templates) — Drools templates and CSVs.
- [model/](model) — domain model Java sources and generated classes.
- [service/](service) — Spring Boot (or similar) service exposing APIs and integrating the rule engine.
- [frontend/](frontend) — web client (Vite + React).
- [simulations/](simulations) — JSON files with CEP event examples and scenario templates.

## Build & Run

Prerequisites: Java 17+ (or project's required JDK), Maven or use the provided Maven wrappers, Node.js + npm for the frontend.

Backend and modules (Maven wrapper included per module):

```bash
# Build the knowledge jar (kjar)
cd backend/kjar
./mvnw clean package

# Build model
cd ../../model
./mvnw clean package

# Build and run service
cd ../service
./mvnw clean package
# run with Spring Boot (if applicable)
./mvnw spring-boot:run
```

Alternatively, run the produced jar:

```bash
java -jar service/target/*.jar
```

Frontend (Vite):

```bash
cd frontend
npm install
npm run dev   # or `npm run build` and serve the `dist` folder
```

## Simulations & Testing

- Use files in `simulations/` to feed CEP event simulators or to drive integration tests of the rule engine.
- Use web frontend to visualize and interact with the service API.

## Authors

- [Darinka Lončar](https://github.com/darinkaloncar)
- [Luka Bradić](https://github.com/Bruda04)