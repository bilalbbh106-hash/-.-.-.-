# مكتبة المودات وإصدارات ماينكرافت البيدروك 🎮

موقع ويب متكامل لعرض وإدارة مودات وإصدارات ماينكرافت البيدروك مع نظام إدارة محتوى متكامل.

## ✨ المميزات

- ✅ عرض المودات والإصدارات مع صور ووصف كامل
- ✅ نظام بحث متقدم بالكلمات المفتاحية
- ✅ لوحة إدارة محمية بكلمة مرور (`2009bb2009`)
- ✅ إضافة/تعديل/حذف المودات والإصدارات
- ✅ رفع روابط صور وفيديوهات يوتيوب
- ✅ تصميم أنيميشن جميل ومتجاوب
- ✅ تخزين البيانات في Supabase
- ✅ عداد التحميلات التلقائي

## 🚀 خطوات التنصيب

### 1. إنشاء الجداول في Supabase

1. سجل الدخول إلى [Supabase](https://supabase.com)
2. اختر مشروعك: `zpsbdkcvdpjzahhvdlvd`
3. انتقل إلى **SQL Editor**
4. الصق كود إنشاء الجداول التالي واضغط **RUN**:

```sql
-- إنشاء جدول المودات
CREATE TABLE IF NOT EXISTS mods (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    download_url TEXT NOT NULL,
    category TEXT DEFAULT 'أدوات',
    version TEXT,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إنشاء جدول الإصدارات
CREATE TABLE IF NOT EXISTS versions (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    download_url TEXT NOT NULL,
    version TEXT NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
