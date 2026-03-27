export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar border-t border-border py-8 mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* About */}
          <div className="text-right">
            <h3 className="font-bold text-foreground mb-2">عن الدليل</h3>
            <p className="text-sm text-muted-foreground">
              دليل تشغيلي شامل وموحد لجميع أقسام مطعم كأنه بيت، يضمن جودة الخدمة والتنظيم والاحترافية.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <h3 className="font-bold text-foreground mb-2">روابط سريعة</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <button className="hover:text-primary transition-all duration-300">
                  الفتحة الصباحية
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-all duration-300">
                  إدارة الكاش
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-all duration-300">
                  معايير الخدمة
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="text-right">
            <h3 className="font-bold text-foreground mb-2">معلومات</h3>
            <p className="text-sm text-muted-foreground">
              آخر تحديث: مارس {currentYear}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              الإصدار: 1.0
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>الدليل التشغيلي الموحد – كأنه بيت © {currentYear}</p>
            <p className="mt-2">
              جميع الحقوق محفوظة | تم تطويره بعناية لفريق كأنه بيت
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
