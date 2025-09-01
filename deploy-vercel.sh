#!/bin/bash

# Скрипт для розгортання сайту YummyAnimeList на Vercel

echo "🚀 Розгортання сайту YummyAnimeList на Vercel..."

# Перевіряємо, чи встановлений Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не встановлено!"
    echo ""
    echo "📥 Встановлення Vercel CLI:"
    echo "npm install -g vercel"
    echo ""
    echo "Після встановлення запустіть скрипт знову."
    exit 1
fi

# Перевіряємо, чи існує папка public
if [ ! -d "public" ]; then
    echo "❌ Папка 'public' не знайдена!"
    echo "Створіть папку 'public' та помістіть туди index.html"
    exit 1
fi

# Перевіряємо, чи існує index.html
if [ ! -f "public/index.html" ]; then
    echo "❌ Файл 'public/index.html' не знайдено!"
    echo "Створіть файл index.html в папці public"
    exit 1
fi

# Перевіряємо, чи існує vercel.json
if [ ! -f "vercel.json" ]; then
    echo "❌ Файл 'vercel.json' не знайдено!"
    echo "Створіть файл vercel.json для конфігурації Vercel"
    exit 1
fi

echo "✅ Всі необхідні файли знайдено!"
echo ""

echo "📋 Інструкції по розгортанню на Vercel:"
echo ""
echo "1️⃣ Автоматичне розгортання (рекомендовано):"
echo "   - Завантажте файли на GitHub"
echo "   - Перейдіть на https://vercel.com"
echo "   - Підключіть GitHub акаунт"
echo "   - Імпортуйте репозиторій"
echo "   - Vercel автоматично визначить налаштування"
echo "   - Натисніть 'Deploy'"
echo ""

echo "2️⃣ Ручне розгортання через CLI:"
echo "   - Увійдіть в Vercel: vercel login"
echo "   - Розгорніть проект: vercel --prod"
echo ""

echo "3️⃣ Налаштування проекту:"
echo "   - Framework Preset: Other"
echo "   - Root Directory: ."
echo "   - Build Command: залиште порожнім"
echo "   - Output Directory: public"
echo ""

echo "🎯 Переваги Vercel:"
echo "   ✅ Безкоштовно"
echo "   ✅ Автоматичні оновлення з GitHub"
echo "   ✅ Глобальна CDN"
echo "   ✅ Автоматичні SSL сертифікати"
echo "   ✅ Аналітика та моніторинг"
echo "   ✅ Кастомні домени"
echo ""

echo "📝 Після розгортання оновіть utils/linksConfig.js:"
echo "SHARE_BASE_URL: 'https://your-site-name.vercel.app'"
echo ""

# Пропонуємо автоматичне розгортання
echo "🤖 Хочете автоматично розгорнути через Vercel CLI? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Запуск розгортання..."
    
    # Перевіряємо, чи користувач увійшов в Vercel
    if vercel whoami &> /dev/null; then
        echo "✅ Ви увійшли в Vercel"
        echo "🚀 Розгортаємо проект..."
        vercel --prod
    else
        echo "❌ Ви не увійшли в Vercel"
        echo "🔐 Увійдіть в систему:"
        vercel login
        echo ""
        echo "🚀 Тепер розгортаємо проект..."
        vercel --prod
    fi
else
    echo ""
    echo "📋 Детальні інструкції:"
    echo ""
    echo "🌐 Варіант 1: Через веб-інтерфейс (рекомендовано)"
    echo "1. Перейдіть на https://vercel.com"
    echo "2. Натисніть 'New Project'"
    echo "3. Імпортуйте ваш GitHub репозиторій"
    echo "4. Налаштування:"
    echo "   - Framework: Other"
    echo "   - Root Directory: ."
    echo "   - Build Command: залиште порожнім"
    echo "   - Output Directory: public"
    echo "5. Натисніть 'Deploy'"
    echo ""
    
    echo "🔧 Варіант 2: Через CLI"
    echo "1. vercel login"
    echo "2. vercel --prod"
    echo ""
fi

echo ""
echo "🌐 Для локального тестування запустіть:"
echo "npm run dev"
echo "або"
echo "cd public && http-server"
echo ""

echo "✨ Успішного розгортання на Vercel!"
