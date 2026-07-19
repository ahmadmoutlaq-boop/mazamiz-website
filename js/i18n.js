/* =========================================================
   مزمز — نظام تعدد اللغات (عربي/إنجليزي)
   -----------------------------------------------------------
   الآلية: أي عنصر بالصفحة عليه data-i18n="key" يترجم نصه
   تلقائيًا حسب اللغة المختارة. data-i18n-placeholder="key"
   يترجم placeholder لحقول الإدخال. اللغة تُحفظ بـ localStorage
   وتُطبَّق فورًا عند تحميل كل صفحة.

   ملاحظة نطاق: هذا الملف يغطي عناصر الواجهة (التنقل، الأزرار،
   النماذج، الفوتر، عناوين الأقسام، المنتجات) على الصفحات
   الموجّهة للعملاء. لوحات الإدارة تبقى بالعربية فقط لأنها أداة
   داخلية، ونفس الشي لتفاصيل آراء العملاء الفردية.
   ========================================================= */

const LANG_KEY = 'mazamiz_lang';

const DICT = {
  ar: {
    'nav.home': 'الرئيسية', 'nav.products': 'المنتجات', 'nav.about': 'من نحن', 'nav.contact': 'تواصل معنا',

    'hero.eyebrow': 'موسم القطاف بدأ الآن',
    'hero.title1': 'طعم الصيف', 'hero.title2': 'الحقيقي',
    'hero.subtitle': 'بطيخ أحمر وأصفر كويتي، وشمام وتين، وفواكه صيفية مختارة — يُقطف في أوجه نضجه، يُغسل ويُفرز بعناية، ويصلك في نفس يوم الطلب.',
    'hero.cta1': 'تسوّق المنتجات', 'hero.cta2': 'تعرّف على قصتنا',
    'hero.stat1': 'سنة خبرة في الأرض', 'hero.stat2': 'فرز يدوي دقيق', 'hero.stat3': 'من القطف إلى بابك',

    'teaser.eyebrow': 'لماذا مزمز',
    'teaser.heading': 'من الحقل إلى مائدتك، دون وسيط ودون تنازل عن الجودة',
    'teaser.body': 'نختار أرضًا وموسمًا وصنفًا بعناية، ونحصد كل ثمرة في لحظة نضجها المثالية. لا تبريد طويل، ولا تخزين مطوّل — فقط طزاجة تصل إليك كما هي.',
    'teaser.badge1': 'طازج يوميًا', 'teaser.badge2': 'نظيف ومفروز يدويًا', 'teaser.badge3': 'مختار بعناية',
    'teaser.cta': 'اقرأ قصتنا كاملة',

    'products.eyebrow': 'منتجاتنا', 'products.heading': 'ثمار الموسم، معيار واحد للجودة',
    'products.sub': 'كل صنف من إنتاج مزمز و وتين يمرّ بفرز دقيق قبل أن يصل إليك.',
    'products.search': 'ابحث عن منتج... (مثال: بطيخ، شمام)',
    'products.empty': 'ما لقينا منتجات مطابقة لبحثك. جرب كلمة أخرى.',
    'products.addbtn': 'أضف إلى السلة', 'products.added': 'أُضيف',
    'products.perkg': 'د.ك / كغ',
    'products.bestseller': 'الأكثر مبيعًا', 'products.seasonal': 'موسمي',

    'p.red.name': 'بطيخ أحمر كويتي', 'p.red.desc': 'حلاوة عالية وقشرة رفيعة، من مزارع الوفرة. مثالي لأيام الصيف الحارة وعصائر منعشة.',
    'p.yellow.name': 'بطيخ أصفر', 'p.yellow.desc': 'نكهة أكثر عمقًا وحلاوة عسلية مميزة، ولون داخلي أصفر ذهبي يبهر ضيوفك على السفرة.',
    'p.shamam.name': 'شمام كويتي', 'p.shamam.desc': 'رائحة عطرية غنية وقوام طري حلو المذاق، يُقطف يدويًا في ذروة نضجه من مزارع وتين.',
    'p.strawberry.name': 'فراولة', 'p.strawberry.desc': 'حبات مختارة بعناية، حلوة ومنعشة، غنية بفيتامين C ومثالية كوجبة خفيفة صحية.',
    'p.mango.name': 'مانجو', 'p.mango.desc': 'قوام طري وحلاوة استوائية غنية، من أفضل أصناف المانجو المختارة لموسم الصيف.',
    'p.grapes.name': 'عنب', 'p.grapes.desc': 'عناقيد مقرمشة وحلوة، مغسولة ومفروزة بعناية، خيار مثالي لسفرة العائلة.',

    'features.eyebrow': 'معايير مزمز', 'features.heading': 'ثلاثة معايير لا نتنازل عنها',
    'features.1.title': 'جودة مضمونة', 'features.1.desc': 'كل ثمرة تمرّ بفحص وزن ونضج قبل التعبئة، ونستبدل أي طلب لا يرقى إلى معاييرنا فورًا.',
    'features.2.title': 'منتجات طازجة', 'features.2.desc': 'نقطف عند الطلب أو في نفس الصباح، دون تخزين مبرد طويل يفقد الثمار نكهتها الطبيعية.',
    'features.3.title': 'توصيل سريع', 'features.3.desc': 'توصيل في نفس اليوم داخل الكويت، وتغليف مبرّد يحافظ على الطزاجة حتى باب بيتك.',

    'stats.1': 'سنة خبرة', 'stats.2': 'عميل سعيد', 'stats.3': 'طلب تم توصيله', 'stats.4': 'متوسط تقييم العملاء',
    'luck.trigger': '🎁 جرّب حظك', 'luck.title': '🎁 عجلة الحظ', 'luck.sub': 'دوّر العجلة وجرّب حظك — ميزة ترفيهية فقط',
    'luck.resultNote': 'مبروك! هذه نتيجة تجريبية للترفيه فقط.',

    'testimonials.eyebrow': 'آراء العملاء', 'testimonials.heading': 'ثقة عملائنا هي معيارنا الحقيقي',

    'cta.heading': 'جاهز لتجربة طعم الصيف الحقيقي؟', 'cta.sub': 'اطلب الآن واستلم ثمارك الطازجة في نفس اليوم.', 'cta.button': 'تسوّق الآن',

    'footer.about': 'بطيخ أحمر وأصفر كويتي، وشمام وتين، وفواكه صيفية مختارة. طازج، نظيف، ومختار بعناية.',
    'footer.quicklinks': 'روابط سريعة', 'footer.contact': 'تواصل', 'footer.admin': 'الإدارة', 'footer.manager': 'المدير: أحمد',
    'footer.rights': '© 2026 مزمز. جميع الحقوق محفوظة.',

    'cart.title': 'سلة المشتريات', 'cart.empty': 'سلتك فارغة حاليًا. أضف بعضًا من ثمار مزمز الطازجة.',
    'cart.total': 'الإجمالي', 'cart.checkout': 'إتمام الشراء', 'cart.remove': 'إزالة',
    'cart.prizeApplied': 'جائزتك مطبّقة:', 'cart.prizeFreeShip': 'سيتم إلغاء رسوم التوصيل عند إتمام الطلب',

    'checkout.eyebrow': 'خطوة أخيرة', 'checkout.heading': 'إتمام الطلب', 'checkout.sub': 'راجع طلبك، عبّي بيانات التوصيل، وأكّد — الدفع نقدًا عند الاستلام.',
    'checkout.emptyMsg': 'سلتك فارغة حاليًا، ما في شي لإتمام طلبه.', 'checkout.browse': 'تصفّح المنتجات',
    'checkout.summary': 'ملخص طلبك', 'checkout.subtotal': 'المجموع الفرعي', 'checkout.discount': 'الخصم',
    'checkout.delivery': 'التوصيل', 'checkout.grandtotal': 'الإجمالي النهائي', 'checkout.free': 'مجاني',
    'checkout.paymentTitle': 'طريقة الدفع', 'checkout.paymentText': 'حالياً الدفع متاح نقداً عند الاستلام فقط.',
    'checkout.name': 'الاسم الكامل *', 'checkout.phone': 'رقم الهاتف *', 'checkout.area': 'المنطقة *',
    'checkout.block': 'القطعة *', 'checkout.street': 'الشارع *', 'checkout.avenue': 'الجادة',
    'checkout.building': 'المنزل / البناية *', 'checkout.floorapt': 'الدور والشقة', 'checkout.notes': 'ملاحظات إضافية',
    'checkout.confirm': 'تأكيد الطلب', 'checkout.required': 'الحقول المعلّمة بـ * إلزامية.',
    'checkout.successTitle': 'تم استلام طلبك بنجاح!', 'checkout.successNum': 'رقم طلبك:',
    'checkout.successNote': 'سيتواصل معك فريق مزمز قريبًا لتأكيد موعد التوصيل. الدفع نقدًا عند الاستلام.',
    'checkout.backHome': 'العودة للرئيسية',

    'about.eyebrow': 'قصتنا', 'about.heading': 'زراعة أصيلة، بمعايير حديثة',
    'about.sub': 'مزمز بدأت من أرض كويتية بسيطة، وتحوّلت اليوم إلى علامة موثوقة لأجود أنواع البطيخ والشمام — دون أن نتنازل عن قيمة واحدة اعتقدنا بها منذ البداية: الطزاجة الحقيقية.',
    'about.storyEyebrow': 'البداية', 'about.storyHeading': 'من الوفرة إلى بيتك',
    'about.story1': 'بدأت مزمز كمزرعة عائلية صغيرة في الوفرة، حيث التربة الخصبة والشمس الدافئة تمنح البطيخ حلاوته المميزة. مع مرور السنوات، توسّعنا لنشمل صنف البطيخ الأصفر، وتعاونّا مع مزارعي وتين لتقديم شمام كويتي أصيل.',
    'about.story2': 'اليوم، ما زلنا نتعامل مع كل ثمرة كما لو كانت الأولى: نفحصها، نغسلها، ونفرزها يدويًا قبل أن تصل إليك. لأن الجودة عندنا ليست شعارًا، بل عادة يومية.',
    'about.valuesEyebrow': 'قيمنا', 'about.valuesHeading': 'ما يوجّه كل قرار نتخذه',
    'about.v1t': 'النقاء', 'about.v1h': 'بدون إضافات', 'about.v1d': 'ثمار طبيعية 100%، تنمو بلا اختصارات وتصل إليك كما خلقها الله.',
    'about.v2t': 'الدقة', 'about.v2h': 'فرز صارم', 'about.v2d': 'كل ثمرة تُفحص وزنًا ونضجًا قبل أن تحمل اسم مزمز أو وتين.',
    'about.v3t': 'السرعة', 'about.v3h': 'من الحقل لبابك', 'about.v3d': 'نقلل زمن التخزين إلى أدنى حد، لتصلك الثمرة في أوج طزاجتها.',
    'about.v4t': 'الثقة', 'about.v4h': 'علاقة تدوم', 'about.v4d': 'نبني علاقتنا مع عملائنا على الصدق في الوزن والسعر والجودة.',
    'about.timelineEyebrow': 'مسيرتنا', 'about.timelineHeading': 'محطات في رحلة مزمز',
    'about.t1y': 'البداية', 'about.t1h': 'مزرعة عائلية في الوفرة', 'about.t1d': 'انطلقت الفكرة من قطعة أرض صغيرة وشغف عائلي بزراعة البطيخ الأحمر بجودة عالية.',
    'about.t2y': 'التوسع', 'about.t2h': 'إضافة البطيخ الأصفر', 'about.t2d': 'استجابةً لطلب متزايد على النكهات المميزة، أدخلنا صنف البطيخ الأصفر إلى إنتاجنا.',
    'about.t3y': 'الشراكة', 'about.t3h': 'ولادة علامة وتين', 'about.t3d': 'تعاوننا مع مزارعي شمام موثوقين لإطلاق علامة وتين المتخصصة بالشمام الكويتي الأصيل.',
    'about.t4y': 'اليوم', 'about.t4h': 'مزمز الرقمية', 'about.t4d': 'نقلنا تجربة الطزاجة إلى الإنترنت، ليصلك أفضل ما لدينا بضغطة زر.',
    'about.ctaHeading': 'تعرّفت علينا، الآن جرّب ثمارنا', 'about.ctaSub': 'تصفّح منتجات مزمز و وتين واطلب طزاجتك اليوم.',

    'contact.eyebrow': 'تواصل معنا', 'contact.heading': 'يسعدنا سماع رأيك',
    'contact.sub': 'لأي استفسار عن الطلبات، التوصيل، أو الشراكات، فريق مزمز جاهز للرد عليك في أسرع وقت.',
    'contact.phoneTitle': 'الهاتف', 'contact.emailTitle': 'البريد الإلكتروني', 'contact.locationTitle': 'الموقع',
    'contact.locationText': 'الكويت — توصيل داخل الكويت', 'contact.hoursTitle': 'أوقات العمل', 'contact.hoursText': 'يوميًا من الساعة 8 صباحًا حتى 10 مساءً',
    'contact.mapTitle': 'مزمز — الكويت', 'contact.mapSub': 'خريطة توضيحية لموقع مركز التوزيع الرئيسي',
    'contact.subject': 'الموضوع', 'contact.subj1': 'استفسار عن طلب', 'contact.subj2': 'مشكلة في التوصيل', 'contact.subj3': 'شراكة أو تعاون', 'contact.subj4': 'أخرى',
    'contact.message': 'رسالتك', 'contact.send': 'إرسال الرسالة', 'contact.demoNote': 'هذا النموذج تجريبي ولا يرسل بيانات فعليًا.',

    'account.loginTab': 'تسجيل الدخول', 'account.signupTab': 'إنشاء حساب',
    'account.username': 'اسم المستخدم', 'account.password': 'كلمة المرور', 'account.confirmPassword': 'تأكيد كلمة المرور',
    'account.loginBtn': 'دخول', 'account.signupBtn': 'إنشاء الحساب',
    'account.noAccount': 'ما عندك حساب؟', 'account.haveAccount': 'عندك حساب أصلاً؟',

    'profile.heading': 'الملف الشخصي', 'profile.username': 'اسم المستخدم', 'profile.memberSince': 'تاريخ إنشاء الحساب',
    'profile.myOrders': 'عرض طلباتي', 'profile.logout': 'تسجيل خروج', 'profile.loginPrompt': 'سجّل الدخول لعرض ملفك الشخصي.',

    'myorders.heading': 'طلباتي', 'myorders.empty': 'ما عندك أي طلبات بعد.', 'myorders.loginPrompt': 'سجّل الدخول لعرض طلباتك.',
    'myorders.orderNum': 'رقم الطلب', 'myorders.date': 'التاريخ', 'myorders.total': 'الإجمالي', 'myorders.status': 'الحالة',

    'status.pending': 'قيد المراجعة', 'status.confirmed': 'تم تأكيد الطلب', 'status.preparing': 'جاري التجهيز',
    'status.out': 'خرج للتوصيل', 'status.delivered': 'تم التسليم'
  },

  en: {
    'nav.home': 'Home', 'nav.products': 'Products', 'nav.about': 'About', 'nav.contact': 'Contact',

    'hero.eyebrow': 'Harvest season has started',
    'hero.title1': 'The Real Taste', 'hero.title2': 'of Summer',
    'hero.subtitle': 'Kuwaiti red and yellow watermelon, cantaloupe, and hand-picked summer fruit — harvested at peak ripeness, washed and sorted with care, delivered the same day you order.',
    'hero.cta1': 'Shop Products', 'hero.cta2': 'Read Our Story',
    'hero.stat1': 'years of farming experience', 'hero.stat2': 'careful hand sorting', 'hero.stat3': 'from harvest to your door',

    'teaser.eyebrow': 'Why Mazamiz',
    'teaser.heading': 'From the field to your table — no middleman, no compromise on quality',
    'teaser.body': 'We carefully choose the land, season, and variety, and harvest every fruit at the perfect moment of ripeness. No long cold storage — just freshness that reaches you as it is.',
    'teaser.badge1': 'Fresh daily', 'teaser.badge2': 'Clean & hand-sorted', 'teaser.badge3': 'Carefully selected',
    'teaser.cta': 'Read our full story',

    'products.eyebrow': 'Our Products', 'products.heading': 'Fruits of the season, one standard of quality',
    'products.sub': 'Every item from Mazamiz and Wateen goes through careful sorting before it reaches you.',
    'products.search': 'Search products... (e.g. watermelon, cantaloupe)',
    'products.empty': 'No matching products found. Try a different word.',
    'products.addbtn': 'Add to Cart', 'products.added': 'Added',
    'products.perkg': 'KWD / kg',
    'products.bestseller': 'Best Seller', 'products.seasonal': 'Seasonal',

    'p.red.name': 'Kuwaiti Red Watermelon', 'p.red.desc': 'Extra sweet with a thin rind, from Al-Wafra farms. Perfect for hot summer days and fresh juice.',
    'p.yellow.name': 'Yellow Watermelon', 'p.yellow.desc': 'A deeper, honey-like sweetness with a striking golden-yellow flesh that stands out on the table.',
    'p.shamam.name': 'Kuwaiti Cantaloupe', 'p.shamam.desc': 'Rich aroma and soft, sweet texture, hand-picked at peak ripeness from Wateen farms.',
    'p.strawberry.name': 'Strawberries', 'p.strawberry.desc': 'Carefully selected, sweet and refreshing, rich in vitamin C — a perfect healthy snack.',
    'p.mango.name': 'Mango', 'p.mango.desc': 'Soft texture and rich tropical sweetness, from the finest mango varieties of the season.',
    'p.grapes.name': 'Grapes', 'p.grapes.desc': 'Crisp, sweet bunches, washed and sorted with care — perfect for the family table.',

    'features.eyebrow': 'Our Standards', 'features.heading': 'Three standards we never compromise on',
    'features.1.title': 'Guaranteed Quality', 'features.1.desc': 'Every fruit is checked for weight and ripeness before packing, and any order that falls short is replaced immediately.',
    'features.2.title': 'Fresh Produce', 'features.2.desc': 'Picked on order or the same morning — no long cold storage that dulls the natural flavor.',
    'features.3.title': 'Fast Delivery', 'features.3.desc': 'Same-day delivery across Kuwait, with cooled packaging that keeps everything fresh to your door.',

    'stats.1': 'Years of Experience', 'stats.2': 'Happy Customers', 'stats.3': 'Orders Delivered', 'stats.4': 'Average Rating',
    'luck.trigger': '🎁 Try Your Luck', 'luck.title': '🎁 Lucky Wheel', 'luck.sub': 'Spin the wheel and try your luck — just for fun',
    'luck.resultNote': 'Congrats! This is a demo result for entertainment only.',

    'testimonials.eyebrow': 'Customer Reviews', 'testimonials.heading': 'Our customers trust is our real standard',

    'cta.heading': 'Ready to taste real summer?', 'cta.sub': 'Order now and get your fresh fruit the same day.', 'cta.button': 'Shop Now',

    'footer.about': 'Kuwaiti red and yellow watermelon, cantaloupe, and hand-picked summer fruit. Fresh, clean, and carefully selected.',
    'footer.quicklinks': 'Quick Links', 'footer.contact': 'Contact', 'footer.admin': 'Management', 'footer.manager': 'Manager: Ahmad',
    'footer.rights': 'Mazamiz. All rights reserved.',

    'cart.title': 'Shopping Cart', 'cart.empty': 'Your cart is empty. Add some fresh Mazamiz fruit.',
    'cart.total': 'Total', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove',
    'cart.prizeApplied': 'Your prize is applied:', 'cart.prizeFreeShip': 'Delivery fee will be waived at checkout',

    'checkout.eyebrow': 'Last Step', 'checkout.heading': 'Checkout', 'checkout.sub': 'Review your order, fill in delivery details, and confirm — cash on delivery.',
    'checkout.emptyMsg': 'Your cart is empty, nothing to check out.', 'checkout.browse': 'Browse Products',
    'checkout.summary': 'Order Summary', 'checkout.subtotal': 'Subtotal', 'checkout.discount': 'Discount',
    'checkout.delivery': 'Delivery', 'checkout.grandtotal': 'Grand Total', 'checkout.free': 'Free',
    'checkout.paymentTitle': 'Payment Method', 'checkout.paymentText': 'Currently, only Cash on Delivery is available.',
    'checkout.name': 'Full Name *', 'checkout.phone': 'Phone Number *', 'checkout.area': 'Area *',
    'checkout.block': 'Block *', 'checkout.street': 'Street *', 'checkout.avenue': 'Avenue',
    'checkout.building': 'House / Building *', 'checkout.floorapt': 'Floor & Apartment', 'checkout.notes': 'Additional Notes',
    'checkout.confirm': 'Confirm Order', 'checkout.required': 'Fields marked with * are required.',
    'checkout.successTitle': 'Your order was received!', 'checkout.successNum': 'Order number:',
    'checkout.successNote': 'The Mazamiz team will contact you soon to confirm delivery. Payment on delivery.',
    'checkout.backHome': 'Back to Home',

    'about.eyebrow': 'Our Story', 'about.heading': 'Authentic farming, modern standards',
    'about.sub': 'Mazamiz started from a simple plot of land in Kuwait, and grew into a trusted name for the finest watermelon and cantaloupe — without ever compromising on the one value we believed in from day one: real freshness.',
    'about.storyEyebrow': 'The Beginning', 'about.storyHeading': 'From Al-Wafra to your home',
    'about.story1': 'Mazamiz began as a small family farm in Al-Wafra, where fertile soil and warm sun give watermelon its signature sweetness. Over the years we expanded into yellow watermelon, and partnered with cantaloupe growers to bring you authentic Kuwaiti cantaloupe under the Wateen name.',
    'about.story2': 'Today, we still treat every fruit like its the first: inspected, washed, and hand-sorted before it reaches you. Because quality here is not a slogan, its a daily habit.',
    'about.valuesEyebrow': 'Our Values', 'about.valuesHeading': 'What guides every decision we make',
    'about.v1t': 'Purity', 'about.v1h': 'No additives', 'about.v1d': '100% natural fruit, grown without shortcuts, reaching you exactly as nature made it.',
    'about.v2t': 'Precision', 'about.v2h': 'Strict sorting', 'about.v2d': 'Every fruit is checked for weight and ripeness before it can carry the Mazamiz or Wateen name.',
    'about.v3t': 'Speed', 'about.v3h': 'Field to door', 'about.v3d': 'We minimize storage time so every fruit reaches you at peak freshness.',
    'about.v4t': 'Trust', 'about.v4h': 'A lasting relationship', 'about.v4d': 'We build our relationship with customers on honesty in weight, price, and quality.',
    'about.timelineEyebrow': 'Our Journey', 'about.timelineHeading': 'Milestones along the Mazamiz journey',
    'about.t1y': 'The Start', 'about.t1h': 'A family farm in Al-Wafra', 'about.t1d': 'It all began with a small plot of land and a family passion for growing high-quality red watermelon.',
    'about.t2y': 'Expansion', 'about.t2h': 'Adding yellow watermelon', 'about.t2d': 'Responding to growing demand for distinctive flavors, we added yellow watermelon to our production.',
    'about.t3y': 'Partnership', 'about.t3h': 'The birth of Wateen', 'about.t3d': 'We partnered with trusted cantaloupe growers to launch Wateen, dedicated to authentic Kuwaiti cantaloupe.',
    'about.t4y': 'Today', 'about.t4h': 'Mazamiz goes digital', 'about.t4d': 'We brought the freshness experience online, so our best reaches you with one tap.',
    'about.ctaHeading': 'Now that you know us, try our fruit', 'about.ctaSub': 'Browse Mazamiz and Wateen products and order your freshness today.',

    'contact.eyebrow': 'Contact Us', 'contact.heading': 'We would love to hear from you',
    'contact.sub': 'For any question about orders, delivery, or partnerships, the Mazamiz team is ready to reply as fast as possible.',
    'contact.phoneTitle': 'Phone', 'contact.emailTitle': 'Email', 'contact.locationTitle': 'Location',
    'contact.locationText': 'Kuwait — delivery across Kuwait', 'contact.hoursTitle': 'Working Hours', 'contact.hoursText': 'Daily from 8 AM to 10 PM',
    'contact.mapTitle': 'Mazamiz — Kuwait', 'contact.mapSub': 'Illustrative map of our main distribution center',
    'contact.subject': 'Subject', 'contact.subj1': 'Order inquiry', 'contact.subj2': 'Delivery issue', 'contact.subj3': 'Partnership', 'contact.subj4': 'Other',
    'contact.message': 'Your Message', 'contact.send': 'Send Message', 'contact.demoNote': 'This is a demo form and does not actually send data.',

    'account.loginTab': 'Log In', 'account.signupTab': 'Sign Up',
    'account.username': 'Username', 'account.password': 'Password', 'account.confirmPassword': 'Confirm Password',
    'account.loginBtn': 'Log In', 'account.signupBtn': 'Create Account',
    'account.noAccount': "Don't have an account?", 'account.haveAccount': 'Already have an account?',

    'profile.heading': 'Profile', 'profile.username': 'Username', 'profile.memberSince': 'Member Since',
    'profile.myOrders': 'View My Orders', 'profile.logout': 'Log Out', 'profile.loginPrompt': 'Log in to view your profile.',

    'myorders.heading': 'My Orders', 'myorders.empty': "You don't have any orders yet.", 'myorders.loginPrompt': 'Log in to view your orders.',
    'myorders.orderNum': 'Order #', 'myorders.date': 'Date', 'myorders.total': 'Total', 'myorders.status': 'Status',

    'status.pending': 'Pending Review', 'status.confirmed': 'Order Confirmed', 'status.preparing': 'Preparing',
    'status.out': 'Out for Delivery', 'status.delivered': 'Delivered'
  }
};

function getLang(){
  return localStorage.getItem(LANG_KEY) || 'ar';
}

function applyLang(lang){
  lang = DICT[lang] ? lang : 'ar';
  localStorage.setItem(LANG_KEY, lang);

  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');

  const dict = DICT[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if(dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  // بعض المحتوى ينبنى ديناميكيًا بجافاسكربت (بطاقات السلة، ملخص
  // الدفع، قائمة الحساب...) — إذا كانت دوال إعادة الرسم هاي
  // محمّلة بالصفحة الحالية، نناديها حتى تلتقط اللغة الجديدة فورًا.
  if(typeof renderCart === 'function' && document.getElementById('cartItems')) renderCart();
  if(typeof renderOrderSummary === 'function' && document.getElementById('orderItems')) renderOrderSummary();
  if(typeof renderMyOrders === 'function' && document.getElementById('ordersList')) renderMyOrders();
  if(typeof renderAccountMenu === 'function') renderAccountMenu();
}

function toggleLang(){
  const next = getLang() === 'ar' ? 'en' : 'ar';
  applyLang(next);
}

window.MazamizI18n = { apply: applyLang, toggle: toggleLang, getLang, dict: DICT };

// يُطبَّق فورًا عند تحميل السكربت (العناصر أعلاه بالصفحة موجودة
// أصلاً بهالوقت لأن وسم السكربت موضوع آخر الصفحة).
applyLang(getLang());
