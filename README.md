# EcoRoute Optimizer 🌍🚛

**Sustainable Logistics & Carbon Footprint Reduction Platform**

EcoRoute Optimizer is a comprehensive solution designed to optimize logistics routes not just for time and distance, but for **environmental impact**. By leveraging advanced algorithms and real-world road data, we help businesses reduce their carbon footprint while maintaining operational efficiency.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

-   **Multi-Objective Optimization**: Balances driving time, distance, and CO2 emissions.
-   **Real-World Routing**: Uses OSRM (Open Source Routing Machine) for accurate road network data.
-   **Carbon Calculation**: Estimates CO2 output based on distance and estimated fuel consumption.
-   **Interactive Dashboard**: Next.js-based frontend for easy route planning and visualization.
-   **Microservices Architecture**:
    -   **Frontend**: Next.js (React)
    -   **API Gateway**: Ruby on Rails
    -   **Optimization Engine**: Python (Flask + NumPy)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   Python (v3.9+)
-   Ruby (v3.0+)
-   Bundler

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Nomad1nk/RouteChecker.git
    cd RouteChecker
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend-dashboard
    npm install
    npm run dev
    ```

3.  **Optimization Engine Setup**
    ```bash
    cd optimization-engine
    pip install -r requirements.txt
    python app.py
    ```

4.  **API Gateway Setup**
    ```bash
    cd api-gateway
    bundle install
    rails server
    ```

## 📖 Documentation

-   [Business Plan](./business_plan.md)
-   [Security Policy](./SECURITY.md)
-   [Contributing Guidelines](./CONTRIBUTING.md)

## 🛠 Tech Stack

-   **Frontend**: Next.js, Tailwind CSS, Lucide React, Leaflet (Map)
-   **Backend**: Ruby on Rails (API Mode)
-   **Engine**: Python, Flask, Scipy/NumPy
-   **Deployment**: Vercel

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
