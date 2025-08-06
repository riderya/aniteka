# Утиліти для роботи з зображеннями

## imageFallback.js

Цей файл містить утиліти для обробки fallback зображень в ArticleCard.

### Функції:

#### `findFirstImageFromContent(content)`
Шукає перше зображення в контенті статті.

**Параметри:**
- `content` - контент статті (рядок або об'єкт)

**Повертає:** URL першого знайденого зображення або `null`

**Логіка пошуку:**
1. Шукає в HTML тегах `<img>`
2. Шукає звичайні URL зображень (jpg, jpeg, png, gif, webp, svg)
3. Шукає в полях об'єкта: image, img, photo, picture, banner, cover
4. Рекурсивно шукає в вкладених об'єктах

#### `findImageInDocument(document)`
Шукає перше зображення в document структурі статті.

**Параметри:**
- `document` - масив блоків документа

**Повертає:** URL першого знайденого зображення або `null`

**Логіка пошуку:**
1. Шукає в блоках типу `image_group`
2. Рекурсивно шукає в дочірніх елементах

#### `getArticleImage(article)`
Отримує зображення для статті з fallback логікою.

**Параметри:**
- `article` - об'єкт статті

**Повертає:** URL зображення або `null`

**Пріоритет пошуку:**
1. `article.content.image` - основне зображення
2. Зображення в `article.document` (в image_group блоках)
3. Зображення в `article.content` (через `findFirstImageFromContent`)
4. Зображення в інших полях: text, description, synopsis, body, content_text

### Використання в ArticleCard:

```javascript
import { getArticleImage } from '../../utils/imageFallback';

// В компоненті:
<StyledImage
  source={
    !imageError && getArticleImage(item) 
      ? { uri: getArticleImage(item) } 
      : require('../../assets/image/image404.png')
  }
  resizeMode="cover"
  onError={handleImageError}
/>
```

### Логування:

Функція додає логування в консоль для відстеження:
- Яке зображення використовується
- Де знайдено зображення
- Помилки завантаження
- Успішне завантаження 