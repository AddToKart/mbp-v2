# Swipe-to-Dismiss Implementation Guide

## ✨ Feature Overview

Swipe-to-dismiss allows users to remove announcement cards from view by swiping left or right (primarily on mobile devices). This creates a personalized, clutter-free experience.

---

## 🎯 Components Created

### 1. **useDismissedAnnouncements Hook**

Location: `/hooks/useDismissedAnnouncements.ts`

#### Features:

- Stores dismissed announcement IDs in localStorage
- Provides `isDismissed()` check function
- Supports undo functionality
- Auto-loads on mount (prevents flash of dismissed content)

#### API:

```tsx
const {
  dismissedIds, // Array of dismissed IDs
  dismissAnnouncement, // (id: string) => void
  undoDismiss, // (id: string) => void
  clearAllDismissed, // () => void
  isDismissed, // (id: string) => boolean
  isLoaded, // boolean - true when localStorage loaded
} = useDismissedAnnouncements();
```

---

### 2. **SwipeableCard Component**

Location: `/components/SwipeableCard.tsx`

#### Features:

- Drag detection with threshold (100px or fast swipe)
- Visual feedback (rotation, opacity fade)
- Snap-back animation if not dismissed
- Exit animation when dismissed
- Drag indicator on mobile (subtle vertical dots)
- Can be disabled for critical announcements

#### Props:

```tsx
interface SwipeableCardProps {
  children: React.ReactNode;
  onDismiss: () => void;
  disabled?: boolean; // Disable for critical announcements
  className?: string;
}
```

#### Behavior:

- **Swipe Threshold**: 100px horizontal distance
- **Velocity Threshold**: 200px/s
- **Rotation**: -10° to +10° based on drag
- **Opacity**: Fades to 50% at edges
- **Spring Animation**: Natural snap-back feel

---

### 3. **Toast Component**

Location: `/components/Toast.tsx`

#### Features:

- Bottom-center positioning
- Auto-dismiss after 5 seconds (configurable)
- Undo button for restoring dismissed cards
- Close button for manual dismiss
- Smooth enter/exit animations
- Responsive design

#### Props:

```tsx
interface ToastProps {
  message: string;
  show: boolean;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number; // Default: 5000ms
}
```

---

## 🛡️ Safety Features

### 1. **Critical Announcement Protection**

```tsx
const isCritical = post.category === "Emergency" ||
                   post.category === "Public Safety";

<SwipeableCard disabled={isCritical}>
```

Categories that should **NOT** be swipeable:

- ❌ Emergency
- ❌ Public Safety
- ❌ Critical Alerts
- ✅ Community Updates (swipeable)
- ✅ Events (swipeable)
- ✅ Transparency (swipeable)

---

### 2. **Undo Functionality**

Users have 5 seconds to undo a dismissal:

```tsx
<Toast
  message="Announcement dismissed"
  show={showToast}
  onUndo={handleUndo}
  onClose={() => setShowToast(false)}
/>
```

---

### 3. **LocalStorage Management**

- Key: `municipality_dismissed_announcements`
- Format: `["1", "2", "5"]` (array of ID strings)
- Privacy-friendly: No server calls, stored locally
- Persistent: Survives page refreshes
- Can be cleared: `clearAllDismissed()`

---

### 4. **Loading State Prevention**

Prevents flash of dismissed content:

```tsx
if (!isLoaded) {
  return null; // Wait for localStorage to load
}
```

---

## 📱 Mobile Optimization

### Visual Indicators:

- **Drag Handle**: Subtle vertical dots on left side (mobile only)
- **Cursor**: Changes from `grab` to `grabbing` on drag
- **Rotation**: Cards tilt during drag for physical feel

### Touch Gestures:

- **Drag**: Works on any touch device
- **Fast Swipe**: Lower threshold for quick gestures
- **Snap Back**: If released before threshold

---

## 🎨 Implementation Example

### BlogGrid Integration:

```tsx
import { useDismissedAnnouncements } from "@/hooks/useDismissedAnnouncements";
import SwipeableCard from "@/components/SwipeableCard";
import Toast from "@/components/Toast";

export default function BlogGrid() {
  const { isDismissed, dismissAnnouncement, undoDismiss, isLoaded } =
    useDismissedAnnouncements();
  const [showToast, setShowToast] = useState(false);
  const [lastDismissedId, setLastDismissedId] = useState<string | null>(null);

  const handleDismiss = (postId: string) => {
    dismissAnnouncement(postId);
    setLastDismissedId(postId);
    setShowToast(true);
  };

  const handleUndo = () => {
    if (lastDismissedId) {
      undoDismiss(lastDismissedId);
      setLastDismissedId(null);
    }
  };

  // Filter dismissed posts
  const visiblePosts = allAnnouncements.filter(
    (post) => !isDismissed(post.id.toString())
  );

  return (
    <>
      <AnimatePresence mode="popLayout">
        {visiblePosts.map((post) => (
          <SwipeableCard
            key={post.id}
            onDismiss={() => handleDismiss(post.id.toString())}
            disabled={post.category === "Emergency"}
          >
            {/* Card content */}
          </SwipeableCard>
        ))}
      </AnimatePresence>

      <Toast
        message="Announcement dismissed"
        show={showToast}
        onUndo={handleUndo}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
```

---

## ⚙️ Configuration

### Adjust Swipe Sensitivity:

```tsx
// In SwipeableCard.tsx
const SWIPE_THRESHOLD = 100; // Pixels to trigger dismiss
const SWIPE_POWER = 200; // Exit velocity threshold
```

### Adjust Toast Duration:

```tsx
<Toast
  message="Dismissed"
  show={showToast}
  onUndo={handleUndo}
  onClose={() => setShowToast(false)}
  duration={3000} // 3 seconds instead of 5
/>
```

---

## 🎭 Animation Details

### Card Drag:

- **Transform**: `x` position follows finger
- **Rotate**: -10° to +10° based on distance
- **Opacity**: 1.0 → 0.5 as distance increases
- **Spring**: Stiffness 300, Damping 30

### Card Exit:

- **Direction**: Flies off in swipe direction
- **Distance**: 300px
- **Duration**: 300ms
- **Opacity**: Fades to 0

### Toast Enter/Exit:

- **Enter**: Scale 0.95 → 1.0, Y 50 → 0
- **Exit**: Scale 1.0 → 0.95, Y 0 → 20
- **Duration**: 200ms

---

## ♿ Accessibility

### Screen Readers:

- Toast has proper ARIA announcements
- Close button has `aria-label="Close notification"`
- Cards maintain keyboard navigation

### Keyboard Support:

- Cards still clickable normally
- Swipe doesn't interfere with click/tap
- Undo button is focusable

### Visual Feedback:

- Drag indicator visible on mobile
- Clear rotation/opacity changes
- Toast positioned for visibility

---

## 📊 User Flow Example

```
1. User opens municipality site on phone
2. Sees 3 announcement cards
3. Swipes "Road Closure" card to right
4. Card flies off screen with rotation
5. Toast appears: "Announcement dismissed [Undo]"
6. Card removed from localStorage
7. User can tap "Undo" within 5 seconds
8. If undo: Card reappears smoothly
9. If timeout: Dismissal becomes permanent
10. On next visit: "Road Closure" stays hidden
```

---

## 🔧 Troubleshooting

### Issue: Cards don't swipe

- **Solution**: Check if `disabled={true}` is set
- **Solution**: Verify Framer Motion is installed
- **Solution**: Check for z-index conflicts

### Issue: Dismissed cards reappear

- **Solution**: Check localStorage key consistency
- **Solution**: Verify `isLoaded` check is in place
- **Solution**: Clear browser cache/localStorage

### Issue: Toast doesn't show

- **Solution**: Check z-index (should be z-50)
- **Solution**: Verify `showToast` state updates
- **Solution**: Check if Toast is rendered

### Issue: Accidental swipes

- **Solution**: Increase `SWIPE_THRESHOLD` (e.g., 150px)
- **Solution**: Disable on desktop with CSS media query
- **Solution**: Add confirmation dialog for critical cards

---

## 🎯 Best Practices

1. **Always provide undo** - Users make mistakes
2. **Protect critical content** - Emergency alerts shouldn't be dismissible
3. **Give visual feedback** - Rotation, opacity, etc.
4. **Respect user preferences** - Store in localStorage, not server
5. **Test on mobile** - This is primarily a touch feature
6. **Provide alternative** - Keep traditional close buttons too
7. **Monitor usage** - Track dismissal patterns (analytics)

---

## 🚀 Future Enhancements

Possible additions:

- **"Show Dismissed" button** - View hidden announcements
- **Swipe settings toggle** - Let users disable swipe
- **Haptic feedback** - Vibrate on dismiss (mobile)
- **Different swipe directions** - Left = dismiss, Right = save for later
- **Swipe threshold indicator** - Visual progress bar
- **Category-specific rules** - Different thresholds per category

---

**Status**: Fully implemented with safety features, undo functionality, and mobile optimization. Ready for production use on government municipality website.
