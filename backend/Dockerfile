FROM node:18

# נבחר תיקייה לעבודה
WORKDIR /app

# נעתיק קודם רק את ה־package.json (כדי להשתמש ב־cache נכון)
COPY package*.json ./

# נתקין את כל התלויות
RUN npm install

# נעתיק את כל הקוד
COPY . .

# אם יש לך build (למשל TypeScript) תוסיף כאן
# RUN npm run build

# נריץ את השרת
CMD ["node", "src/app.js"]
