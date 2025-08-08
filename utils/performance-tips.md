# Поради для оптимізації продуктивності OverviewScreen

## Що було зроблено:

### 1. Оптимізація ScrollView
- Додано `removeClippedSubviews={true}` - приховує невидимі компоненти
- Додано `maxToRenderPerBatch={5}` - обмежує кількість рендерів за раз
- Додано `windowSize={10}` - зменшує розмір вікна рендерингу
- Додано `initialNumToRender={3}` - зменшує початкову кількість рендерів

### 2. Оптимізація FlatList
- Додано `getItemLayout` - покращує продуктивність при скролі
- Додано `removeClippedSubviews={true}` - приховує невидимі елементи
- Додано `maxToRenderPerBatch` та `windowSize` - контролює рендеринг
- Мемоізовано `renderItem`, `keyExtractor`, `ItemSeparator`

### 3. Мемоізація компонентів
- Додано `React.memo` до всіх компонентів
- Використано `useCallback` для функцій
- Використано `useMemo` для обчислень

### 4. Оптимізація зображень
- Створено `OptimizedImage` компонент з кешуванням
- Додано fallback зображення
- Додано індикатор завантаження

## Додаткові поради для подальшої оптимізації:

### 1. Кешування даних
```javascript
// Використовуйте React Query або SWR для кешування API запитів
import { useQuery } from 'react-query';

const { data, isLoading } = useQuery('collections', fetchCollections, {
  staleTime: 5 * 60 * 1000, // 5 хвилин
  cacheTime: 10 * 60 * 1000, // 10 хвилин
});
```

### 2. Віртуалізація списків
```javascript
// Для великих списків використовуйте react-native-virtualized-list
import { VirtualizedList } from 'react-native';
```

### 3. Оптимізація зображень
```javascript
// Використовуйте react-native-fast-image для кращого кешування
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 4. Lazy Loading
```javascript
// Завантажуйте компоненти тільки при потребі
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### 5. Оптимізація стилів
```javascript
// Використовуйте StyleSheet.create для статичних стилів
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### 6. Моніторинг продуктивності
```javascript
// Використовуйте Flipper або React DevTools для моніторингу
import { PerformanceObserver } from 'react-native';

// Додайте логування часу рендерингу
console.time('render');
// ... рендеринг
console.timeEnd('render');
```

### 7. Оптимізація API запитів
```javascript
// Об'єднайте запити в один
const fetchAllData = async () => {
  const [collections, articles, schedule] = await Promise.all([
    fetchCollections(),
    fetchArticles(),
    fetchSchedule(),
  ]);
  return { collections, articles, schedule };
};
```

### 8. Оптимізація навігації
```javascript
// Використовуйте preload для екранів
navigation.preload('AnimeDetails', { slug: 'example' });
```

## Метрики для відстеження:
- FPS (Frames Per Second) - має бути > 60
- Час рендерингу компонентів
- Час завантаження API
- Використання пам'яті
- Час відгуку на тапи

## Інструменти для профілювання:
- React DevTools Profiler
- Flipper
- React Native Debugger
- Performance Monitor

