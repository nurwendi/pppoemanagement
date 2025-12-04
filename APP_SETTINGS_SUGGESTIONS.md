# App Settings - Feature Suggestions

## Current Features ✅
1. **Appearance Settings**
   - Custom Application Name
   - Custom Logo URL
   - Logo Preview

2. **Admin User Management**
   - Change Admin Password
   - Create Additional Admin Users

---

## Suggested Additional Features 💡

### 1. **Theme Settings**
- **Dark Mode / Light Mode Toggle**
  - Allow users to switch between dark and light themes
  - Save preference in browser localStorage
  
- **Accent Color Customization**
  - Choose primary color for buttons, links, and highlights
  - Color picker for brand customization

### 2. **Dashboard Customization**
- **Widget Visibility**
  - Toggle which statistics cards to show/hide
  - Reorder dashboard widgets via drag-and-drop
  
- **Refresh Interval**
  - Set auto-refresh interval (5s, 10s, 30s, 1min, 5min)
  - Disable auto-refresh option

### 3. **Notification Settings**
- **Email Alerts**
  - Configure email for system alerts
  - Alert when CPU/Memory exceeds threshold
  - Alert when PPPoE user connects/disconnects
  
- **Browser Notifications**
  - Enable/disable browser push notifications
  - Notification sound toggle

### 4. **Data Display Preferences**
- **Date/Time Format**
  - 12-hour vs 24-hour format
  - Date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
  - Timezone selection
  
- **Units Display**
  - Bandwidth units (bps, Kbps, Mbps, Gbps)
  - Memory units (B, KB, MB, GB)
  - Temperature units (Celsius, Fahrenheit)

### 5. **Table Preferences**
- **Rows Per Page**
  - Set default pagination (10, 25, 50, 100 rows)
  
- **Default Sort**
  - Set default sort column and direction for each table
  
- **Column Visibility**
  - Show/hide specific columns in tables

### 6. **Security Settings**
- **Session Timeout**
  - Auto-logout after inactivity (15min, 30min, 1hr, 4hr)
  
- **Two-Factor Authentication (2FA)**
  - Enable TOTP-based 2FA
  - QR code for authenticator apps
  
- **Login History**
  - View recent login attempts
  - IP address tracking

### 7. **Backup & Restore**
- **Export Settings**
  - Download all app settings as JSON
  - Include/exclude sensitive data
  
- **Import Settings**
  - Upload settings JSON to restore configuration
  
- **Auto Backup**
  - Scheduled automatic backups
  - Backup retention policy

### 8. **Language & Localization**
- **Language Selection**
  - English, Indonesian, etc.
  - RTL support for Arabic, Hebrew
  
- **Number Format**
  - Decimal separator (. or ,)
  - Thousands separator

### 9. **Advanced Settings**
- **API Rate Limiting**
  - Set max requests per minute to Mikrotik
  
- **Cache Duration**
  - How long to cache Mikrotik data
  
- **Debug Mode**
  - Enable verbose logging
  - Export logs for troubleshooting

### 10. **User Roles & Permissions** (Future)
- **Role Management**
  - Admin, Operator, Viewer roles
  - Custom role creation
  
- **Permission Matrix**
  - Granular permissions per feature
  - Read-only access for certain users

---

## Priority Implementation Order 🎯

### **Phase 1 (High Priority)**
1. Theme Settings (Dark/Light Mode)
2. Dashboard Refresh Interval
3. Session Timeout
4. Date/Time Format

### **Phase 2 (Medium Priority)**
1. Notification Settings
2. Table Preferences (Rows per page)
3. Backup & Export Settings
4. Units Display Preferences

### **Phase 3 (Low Priority)**
1. Language & Localization
2. Two-Factor Authentication
3. User Roles & Permissions
4. Advanced Debug Settings

---

## Implementation Notes 📝

- Store preferences in `app-settings.json` or database
- Use browser localStorage for user-specific preferences (theme, language)
- Validate all settings before saving
- Provide "Reset to Default" option for each section
- Add tooltips/help text for complex settings
