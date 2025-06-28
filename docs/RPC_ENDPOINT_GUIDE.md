# Solana Mainnet RPC Endpoint Guide

## 🚨 Current Issue Analysis

**Error**: `403 Access forbidden` from `dal17.nodes.rpcpool.com`

**Root Cause**: This endpoint has rate limiting and access restrictions for free users.

## 🔧 Solution Implementation

Our application now includes:

### 1. **Multiple Fallback Endpoints**
```javascript
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',           // Official Solana Labs
  'https://solana-api.projectserum.com',          // Serum DEX
  'https://rpc.ankr.com/solana',                  // Ankr (reliable)
  'https://solana-mainnet.rpc.extrnode.com',     // ExtrNode
  'https://mainnet.helius-rpc.com/?api-key=public', // Helius (public)
  'https://api.metaplex.solana.com',              // Metaplex
  'https://solana-mainnet.phantom.tech',          // Phantom
];
```

### 2. **Automatic Endpoint Rotation**
- If one endpoint fails with 403, automatically tries the next
- Exponential backoff between retries
- Smart endpoint selection based on success rates

### 3. **Enhanced Error Handling**
- Specific handling for 403 "Access forbidden" errors
- Network timeout management
- User-friendly error messages

## 🎯 **Recommended RPC Providers**

### **Free Tier (Good for Development)**
1. **Solana Labs Official** - `https://api.mainnet-beta.solana.com`
   - ✅ Most reliable
   - ✅ No API key required
   - ⚠️ Rate limited but generous

2. **Ankr** - `https://rpc.ankr.com/solana`
   - ✅ Very reliable
   - ✅ Good performance
   - ⚠️ Some rate limiting

3. **Project Serum** - `https://solana-api.projectserum.com`
   - ✅ Stable and fast
   - ✅ DeFi optimized
   - ⚠️ Moderate rate limits

### **Paid Tier (Production Ready)**
1. **Helius** - `https://mainnet.helius-rpc.com`
   - 🚀 Excellent performance
   - 🚀 Advanced features
   - 💰 Free tier: 100k requests/day

2. **QuickNode** - Custom endpoint
   - 🚀 Enterprise grade
   - 🚀 Global CDN
   - 💰 Starts at $9/month

3. **Alchemy** - Custom endpoint
   - 🚀 Developer friendly
   - 🚀 Enhanced APIs
   - 💰 Free tier available

## 🛠️ **Implementation Details**

### **Connection Strategy**
```javascript
// 1. Test default connection first
try {
  await defaultConnection.getLatestBlockhash('confirmed');
  return defaultConnection;
} catch (error) {
  // 2. Try fallback endpoints
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint);
      await connection.getLatestBlockhash('confirmed');
      return connection; // Success!
    } catch (error) {
      continue; // Try next endpoint
    }
  }
}
```

### **Transaction Retry Logic**
```javascript
const maxRetries = 3;
let retries = 0;

while (retries < maxRetries) {
  try {
    const connection = await getWorkingConnection();
    const signature = await sendTransaction(transaction, connection);
    return signature; // Success!
  } catch (error) {
    if (shouldRetry(error) && retries < maxRetries) {
      retries++;
      await delay(1000 * Math.pow(2, retries)); // Exponential backoff
      continue;
    }
    throw error; // Final failure
  }
}
```

## 📊 **Monitoring & Debugging**

### **Check Current Endpoint**
The app now shows which endpoint is being used:
- Green status = Connected successfully
- Orange status = Using fallback endpoint
- Red status = Connection issues

### **Transaction Status**
- ✅ Success: Shows transaction signature
- ⚠️ Retry: Automatically tries different endpoint
- ❌ Failure: Clear error message with next steps

## 🔍 **Troubleshooting Steps**

### **If You Still Get 403 Errors:**

1. **Check Network Connection**
   ```bash
   # Test basic connectivity
   curl -X POST https://api.mainnet-beta.solana.com \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

2. **Try Different Endpoints Manually**
   - Open browser developer tools
   - Check which endpoint is being used
   - Look for specific error messages

3. **Clear Browser Cache**
   - Clear localStorage data
   - Refresh the page
   - Reconnect wallet

4. **Check Wallet Connection**
   - Disconnect and reconnect Phantom wallet
   - Ensure wallet has sufficient SOL (≥0.001)
   - Check wallet network is set to Mainnet

### **If Transactions Keep Failing:**

1. **Network Congestion**
   - Wait for lower network activity
   - Increase priority fees (already implemented)
   - Try during off-peak hours

2. **Insufficient Balance**
   - Ensure wallet has ≥0.001 SOL
   - Account for network fees
   - Check for pending transactions

3. **RPC Endpoint Issues**
   - App automatically rotates endpoints
   - Manual refresh may help
   - Try again in a few minutes

## 🎯 **Best Practices**

### **For Developers**
1. **Always implement fallback endpoints**
2. **Use exponential backoff for retries**
3. **Handle specific error codes (403, 429, 503)**
4. **Monitor endpoint performance**
5. **Consider paid RPC for production**

### **For Users**
1. **Ensure stable internet connection**
2. **Keep wallet funded with SOL**
3. **Be patient during network congestion**
4. **Try refreshing if issues persist**

## 🚀 **Current App Status**

✅ **Implemented Solutions:**
- Multiple fallback RPC endpoints
- Automatic endpoint rotation on failures
- Enhanced error handling for 403 errors
- Exponential backoff retry logic
- User-friendly error messages
- Connection status monitoring

✅ **Cost Optimization:**
- Only standard network fees (≈0.000005 SOL)
- No additional click fees
- Efficient batch processing
- Smart transaction prioritization

The app should now handle RPC endpoint issues automatically and provide a smooth user experience even when individual endpoints fail.