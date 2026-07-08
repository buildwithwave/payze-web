# Payze

**Demo Account**
Email: `nomba@usepayze.xyz`
Password: `Nombapass!1`

Payze is a modern point-of-sale (POS) and inventory management platform designed to streamline operations for businesses. It empowers merchants with an intuitive dashboard, seamless catalogue management, real-time metrics, and an innovative WhatsApp-based self-checkout experience for their customers.

## 🚀 Quick Start for Reviewers

Welcome! This guide will walk you through exploring the main features of Payze.

### 1. The Dashboard (Merchant View)
As a merchant, the dashboard is your control center. 
- **Sign up / Log in** to your merchant account.
- **Create a Store:** You can manage multiple stores. Once created, note your **Store Code** (e.g., `SUP-a1b2`) — you'll need this for the WhatsApp checkout.
- **Add Products:** Head to the **Catalogue/Products** section to add items. You can auto-generate a barcode or enter an existing one, set prices, and manage stock. 
- **Manage Sales & Invoices:** View point-of-sale activities, track your wallet balance, virtual accounts, and monitor overall store metrics.

### 2. WhatsApp Self-Checkout Bot (Customer View)
Customers can skip the queue by scanning and paying for their items directly on WhatsApp.

**How to test the WhatsApp Bot:**
1. Join the Twilio Sandbox by sending **`join wrapped-detail`** to the Payze WhatsApp Bot number: **`+1 415-523-8886`**. 
   *(Pro-tip: You can click the "WhatsApp Store Code" button on your dashboard to automatically copy your store code and open WhatsApp with this join message pre-filled!)*
2. Once connected to the sandbox, send **`Hello`** (or any message) to start the self-service flow.
3. **Connect to your Store:** The bot will ask for a store code. Paste and send the **Store Code** of the store you created in the merchant dashboard.
4. **Scan Items:** 
   - You can send a clear **photo of a product barcode**.
   - Alternatively, type the **barcode number** or the **product name** (e.g., `Peak Milk`).
   - The bot will add the item to your cart and show the running total.
   - You can type **`CART`** to preview, **`CLEAR`** to empty, or **`DONE`** when you've added all items.
5. **Checkout & Pay:** 
   - Reply with **`PAY`** when prompted. 
   - The bot will generate a **dynamic virtual account number** unique to this order.
   - Once the transfer is made, the payment is automatically detected via Nomba webhooks, and the customer instantly receives a downloadable receipt.

**Helpful Bot Commands:**
- `START` / `RESTART` / `RESET` - Start a new session or switch stores.
- `HELP` / `MENU` - View available commands at your current step.

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, React Query, Framer Motion
- **Backend:** Node.js, Express, Supabase (PostgreSQL)
- **Payments & Virtual Accounts:** Nomba
- **WhatsApp Integration:** Twilio (with ZXing for robust barcode image decoding)

## 💻 Running the Frontend Locally

Install the dependencies:

```bash
npm install
# or pnpm install / yarn install
```

Start the development server:

```bash
npm run dev
# or pnpm dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
