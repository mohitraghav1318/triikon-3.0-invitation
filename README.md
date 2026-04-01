# Invitation System - Jury & Mentors

A modern, secure invitation website for collecting RSVP responses from jury members and mentors. Built with React, Vite, Three.js, Tailwind CSS, and SCSS for advanced styling.

## 🎨 Features

### **Three Separate Pages:**

- **Admin Page** (`/admin`) - Manage invitation messages and view all responses
- **Jury Page** (`/jury`) - Invitation page for jury members
- **Mentor Page** (`/mentor`) - Invitation page for mentors

### **Security & Privacy:**

- ✅ **No Cross-Page Navigation** - Each page is isolated with no buttons to access other pages
- ✅ **URL-Based Access** - Share specific URLs with specific groups (jury, mentors, admin)
- ✅ **Admin-Only Access** - Admin page is only accessible via direct URL

### **Dynamic Content Management:**

- ✅ **Customizable Messages** - Admin can write and edit invitation messages
- ✅ **Separate Messages** - Different messages for jury and mentors
- ✅ **Real-Time Updates** - Messages are immediately visible on respective pages
- ✅ **No Hardcoding** - All content is managed through the admin panel

### **Response Collection:**

- ✅ Collects name, email, and attendance status (Attending/Not Attending/Maybe)
- ✅ Form validation with error messages
- ✅ Success confirmation after submission
- ✅ All responses stored in localStorage
- ✅ Detailed statistics and tables in admin panel

### **Design & UX:**

- ✅ **SCSS Styling** - Advanced styling with variables, mixins, and animations
- ✅ **Smooth Animations** - Fade-in, slide-in, glow effects
- ✅ **Glassmorphism** - Modern glass-effect cards with backdrop blur
- ✅ **Three.js Background** - Animated 3D sphere for visual appeal
- ✅ **Responsive Design** - Works perfectly on all device sizes
- ✅ **Custom Scrollbar** - Styled scrollbar matching the theme

## 🎨 Color Scheme

- **Primary:** `#00c9ff` (Cyan)
- **Dark:** `#000000` (Black)
- **Light:** `#f5f5f5` (Whitesmoke)
- **Font:** Montserrat (Google Fonts)

## 🚀 Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - Advanced styling with variables and mixins
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for Three.js

## 📦 Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

3. **Open your browser:**
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## 📖 Usage Guide

### For Admin:

1. **Access Admin Panel:**
   - Navigate to `http://localhost:5173/admin`
   - Keep this URL private and secure

2. **Edit Messages:**
   - Click on "Edit Messages" tab
   - Write custom invitation messages for jury and mentors
   - Click "Save Messages" to update

3. **View Responses:**
   - Click on "View Responses" tab
   - See statistics and detailed tables
   - Export or clear responses as needed

### For Jury Members:

1. **Share the Jury URL:**
   - Send `http://localhost:5173/jury` to jury members only
   - They will see the custom message you wrote in admin panel

2. **Jury members can:**
   - Read the invitation message
   - Fill in their name and email
   - Select attendance status
   - Submit their response

### For Mentors:

1. **Share the Mentor URL:**
   - Send `http://localhost:5173/mentor` to mentors only
   - They will see the custom message you wrote in admin panel

2. **Mentors can:**
   - Read the invitation message
   - Fill in their name and email
   - Select attendance status
   - Submit their response

## 📁 Project Structure

```
invitation-trikon/
├── src/
│   ├── components/
│   │   └── ThreeBackground.jsx    # 3D animated background component
│   ├── pages/
│   │   ├── AdminPage.jsx          # Admin panel (no navigation buttons)
│   │   ├── JuryPage.jsx           # Jury invitation (no navigation buttons)
│   │   └── MentorPage.jsx         # Mentor invitation (no navigation buttons)
│   ├── styles/
│   │   └── main.scss              # SCSS styles with animations
│   ├── utils/
│   │   └── storage.js             # localStorage management
│   ├── App.jsx                    # Routing configuration
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Legacy CSS (replaced by SCSS)
├── index.html                     # HTML template
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## 🎯 Key Features Explained

### 1. **Isolated Pages**

Each page (admin, jury, mentor) is completely isolated with no navigation buttons. This ensures:

- Jury members only see the jury page
- Mentors only see the mentor page
- Admin only accesses admin panel via direct URL

### 2. **Dynamic Message System**

- Admin writes messages in the admin panel
- Messages are stored in localStorage
- Jury page displays the jury message
- Mentor page displays the mentor message
- No hardcoded content - everything is customizable

### 3. **Response Management**

- All responses are stored locally in the browser
- Admin can view detailed statistics
- Responses include: name, email, status, timestamp
- Admin can clear all responses for testing

### 4. **Advanced Styling**

- SCSS variables for easy color customization
- Smooth animations on page load and interactions
- Glassmorphism effects for modern look
- Responsive design for all screen sizes
- Custom scrollbar matching the theme

## 🎨 SCSS Features

The project uses SCSS for advanced styling:

- **Variables:** Easy color and font management
- **Animations:** Fade-in, slide-in, pulse, glow effects
- **Mixins:** Reusable style patterns
- **Nesting:** Better code organization
- **Responsive:** Mobile-first approach

## 💾 Data Storage

The application uses **localStorage** for data persistence:

### Stored Data:

- `invitation_jury_message` - Jury invitation message
- `invitation_mentor_message` - Mentor invitation message
- `invitation_jury_responses` - Array of jury responses
- `invitation_mentor_responses` - Array of mentor responses

### Response Structure:

```javascript
{
  id: 1234567890,              // Unique timestamp ID
  name: "John Doe",            // Respondent's name
  email: "john@example.com",   // Respondent's email
  status: "attending",         // attending | not-attending | maybe
  timestamp: "2026-04-01T..."  // ISO 8601 timestamp
}
```

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🔧 Development

```bash
npm run dev
```

The development server includes:

- Hot Module Replacement (HMR)
- Fast refresh
- Error overlay
- SCSS compilation

## 📝 Code Comments

All files include comprehensive comments explaining:

- Component purpose and functionality
- Function parameters and return values
- State management logic
- Event handlers
- Utility functions
- SCSS variables and mixins

This makes debugging and maintenance easier.

## 🔒 Security Notes

- **No Backend Required** - All data is stored in browser localStorage
- **Data Privacy** - Data is local to each browser/device
- **URL-Based Access** - Share specific URLs with specific groups
- **No Cross-Page Links** - Pages are isolated for security

## ⚠️ Important Notes

1. **localStorage Limitation:**
   - Data persists across page refreshes
   - Data is local to each browser
   - For production, consider implementing a backend API

2. **URL Sharing:**
   - Share `/admin` URL only with administrators
   - Share `/jury` URL only with jury members
   - Share `/mentor` URL only with mentors

3. **Message Updates:**
   - Admin must save messages for them to appear on jury/mentor pages
   - Messages are updated in real-time after saving

4. **Three.js Performance:**
   - The animated background may impact performance on low-end devices
   - Consider disabling on mobile if needed

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [SCSS Guide](https://sass-lang.com/guide)
- [Three.js](https://threejs.org)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## 📄 License

MIT

## 🤝 Contributing

This is a custom project. Feel free to modify and adapt it to your needs.

---

**Built with ❤️ using React, Vite, Three.js, Tailwind CSS, and SCSS**
