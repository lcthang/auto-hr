# Register Page

A modern, professional register page with clean and user-friendly design. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- **Clean, Modern Design**
- **Single-Page Form**: Streamlined user experience with all fields on one page
- **Form Validation**: Real-time validation with helpful error messages
- **Password Visibility Toggle**: Enhanced UX with show/hide password functionality
- **Social Login Options**: Google and Microsoft OAuth integration ready
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Built with accessibility best practices
- **TypeScript**: Full type safety throughout the application
- **Modern Styling**: Gradient backgrounds, smooth transitions, and hover effects

## 🎨 Design Features

- **Gradient Backgrounds**: Subtle blue-to-indigo gradients
- **Clean Form Inputs**: Rounded corners with focus states
- **Professional Typography**: Clear, readable fonts with proper hierarchy
- **Interactive Elements**: Smooth hover transitions and loading states
- **Error Handling**: User-friendly error messages with visual feedback
- **Social Integration**: Ready-to-use Google and Microsoft login buttons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit:
```
http://localhost:3000
```

## 📱 Pages

### Homepage (`/`)
- Modern landing page with hero section
- Navigation with login /sign up links
- Professional design showcasing the platform

### Register Page (`/register`)
- Clean, single-page register form
- Fields: Name, Email, Company, Job Title, Password
- Social login options (Google, Microsoft)
- Terms of service and newsletter subscription options

### Existing Auth Pages
- Multi-step register at `/register` (original implementation)
- Login page at `/login`
- Forgot password at `/forgot-password`

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Hooks (useState)
- **Form Handling**: Native React form handling with validation

## 🎯 Form Fields

The register form includes the following fields:

1. **Full Name** - Required
2. **Email** - Required with email validation
3. **Company Name** - Required
4. **Job Title** - Required
5. **Password** - Required with minimum 8 characters
6. **Terms Agreement** - Required checkbox
7. **Newsletter Subscription** - Optional checkbox (default: checked)

## 🔧 Validation Rules

- **Name**: Cannot be empty
- **Email**: Must be valid email format
- **Company**: Cannot be empty
- **Job Title**: Cannot be empty
- **Password**: Minimum 8 characters required
- **Terms**: Must be accepted to proceed

## 🎨 Styling Details

### Color Scheme
- Primary: Blue (#2563eb) to Indigo (#4f46e5) gradient
- Background: Subtle gradient from slate-50 to blue-50 to indigo-100
- Text: Gray-900 for headings, Gray-600 for body text
- Borders: Gray-300 with hover states

### Typography
- Headings: Bold, large sizes with proper hierarchy
- Body text: Medium weight, readable sizes
- Form labels: Medium weight, smaller size
- Buttons: Semibold weight

### Interactive Elements
- Smooth transitions (200ms duration)
- Hover effects on buttons and links
- Focus states with blue ring
- Loading states with spinners
- Error states with red borders and backgrounds

## 📦 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/           # Original auth pages
│   │   ├── register/       # Register page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   └── ...
├── public/                 # Static assets
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔮 Future Enhancements

- [ ] Backend integration for form submission
- [ ] Email verification flow
- [ ] OAuth integration (Google, Microsoft)
- [ ] Password strength indicator
- [ ] Multi-step form option
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Analytics integration
- [ ] A/B testing setup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Contact

For questions or feedback, please open an issue in the repository.

---
