# MariBot Visual Design Reference

## 🎨 Design Principles Used

MariBot follows your existing design system:

### Colors

- **Primary Button**: Uses `--primary` color (blue)
- **Cards**: Uses `--card` with `--border`
- **Text**: Uses `--foreground` and `--muted-foreground`
- **Backgrounds**: Matches theme backgrounds

### Components Reused

- ✅ `Button` component from `ui/button.tsx`
- ✅ Heroicons from `@heroicons/react`
- ✅ Framer Motion animations from `lib/motion.tsx`
- ✅ `cn` utility from `lib/utils.ts`

### Animation Patterns

- Smooth scale animations (matching existing buttons)
- Slide-in transitions (matching page transitions)
- Micro-interactions on hover/tap
- Typing indicators with staggered animations

## 📐 Layout Specifications

### Floating Button

- Size: 56px × 56px (h-14 w-14)
- Position: `fixed bottom-6 right-6`
- Border radius: Fully rounded (`rounded-full`)
- Shadow: `shadow-2xl`
- Icon: `ChatBubbleLeftRightIcon` with wobble animation

### Chat Window

- Width: 380px (max-w-[calc(100vw-3rem)] on mobile)
- Height: 600px (max-h-[calc(100vh-6rem)])
- Border radius: `rounded-2xl`
- Shadow: `shadow-2xl`
- Position: `fixed bottom-6 right-6`

### Message Bubbles

- User messages: Right-aligned, primary color
- Bot messages: Left-aligned, card background
- Max width: 80% of container
- Border radius: `rounded-2xl` with small tail effect
- Timestamp: Below each message

## 🌈 Theme Adaptations

### Light Theme

- Header: Primary blue background
- Messages: White card backgrounds
- Text: Dark text on light backgrounds

### Dark Theme

- Header: Brighter primary blue
- Messages: Dark card backgrounds (#0a0a0b)
- Text: Light text on dark backgrounds

### Glass Theme

- Header: Translucent with backdrop blur
- Messages: Ultra-transparent glass effect
- Enhanced glassmorphism on all elements
- Maintains readability with proper contrast

## 💬 Chat Features

1. **Welcome Message**: Auto-displays on first open
2. **User Input**: Bottom text input with send button
3. **Typing Indicator**: Animated dots while AI thinks
4. **Timestamps**: Every message shows time
5. **Auto-scroll**: New messages scroll into view
6. **Keyboard Support**: Press Enter to send

## 🎭 MariBot Personality

**Name Origin**: "MariBot" = Maria (from Santa Maria) + Bot
**Tone**: Friendly, witty, professional, helpful
**Role**: Municipal assistant for citizen services

**Sample Responses**:

- Helps with municipal services
- Answers questions about announcements
- Provides community information
- Redirects to office for specific queries

## 🔄 User Flow

1. User sees floating chat button
2. Clicks button → Chat window slides in
3. Sees welcome message from MariBot
4. Types question → Presses Enter or clicks send
5. MariBot "types" (animated dots)
6. Receives AI-powered response
7. Can continue conversation
8. Closes chat → Window slides out

## 📱 Responsive Behavior

### Desktop (> 600px)

- Full 380px width
- Fixed position bottom-right
- Smooth animations

### Mobile (< 600px)

- Width: calc(100vw - 3rem)
- Height: calc(100vh - 6rem)
- Optimized touch interactions
- Larger tap targets

## ⚡ Performance Optimizations

- Lazy initialization (1s delay)
- Client-side only (`"use client"`)
- Efficient re-renders with proper state
- Auto-scroll only when needed
- API calls only on message send

## 🎯 Accessibility

- `aria-label` on buttons
- Keyboard navigation support
- Focus management
- Proper color contrast
- Screen reader friendly

---

**Result**: A beautiful, functional chatbot that feels native to your system! 🎊
