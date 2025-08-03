# 🌸 Miku Cult Simulator

_A decentralized social game built on the Sui Blockchain where faith is programmable and devotion is on-chain._

---

## 📜 About The Project

**Miku Cult Simulator** is a decentralized application (dApp) that allows users to create and join digital **Orders** (cults) built around a shared belief system. Members perform daily rituals to earn **Faith Points**, contributing to their personal rank and their Order’s overall prestige.

This project is a full-stack example of building on the **Sui blockchain**, featuring a smart contract written in **Move**, a modern **React frontend**, and decentralized storage via **IPFS + Pinata**.

---

## ✨ Core Features

- **Create Orders**: Establish a new Order with a unique name and banner. The creator becomes the Founder.
- **Join Orders**: Browse existing Orders and pledge loyalty, receiving a `DevotionAmulet` NFT.
- **Daily Chant**: Perform a daily on-chain action to earn Faith Points for yourself and your Order.
- **Rank Up**: Spend accumulated Faith Points to increase your rank within your Order.
- **Founder's Privileges**: Founders receive a `CultFounderCap` capability object for editing Order details.
- **Dynamic NFTs**: `DevotionAmulet` is a dynamic NFT that reflects the user’s rank and progress.
- **Decentralized Storage**: Order banners are uploaded to **IPFS via Pinata**, with IPFS URLs stored on-chain.

---

## 🛠️ Tech Stack

This project uses a **monorepo** structure with both smart contracts and frontend code.

### 🔗 Blockchain

- [Sui Network](https://sui.io/)
- [Sui Move](https://docs.sui.io/concepts/sui-move-concepts)

### 💻 Frontend (`/frontend`)

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)

### 🔌 Blockchain Integration

- [`@mysten/dapp-kit`](https://sdk.mystenlabs.com/dapp-kit)
- `@tanstack/react-query` for data fetching and caching

### 🗂️ Decentralized Storage

- [IPFS](https://ipfs.tech/)
- [Pinata](https://www.pinata.cloud/)

---

## 🚀 Getting Started

Follow these steps to get the project running locally.

### ✅ Prerequisites

- **Node.js** & **Bun**  
  Install Bun:

  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```

- **Sui CLI**  
  Install guide: [Sui CLI Setup](https://docs.sui.io/guides/developer/getting-started/sui-install)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/miku-cult.git
cd miku-cult
```

---

### 2. Set Up the Smart Contract (`/contract`)

Publish the smart contract to obtain the necessary object IDs for the frontend.

```sh
cd contract

# Build the Move package
sui move build

# Publish to testnet or devnet (make sure you have funds)
sui client publish --gas-budget 50000000
```

> ⚠️ After publishing, copy the following IDs from the output:
>
> - `Package ID`
> - `CultRegistry` Object ID

---

### 3. Set Up the Frontend (`/frontend`)

```sh
cd ../frontend

# Copy example environment file
cp .env.example .env
```

Open `.env` and update the following variables:

```env
# Choose the network
VITE_NETWORK=testnet

# Fill in values obtained from contract deployment
VITE_TESTNET_PACKAGE_ID=0x...
VITE_TESTNET_REGISTRY_ID=0x...
VITE_TESTNET_SHRINE_ID=0x...  # (optional, can be left empty)

# Add your Pinata JWT
VITE_PINATA_JWT=YOUR_PINATA_JWT_HERE
```

Install dependencies and run the app:

```sh
bun install
bun run dev
```

Now your app should be live at: [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
miku-cult/
├── contract/
│   ├── Move.toml           # Move package manifest
│   └── sources/
│       └── miku_cult.move  # Smart contract source
└── frontend/
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable React components
    │   ├── config/         # Environment variables & constants
    │   ├── networkConfig.ts # dApp network setup
    │   ├── pages/          # Route-based page components
    │   ├── providers/      # React Context providers
    │   └── App.tsx         # Main application entry point
    └── package.json
```
