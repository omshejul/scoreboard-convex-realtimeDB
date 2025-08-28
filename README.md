# ⚽ Scoreboard App

A modern, real-time scoreboard application built with Next.js, Convex, and Framer Motion. Perfect for tracking game scores, sports events, or any competitive activity that needs live score updates.

## ✨ Features

### 🎯 Core Functionality

- **Real-time Updates** - Scores sync instantly across all connected devices
- **Dual Score Tracking** - Left vs Right side scoring with color-coded sections
- **Increment/Decrement** - Add or subtract points with optimistic UI updates
- **Reset Confirmation** - Prevent accidental resets with a confirmation dialog

### 🔐 Authentication

- **Email OTP Authentication** - Secure sign-in with 4-digit verification codes
- **Beautiful Sign-in UI** - Modern forms with smooth animations
- **Resend Code** - Easy code resending if needed

### 🎨 User Experience

- **Optimistic Updates** - Instant visual feedback before server confirmation
- **Smooth Animations** - Framer Motion animations throughout
- **Responsive Design** - Works perfectly on desktop and mobile
- **Color-Coded Sides** - Red vs Blue sections for easy identification
- **Confirmation Dialogs** - shadcn UI-styled confirmation popups

### ⚡ Performance

- **Real-time Database** - Powered by Convex for instant synchronization
- **Optimistic Updates** - No delays when clicking buttons
- **Efficient Rendering** - Optimized React components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd convex-auth
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Convex**

   ```bash
   npx convex dev
   ```

4. **Configure environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   AUTH_RESEND_KEY=<your-resend-api-key>
   CONVEX_SITE_URL=<your-site-url>
   # WhatsApp OTP (Node-RED gateway)
   WHATSAPP_API_URL=https://nodered.omshejul.com/api/v1/whatsapp/message
   WHATSAPP_BEARER=XYZ
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions

### Backend & Database

- **Convex** - Real-time backend and database
- **Convex Auth** - Authentication system

### Email Service

- **Resend** - Email delivery for OTP codes
- **Custom HTML Templates** - Email-client compatible templates

### UI Components

- **shadcn UI** - Modern component library (inline implementation)
- **Custom Components** - Tailored OTP input and dialogs

## 📁 Project Structure

```
convex-auth/
├── app/                    # Next.js App Router
│   ├── SignIn.tsx         # Authentication component
│   ├── page.tsx           # Main scoreboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles & CSS variables
├── convex/                # Convex backend
│   ├── auth.ts           # Authentication configuration
│   ├── ResendOTP.ts      # Email OTP provider
│   ├── scoreboard.ts     # Score mutations and queries
│   └── schema.ts         # Database schema
├── tailwind.config.js    # Tailwind configuration
└── README.md            # This file
```

## 🎮 How to Use

### 🔐 Authentication

1. Enter your email address on the sign-in page
2. Check your email for a 4-digit verification code
3. Enter the code to access the scoreboard

### 📊 Managing Scores

- **Increment**: Click on the red (left) or blue (right) sections
- **Decrement**: Click the small minus (-) buttons when scores > 0
- **Reset**: Click "Reset" button and confirm in the dialog

### 🔄 Real-time Updates

- Changes appear instantly on your device
- All connected devices see updates in real-time
- Automatic conflict resolution

## 🔧 Configuration

### Email Setup

Configure your Resend API key in the environment variables:

```env
AUTH_RESEND_KEY=re_xxxxxxxxxxxxxxxxx
```

### Convex Schema

The scoreboard uses this data structure:

```typescript
{
  slug: string; // Scoreboard identifier
  left: number; // Left side score
  right: number; // Right side score
  createdAt: number; // Creation timestamp
  updatedAt: number; // Last update timestamp
}
```

### Customization

- **Colors**: Modify the `bg-red-500` and `bg-blue-500` classes in `page.tsx`
- **Animations**: Adjust Framer Motion settings for different effects
- **Email Template**: Edit the HTML template in `ResendOTP.ts`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app works on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- [Convex](https://convex.dev) - For the amazing real-time backend
- [shadcn/ui](https://ui.shadcn.com) - For the beautiful component designs
- [Framer Motion](https://framer.com/motion) - For smooth animations
- [Resend](https://resend.com) - For reliable email delivery

---

**Built with ❤️ using modern web technologies**
