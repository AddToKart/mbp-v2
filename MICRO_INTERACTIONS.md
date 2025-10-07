# Professional Micro-Interactions Guide

## ✨ Implemented Micro-Interactions

### 1. **Button Press & Hover Effects**

All `<Button>` components now have built-in Framer Motion animations:

#### Features:

- **Hover**: Scales to 102% (1.02x) for subtle lift effect
- **Press/Tap**: Scales to 97% (0.97x) for tactile feedback
- **Duration**: 150ms with easeOut timing
- **Disabled State**: No animations when button is disabled

#### Implementation:

```tsx
<Button size="lg" className="px-8 rounded-full">
  Click Me
</Button>
```

The button automatically includes:

- `whileHover={{ scale: 1.02 }}`
- `whileTap={{ scale: 0.97 }}`
- Smooth 150ms transitions

---

### 2. **ButtonRipple Component (Optional)**

For special cases where you want a material design ripple effect:

#### Usage:

```tsx
import ButtonRipple from "@/components/ButtonRipple";

<ButtonRipple
  onClick={handleClick}
  className="px-6 py-3 bg-primary text-white rounded-lg"
>
  Subscribe Now
</ButtonRipple>;
```

#### Features:

- Ripple originates from click position
- White semi-transparent ripple (30% opacity)
- Expands 2x size over 600ms
- Auto-cleanup after animation
- Includes press (scale 0.98) and hover (scale 1.02) effects

---

### 3. **Input Focus Animations**

All `<Input>` components have enhanced focus states:

#### Features:

- **Focus Ring**: 3px blue ring (ring-ring/50) on focus
- **Border Color**: Changes to primary blue
- **Smooth Transition**: Color and box-shadow animate together
- **Error State**: Red ring and border for validation errors

---

### 4. **Card Hover Effects**

Announcement cards include layered hover animations:

#### Blog/Featured Cards:

```tsx
// Already implemented in BlogGrid, FeaturedAnnouncements
whileHover={{ y: -8, scale: 1.02 }}
```

#### Effects:

- **Lift**: Moves up 8px
- **Scale**: Grows to 102%
- **Shadow**: Increases to shadow-2xl
- **Image**: Scales to 110% (zoom effect)

---

### 5. **Newsletter Form States**

Newsletter subscription includes 3 states:

#### Idle State:

- Normal input and button
- Hover/press animations active

#### Submitting State:

- Button shows horizontal shimmer animation
- Input disabled
- "Subscribe" text hidden
- Continuous loading shimmer

#### Success State:

- Green checkmark icon
- "Successfully subscribed!" message
- Scale animation (0.8 → 1.0)
- Auto-resets after 5 seconds

---

## 🎯 Animation Principles

### Professional Guidelines:

1. **Subtle is Better** - Scales between 0.97 - 1.02
2. **Fast Transitions** - 150ms for interactions, 300ms for states
3. **Consistent Timing** - easeOut for natural deceleration
4. **Disabled = No Animation** - Respect disabled states
5. **No Confetti** - Professional government aesthetic

### Duration Standards:

- **Button Press**: 150ms
- **Hover**: 150ms
- **State Change**: 300ms
- **Card Hover**: 400ms (for image zoom)
- **Morphing Transitions**: 400ms

### Scale Standards:

- **Hover**: 1.02 (2% larger)
- **Press**: 0.97 (3% smaller)
- **Card Hover**: 1.02 card, 1.1 image
- **Success/Error**: 0.8 → 1.0 (pop-in)

---

## 🔧 Where Animations Are Applied

### Components with Built-in Animations:

✅ `<Button>` - All variants (default, outline, ghost, etc.)  
✅ `<Input>` - Focus ring and border transitions  
✅ `OptimizedImage` - Hover zoom (when enableHover=true)  
✅ `NewsletterSection` - Form states and shimmer  
✅ `BlogGrid` - Card hover effects  
✅ `FeaturedAnnouncements` - Card hover effects  
✅ `Hero` - CTA button effects  
✅ `SearchBar` - Filter button effects

### Components with Optional Ripple:

🔘 `ButtonRipple` - Use for special emphasis

---

## 📝 Usage Examples

### Standard Button (Auto-animated):

```tsx
<Button size="lg" variant="default">
  Submit
</Button>
```

### Button with Ripple:

```tsx
<ButtonRipple className="bg-primary text-white px-6 py-3 rounded-lg">
  Special Action
</ButtonRipple>
```

### Link with Button:

```tsx
<Link href="/announcements">
  <Button size="lg" variant="outline">
    View All
  </Button>
</Link>
```

### Disabled Button (No Animation):

```tsx
<Button disabled size="lg">
  Loading...
</Button>
```

---

## 🎨 Visual Feedback Hierarchy

1. **Primary Actions**: Default button + press/hover
2. **Secondary Actions**: Outline button + press/hover
3. **Tertiary Actions**: Ghost button + press/hover
4. **Special Emphasis**: ButtonRipple component
5. **Form Inputs**: Focus ring animation
6. **Cards**: Lift + scale + image zoom
7. **Loading States**: Shimmer animation

---

## ✨ Accessibility Notes

- All animations respect `prefers-reduced-motion`
- Focus rings are clearly visible
- Disabled states are properly indicated
- Color contrast meets WCAG AA standards
- Animations don't interfere with screen readers

---

**Status**: All micro-interactions implemented professionally for government website aesthetic. No distracting effects, only subtle, elegant feedback.
