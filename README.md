# POS Agent Wallet Web App (PWA)

A full-scale Progressive Web Application designed for POS agent discovery, wallet transactions, identity verification, secure bookings, and AI-assisted financial validation.  
This project is built by a collaborative open-source community led by the founding team.

## 🚀 Overview

The platform functions like an “Uber for POS agents,” enabling users to:

- Create verified accounts (Users & Agents)
- Load wallet, make transfers, and request withdrawals
- Book agents based on location and availability
- Upload receipts/screenshots for AI-assisted validation
- Interact with a seamless PWA experience across devices

Admins manage the system through a secured dashboard with full control over:

- Users and Agents
- Manual top-ups
- Withdrawals
- KYC verification
- Transaction monitoring
- AI suggestions

This project is currently **open for contribution**, but **NOT open for duplication, resale, or commercial reuse**.

---

## 🔧 Tech Stack

**Frontend**
- React.js  
- TailwindCSS  
- JavaScript / TypeScript  
- PWA Architecture  

**Backend**
- Node.js  
- Express.js  
- REST API  
- WebSocket (Future)  

**Database**
- MongoDB / PostgreSQL  
- Cloud Storage (S3 or similar)  
- Redis (Optional)  

**AI Engine**
- Local TensorFlow.js / ONNX  
- In-app learning loop  
- No external API dependency  

**DevOps**
- Docker  
- GitHub Actions CI/CD  
- Railway / Render / AWS  
- Nginx  

**Security**
- End-to-end encryption  
- Multi-layer authentication  
- Salted hashing  
- Tokenised sessions  
- Zero-trust workflow  
- Real-time firewall simulation  

---

## 🧠 Features

### User & Agent Accounts
- Full KYC (NIN, BVN, ID upload)
- Facial recognition login
- Transaction limits and tiers
- Location-based agent discovery

### Wallet System
- Transfer between users
- Manual top-up with receipt upload
- Withdrawal to bank (manual → API later)
- Admin approval flow

### Admin Dashboard
- Approval system
- Monitoring & analytics
- KYC verification
- AI-assisted receipt validation

### Local AI System
- Image analysis for receipts
- Auto-suggest amounts
- Learning from user corrections

### Monetization (Future)
- Agent booking service charges
- Wallet transfer fees
- Ads (clean & non-intrusive)
- Premium features & API access

---

## 🤝 Contribution Guidelines

We welcome contributors, but with strict boundaries:

1. You *must not* copy, redistribute, or recreate this project elsewhere.  
2. You *must not* publish, sell, or clone this code under another name.  
3. You *must* follow the project’s license and contributor agreement.  
4. You *must* submit pull requests for review before merging.  
5. You *must* join the project communication channel for updates.

All contributors automatically become part of the **core founding team** and earn **future shareholder privileges** based on contributions.

---

## 📜 License

This project is licensed under the **Restricted Collaborative License 1.0 (RCL-1.0)**.  
See the `LICENSE` file for full details.

---

## ❤️ Credits

A community-powered project led by:

**Philip Humble Kelsin Lucian**  
Project Lead

And all core contributors building the next-generation POS + fintech ecosystem.



# Run and deploy your AI Studio app

This contains everything you need to run your app locally.



## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
