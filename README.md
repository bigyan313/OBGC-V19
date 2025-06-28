# 1B Global Clicks - Solana MAINNET Anchor Program Clicker

A revolutionary web application that demonstrates decentralized community engagement through Solana MAINNET blockchain technology using a custom deployed Anchor smart contract. Join millions of users worldwide in the epic journey to reach 1 billion clicks!

## 🚀 Features

- **Custom Anchor Program**: Real smart contract deployed on Solana MAINNET
- **Program ID**: `Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t`
- **Phantom Wallet Only**: Secure integration with Phantom wallet
- **Global Leaderboard**: View all participants and their click counts
- **Cost Efficient**: Only standard network fees (≈0.000005 SOL per batch)
- **Real-time Updates**: Live data from the Anchor program on blockchain
- **Batch Processing**: Click locally for free, submit batches when ready
- **Security Checks**: Captcha verification every 1000 clicks
- **Helius RPC Support**: Enhanced performance with Helius RPC endpoints

## 🛠️ Environment Variables

This application uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

### Required Environment Variables

```env
# Helius RPC Configuration (Optional but recommended)
VITE_HELIUS_API_KEY=your-helius-api-key-here
```

### Optional Environment Variables

```env
# Custom RPC URLs (will use defaults if not provided)
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-api-key
VITE_HELIUS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=your-api-key
VITE_HELIUS_ECLIPSE_URL=https://eclipse.helius-rpc.com/
VITE_HELIUS_PARSE_TX_URL=https://api.helius.xyz/v0/transactions/?api-key=your-api-key
VITE_HELIUS_PARSE_HISTORY_URL=https://api.helius.xyz/v0/addresses/{address}/transactions/?api-key=your-api-key
```

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd 1b-global-clicks
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Get Helius API Key (Optional but Recommended)

1. Visit [Helius.xyz](https://helius.xyz)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file:

```env
VITE_HELIUS_API_KEY=your-actual-api-key-here
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚓ Anchor Program Details

### **Smart Contract Information**
- **Program ID**: `Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t`
- **Network**: Solana MAINNET
- **Framework**: Anchor (Rust-based smart contracts)
- **Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t?cluster=mainnet)

### **Program Features**
- **Global State Management**: Tracks total clicks and users across all participants
- **User State Management**: Individual click counts and timestamps per wallet
- **Rate Limiting**: On-chain protection against spam and bot activity
- **Batch Processing**: Efficient submission of multiple clicks in single transactions
- **Security**: Built-in validation and overflow protection

### **Program Instructions**
- `initialize`: One-time setup of global program state
- `create_user`: Initialize user account for new participants
- `submit_clicks`: Submit batch of clicks to update user and global state
- `get_global_stats`: Query global statistics (view function)

## 🌐 Deployment

### Netlify Deployment

The application is configured for easy Netlify deployment:

1. **Environment Variables**: Set up environment variables in Netlify dashboard
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables in Netlify**:
   - Go to Site Settings → Environment Variables
   - Add your `VITE_HELIUS_API_KEY` and other variables

### Vercel Deployment

For Vercel deployment:

1. Set environment variables in Vercel dashboard
2. Ensure all `VITE_` prefixed variables are available at build time
3. Use the standard build command: `npm run build`

## 🔐 Security & Privacy

- **Phantom Wallet Only**: Only supports Phantom wallet for security
- **No Private Keys**: Never stores or accesses private keys
- **MAINNET Transactions**: All data permanently stored on Solana MAINNET
- **Network Fees Only**: No additional fees beyond standard Solana network costs
- **Open Source**: Fully transparent codebase
- **Smart Contract Security**: All validation logic runs on-chain in the Anchor program

## 📊 Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **Blockchain**: Solana MAINNET
- **Smart Contract**: Custom Anchor program
- **Wallet**: Phantom Wallet Integration
- **RPC**: Helius RPC (premium) + fallback endpoints
- **Storage**: Anchor program accounts + localStorage for pending clicks
- **Build Tool**: Vite

## 🚨 Important Notes

- **MAINNET Transactions**: All transactions are on Solana MAINNET and cost real SOL
- **Permanent Data**: All click data is permanently stored in the Anchor program on blockchain
- **Network Fees**: Each batch submission costs ≈0.000005 SOL in network fees
- **No Refunds**: Blockchain transactions cannot be reversed
- **Phantom Required**: Only Phantom wallet is supported
- **Smart Contract**: All logic runs in the deployed Anchor program

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with the MAINNET Anchor program
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our community discussions
- **Anchor Program**: View the smart contract on [Solana Explorer](https://explorer.solana.com/address/Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t?cluster=mainnet)

---

**⚠️ Disclaimer**: This application uses Solana MAINNET blockchain with a custom Anchor program. All transactions cost real SOL and are permanent. Only use funds you can afford to lose for network fees.

**⚓ Anchor Program**: Built with the Anchor framework for secure, efficient smart contract development on Solana.