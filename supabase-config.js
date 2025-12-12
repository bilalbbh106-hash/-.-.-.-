// supabase-config.js - النسخة النهائية مع معلوماتك الحقيقية
const SUPABASE_URL = 'https://zpsbdkcvdpjzahhvdlvd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwc2Jka2N2ZHBqemFoaHZkbHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjI1NTIsImV4cCI6MjA4MTA5ODU1Mn0.r_wsZ3mfaA85Ae6zcGu3Xy61yknt1AyAw5sRpH1tdVA';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// كلمة مرور الأدمن
const ADMIN_PASSWORD = '2009bb2009';

// تعريف الجداول
const TABLES = {
    MODS: 'mods',
    VERSIONS: 'versions'
};

// إحصائيات الموقع (تخزين محلي)
let siteStats = {
    totalVisits: parseInt(localStorage.getItem('totalVisits')) || 0,
    todayVisits: 0,
    todayDate: new Date().toDateString()
};

// دالة لتهيئة قاعدة البيانات واختبار الاتصال
async function initializeDatabase() {
    try {
        // تحديث الإحصائيات
        updateVisitStats();
        
        // اختبار الاتصال
        const { data, error } = await supabase
            .from(TABLES.MODS)
            .select('id')
            .limit(1);
        
        if (error) {
            console.warn('⚠️ ' + error.message);
            if (error.code === '42P01') {
                showMessage('⚠️ الجداول غير موجودة. الرجاء إنشاؤها من SQL Editor في Supabase', 'warning');
            } else {
                showMessage('خطأ في الاتصال بقاعدة البيانات', 'error');
            }
        } else {
            console.log('✅ تم الاتصال بـ Supabase بنجاح');
            return true;
        }
    } catch (error) {
        console.error('خطأ غير متوقع:', error);
        showMessage('حدث خطأ غير متوقع', 'error');
    }
    return false;
}

// تحديث إحصائيات الزيارات
function updateVisitStats() {
    const today = new Date().toDateString();
    
    if (localStorage.getItem('lastVisitDate') !== today) {
        // يوم جديد
        localStorage.setItem('lastVisitDate', today);
        siteStats.todayVisits = 1;
    } else {
        // نفس اليوم
        siteStats.todayVisits = parseInt(localStorage.getItem('todayVisits')) || 0;
        siteStats.todayVisits++;
    }
    
    // زيادة الزيارات الإجمالية
    siteStats.totalVisits++;
    
    // حفظ في localStorage
    localStorage.setItem('totalVisits', siteStats.totalVisits.toString());
    localStorage.setItem('todayVisits', siteStats.todayVisits.toString());
    
    // تحديث العرض إذا كانت الصفحة موجودة
    updateStatsDisplay();
}

// تحديث عرض الإحصائيات
function updateStatsDisplay() {
    const todayViewsEl = document.getElementById('todayViews');
    const totalVisitsEl = document.getElementById('totalVisits');
    const todayVisitsEl = document.getElementById('todayVisits');
    
    if (todayViewsEl) {
        todayViewsEl.textContent = siteStats.todayVisits.toLocaleString();
    }
    
    if (totalVisitsEl) {
        totalVisitsEl.textContent = siteStats.totalVisits.toLocaleString();
    }
    
    if (todayVisitsEl) {
        todayVisitsEl.textContent = siteStats.todayVisits.toLocaleString();
    }
}

// دالة لعرض رسائل للمستخدم
function showMessage(text, type) {
    // إنشاء عنصر الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = `global-message global-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
        <span>${text}</span>
        <button class="message-close">&times;</button>
    `;
    
    // إضافة الأنماط إذا لم تكن موجودة
    if (!document.querySelector('#message-styles')) {
        const styles = document.createElement('style');
        styles.id = 'message-styles';
        styles.textContent = `
            .global-message {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1a1a2e;
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 10000;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                border-left: 5px solid #2d5ba9;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 400px;
                border: 2px solid rgba(255, 255, 255, 0.1);
            }
            
            .global-message.show {
                transform: translateX(0);
            }
            
            .global-message-success {
                border-left-color: #28a745;
                background: rgba(40, 167, 69, 0.1);
            }
            
            .global-message-error {
                border-left-color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
            }
            
            .global-message-warning {
                border-left-color: #ffc107;
                background: rgba(255, 193, 7, 0.1);
            }
            
            .global-message i {
                font-size: 1.5rem;
            }
            
            .global-message-success i {
                color: #28a745;
            }
            
            .global-message-error i {
                color: #dc3545;
            }
            
            .global-message-warning i {
                color: #ffc107;
            }
            
            .message-close {
                background: none;
                border: none;
                color: #aaa;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .message-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // إضافة الرسالة إلى الصفحة
    document.body.appendChild(messageDiv);
    
    // إضافة حدث الإغلاق
    messageDiv.querySelector('.message-close').addEventListener('click', () => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    });
    
    // إظهار الرسالة
    setTimeout(() => messageDiv.classList.add('show'), 10);
    
    // إخفاء الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 5000);
}

// تصدير المتغيرات والدوال
window.supabaseConfig = {
    supabase,
    ADMIN_PASSWORD,
    TABLES,
    initializeDatabase,
    showMessage,
    siteStats,
    updateStatsDisplay
};

// تهيئة فورية عند تحميل الملف
window.addEventListener('DOMContentLoaded', () => {
    window.supabaseConfig.initializeDatabase();
});
