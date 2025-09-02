# Скелетони для аніме додатку

Ця папка містить скелетони (placeholder компоненти) для різних типів карток у додатку.

## Доступні скелетони

### AnimeRowCardSkeleton
Скелетон для рядкової картки аніме, який використовується в `SavedScreen` та інших екранах зі списками аніме.

#### Пропси:
- `imageWidth` (number, default: 90) - ширина зображення
- `imageHeight` (number, default: 120) - висота зображення
- `titleFontSize` (number, default: 16) - розмір шрифту заголовка
- `episodesFontSize` (number, default: 15) - розмір шрифту для епізодів
- `scoreFontSize` (number, default: 15) - розмір шрифту для оцінки
- `descriptionFontSize` (number, default: 13) - розмір шрифту для опису
- `statusFontSize` (number, default: 11) - розмір шрифту для статусу
- `marginBottom` (number, default: 20) - відступ знизу
- `imageBorderRadius` (number, default: 24) - радіус заокруглення зображення
- `skeletonColor` (string, optional) - кастомний колір скелетона
- `theme` (object, optional) - об'єкт теми для автоматичного визначення кольору
- `animationDuration` (number, default: 1000) - тривалість анімації в мс
- `enableAnimation` (boolean, default: true) - увімкнути/вимкнути анімацію

#### Приклад використання:
```jsx
import { AnimeRowCardSkeleton } from '../components/Skeletons';

// Базовий скелетон
<AnimeRowCardSkeleton />

// Кастомізований скелетон
<AnimeRowCardSkeleton
  imageWidth={100}
  imageHeight={140}
  titleFontSize={18}
  theme={theme}
  skeletonColor="#cccccc"
  animationDuration={1500}
/>
```

### AnimeListSkeleton
Скелетон для списку аніме, який рендерить кілька `AnimeRowCardSkeleton`.

#### Пропси:
- `count` (number, default: 5) - кількість скелетонів
- `skeletonColor` (string, optional) - кастомний колір для всіх скелетонів
- `theme` (object, optional) - об'єкт теми
- Всі інші пропси передаються в `AnimeRowCardSkeleton`

#### Приклад використання:
```jsx
import { AnimeListSkeleton } from '../components/Skeletons';

<AnimeListSkeleton 
  count={10}
  theme={theme}
  imageWidth={90}
  imageHeight={120}
/>
```

## Інтеграція з екранами

### SavedScreen
Скелетон автоматично відображається під час завантаження даних:

```jsx
<AnimeListSection
  animeList={animeLists[index]}
  isLoading={loadingStates[index]}
  skeletonCount={5}
  // ... інші пропси
/>
```

### AnimeListSection
Компонент автоматично перемикається між скелетоном та реальними даними:

```jsx
const renderSkeletonItem = () => (
  <AnimeRowCardSkeleton
    imageWidth={90}
    imageHeight={120}
    theme={theme}
    // ... інші пропси
  />
);
```

## Налаштування кольорів

Скелетони автоматично використовують кольори з теми:

```jsx
// В themeColors.js
export const lightThemeColors = {
  // ... інші кольори
  skeletonBackground: '#e1e1e1',
  skeletonShimmer: '#f5f5f5',
};

export const darkThemeColors = {
  // ... інші кольори
  skeletonBackground: '#2A2A2A',
  skeletonShimmer: '#3A3A3A',
};
```

## Продуктивність

- Скелетони використовують `useNativeDriver: true` для кращої продуктивності
- Анімація може бути вимкнена через `enableAnimation={false}`
- Тривалість анімації налаштовується через `animationDuration`

## Створення нових скелетонів

При створенні нового скелетона:

1. Створіть файл в папці `components/Skeletons/`
2. Додайте експорт в `index.js`
3. Використовуйте `theme.colors.skeletonBackground` для кольорів
4. Додайте анімацію за бажанням
5. Оновіть цей README файл

**Важливо**: Заголовок з фільтрами завжди відображається, але кнопки стають неактивними під час завантаження:
- Лічильник показує анімовані крапки ("...", "..", ".") під час завантаження
- Кнопки сортування та випадкового вибору мають `disabled={isLoading}`
- Візуально кнопки стають напівпрозорими (opacity: 0.6) та змінюють колір
- Після завантаження кнопки автоматично стають активними

#### Приклад поведінки:
```jsx
// Під час завантаження (isLoading={true}):
// - Заголовок показує: "... ВСЬОГО" (анімовані крапки)
// - Кнопки неактивні та напівпрозорі
// - Список показує скелетони

// Після завантаження (isLoading={false}):
// - Заголовок показує: "93 ВСЬОГО" (реальна кількість)
// - Кнопки активні та повністю видимі
// - Список показує реальні дані
```
