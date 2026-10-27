import { PortalManual } from '../portalManuals';

export const portal3Manual: PortalManual = {
  windowId: 3,
  portalTitle: 'بوابة الفيديو السينمائي ومحاكاة الحركة (Cinematic Video & Motion)',
  portalSubtitle: 'دليل الإخراج السينمائي، تخطيط مسار الكاميرا، والتحكم في ديناميكية الحركة في نماذج Runway Gen-3 و Sora و Luma Dream Machine',
  totalLinesEstimate: 370,
  badge: 'دليل تشغيلي متقدم: استوديو الفيديو والحركة',
  overview: 'الانتقال من الصور الثابتة إلى الصورة الحية المتحركة يتطلب فهماً عميقاً لفيزياء الحركة، ومسار الكاميرا، وسرعة الغالق، والقص السينمائي. هنا تتعلم كيف توجه نماذج توليد الفيديو لتتحرك الكاميرا بسلاسة تامة وتتحرك الشخصيات بفيزيائية طبيعية خالية من التشوهات.',
  sections: [
    {
      id: 'p3-motion-physics',
      title: '1. فيزياء الحركة وتوجيه الكاميرا السينمائية (Motion Dynamics & Camera Paths)',
      summary: 'كيف تتحول الكلمات إلى لقطات متحركة خالية من الاهتزاز والتشوه الزمني',
      content: [
        'في عالم الفيديو الرقمي بالذكاء الاصطناعي، يتم حساب الحركة عبر بُعدين متزامنين:',
        '1. حركة الكاميرا (Camera Motion Dynamics):',
        '• الدوران والمسح الأفقي (Pan Left / Pan Right): استعراض بيئة المشهد أفقياً بسلاسة ثابتة دون تذبذب.',
        '• الإمالة الرأسية (Tilt Up / Tilt Down): كشف مفاجآت في المشهد من الأرض إلى السماء أو العكس.',
        '• حركة التتبع المرافقة (Tracking Shot / Dolly In & Out): الاقتراب المادي للكاميرا من الهدف لخلق إحساس حميمي ودرامي متصاعد.',
        '• اللقطة الرافعة والدرون (Crane Shot / FPV Drone Flythrough): الطيران فوق السحب أو الانحدار السريع عبر الشرفات والممرات الضيقة.',
        '• الحركة المدارية (Orbit 360): الدوران الدائري الكامل حول الشخصية لإبراز أهميتها الاستثنائية في اللحظة الحرجة.',
        '',
        '2. الحركة الداخلية للعناصر (Internal Subject Physics):',
        '• تدفق السوائل والأمواج بدون تشوه الجزيئات أو تراجعها للخلف.',
        '• حركة الملابس والرياح وفق ديناميكية الأقمشة الحقيقية (Cloth Simulation Physics).',
        '• حركات مشي وجري متناسقة تحافظ على ثبات ملامح الوجه والأطراف عبر الإطارات المتعاقبة.'
      ]
    },
    {
      id: 'p3-video-prompts-structure',
      title: '2. هيكلية صياغة برومبت الفيديو الزمني (Temporal Video Prompt Syntax)',
      summary: 'المعادلة الخماسية لكتابة أوامر الفيديو التي تضمن التناسق وعدم تشوه الكائنات',
      content: [
        'يختلف برومبت الفيديو عن الصورة؛ إذ يجب أن يصف "ما يحدث بمرور الثواني":',
        '[نوع اللقطة وحركة الكاميرا المحددة] + [الفعل والحركة المستمرة للشخصية] + [سرعة الحركة والإيقاع] + [البيئة والطقس والإضاءة المتغيرة] + [المعايير التقنية ومعدل الإطارات]',
        '',
        'المصطلحات السينمائية الإلزامية في برومبت الفيديو:',
        '• مصطلحات حركة الكاميرا: Smooth cinematic dolly forward, Slow dramatic crane shot rising, Dynamic FPV drone swoop, Steadycam tracking shot behind the character, Handheld subtle documentary sway.',
        '• مصطلحات إيقاع الحركة: Slow-motion 120fps, High-speed freeze frame, Gentle ambient wind blowing, Hyper-lapse passing clouds, Real-time natural movement.',
        '• مصطلحات النمط السينمائي: 35mm anamorphic lens, 2.39:1 widescreen cinemascope, Cinematic lighting, Arri Alexa Mini LF footage, Color graded by Hollywood colorist.',
        '',
        'قائمة السلبيات الزمنية الحرجة (Temporal Negative Prompts):',
        'negative prompt: morphing, melting, flickering, distorted anatomy across frames, camera shake, jitter, jerky motion, teleporting limbs, low frame rate, blurry motion, artifacting.'
      ]
    },
    {
      id: 'p3-camera-moves-matrix',
      title: '3. مصفوفة حركات الكاميرا وتأثيراتها النفسية (Camera Motion Matrix)',
      summary: 'جدول تفصيلي يربط نوع حركة الكاميرا بالشعور الدرامي الذي توصله للمشاهد',
      content: [
        '• Dolly Zoom (تأثير فيرتيجو الكلاسيكي): الكاميرا تقترب والعدسة تتسع للخلف، مما يعطي شعوراً فورياً بالصدمة أو الذهول.',
        '• Whip Pan (الانتقال السريع المفاجئ): حركة سريعة جداً تمسح المشهد لتنتقل بين نقطتين، ممتازة لمشاهد الحركة والمطاردات.',
        '• Low-Angle Hero Push: اقتراب الكاميرا من الأسفل إلى الأعلى نحو الشخصية لإظهار هيبتها وقوتها المفرطة.',
        '• Top-Down Bird\'s Eye View: مشهد عمودي مباشر من الفضاء أو السماء يكشف المتاهات وتشكيلات الجيوش والمناظر الطبيعية.',
        '• Static Locked-Off Camera: كاميرا مثبتة تماماً على حامل بينما تتحرك عناصر المشهد داخل الإطار؛ مناسبة للقطات التأملية والمطر.'
      ]
    },
    {
      id: 'p3-models-benchmark',
      title: '4. المقارنة الهندسية لنماذج الفيديو العالمية (AI Video Models Benchmark)',
      summary: 'نقاط القوة والضعف وكيفية توظيف كل نموذج للحصول على أفضل نتيجة إنتاجية',
      content: [
        '• Runway Gen-3 Alpha: الأفضل في التحكم بحركة الكاميرا الموجهة واللقطات السريعة والتأثيرات الخيالية المعقدة.',
        '• OpenAI Sora: الملك في فهم فيزياء العالم الحقيقي، التفاعل بين السوائل والأجسام الصلبة، والمشاهد شديدة الطول والتفاصيل.',
        '• Luma Dream Machine: الأسرع في استجابة الحركة ثلاثية الأبعاد الدائرية وتوليد مقاطع بصرية متماسكة في ثوانٍ معدودة.',
        '• Kling AI: ممتاز في حركة الأطراف البشرية، وتعبيرات الوجه الدقيقة، وتوليد المشاهد الحركية اليومية دون تشوه ملموس.'
      ]
    },
    {
      id: 'p3-frame-rate-cinematics',
      title: '5. ضبط معدل الإطارات وسرعة الغالق (Frame Rates & Shutter Angles)',
      summary: 'الأساس الفيزيائي للحصول على سلاسة حركية واقعية في العرض السينمائي',
      content: [
        '• معيار 24 إطاراً في الثانية (24fps Cinematic Standard): الإيقاع السينمائي الذهبي لجميع الأفلام والمسلسلات الكبرى.',
        '• زاوية الغالق 180 درجة (180-Degree Shutter Rule): تعني أن سرعة الغالق تساوي 1/48 من الثانية عند 24fps، مما ينتج ضبابية حركة طبيعية تامة.',
        '• الحركة البطيئة الخارقة (120fps High-Speed Slow Motion): مثالية لتصوير رذاذ الماء، شرارات اللهب، ولقطات الرياضات السريعة.',
        '• التايم لابس والهايبر لابس (Time-lapse & Hyper-lapse): تسريع حركة السحب وحركة مرور السيارات في شوارع المدن لإنتاج فواصل زمنية ساحرة.'
      ]
    },
    {
      id: 'p3-troubleshooting',
      title: '6. حل مشكلات ومفارقات توليد الفيديو (Video Artifacts & Temporal Glitches)',
      summary: 'كيف تقضي على ذوبان الوجوه، ارتعاش الإطارات، والحركات الفيزيائية غير المنطقية',
      content: [
        'المشكلة 1: تحول الشخصية أو ذوبان ملامحها وتغير ملابسها في منتصف الفيديو (Morphing Glitch)',
        '• السبب: محاولة وصف تحولات كثيرة ومتناقضة في أمر نصي واحد مدته 4 أو 5 ثوانٍ.',
        '• الحل: ركز على فعل حركي واحد متصل ومستمر، مثل: "walking steadily forward along the shore without turning".',
        '',
        'المشكلة 2: ارتعاش الإضاءة والظلال بين الإطارات (Flickering Shadows & Lights)',
        '• السبب: تعارض مصادر الإضاءة في التوجيه النصي.',
        '• الحل: أضف "consistent lighting, stable global illumination, no flickering, smooth temporal coherence".',
        '',
        'المشكلة 3: الكاميرا تتحرك بسرعة مفرطة ومزعجة تشتت الانتباه',
        '• الحل: حدد وتيرة الحركة صراحة: "extremely slow, smooth, buttery fluid motion, gentle 2-second crawl".'
      ]
    },
    {
      id: 'p3-blueprints',
      title: '7. سيناريوهات فيديو سينمائية كاملة (Cinematic Video Blueprints)',
      summary: 'أوامر حقيقية معتمدة لإنتاج مشاهد سينمائية ومقاطع إعلانية فاخرة',
      content: [
        'النموذج 1: اللقطة الافتتاحية الملحمية للطائرة الرياضية (FPV Mountain Glide)',
        'البرومبت: Breathtaking cinematic FPV drone tracking shot gliding seamlessly down snowy Swiss Alps mountain ridge at golden hour, sharp crisp snow spray kicking up, dramatic warm sunlight flares, smooth continuous 60fps motion, shot on Arri Alexa LF with anamorphic lens, cinema aspect ratio --ar 21:9',
        'السلبيات: jerky movement, stuttering, morphing mountain peaks, flickering sky, blurry compression',
        '',
        'النموذج 2: لقطة اقتراب درامي من بطل المعركة (Slow-Motion Cinematic Close-Up)',
        'البرومبت: Intense cinematic slow-motion 120fps tracking shot slowly dollying forward into the determined eyes of a futuristic knight standing in falling rain, raindrops bouncing off metallic shoulder armor in crisp macro detail, neon city background with soft blurred bokeh, emotional film score aesthetic --ar 16:9',
        'السلبيات: extra limbs, shifting facial features, unstable reflections, melting metal, cartoonish',
        '',
        'النموذج 3: لقطة استعراضية سيارة رياضية مسرعة في النفق (Neon Tunnel Hyperdrive)',
        'البرومبت: Dynamic low-angle tracking camera speeding alongside a sleek matte-black sports car tearing through a neon-lit futuristic tunnel, streaks of magenta and cyan light reflecting across glossy aerodynamic curves, cinematic motion blur on wheels, crisp reflection on windshield --ar 16:9',
        'السلبيات: wobbling car frame, deformed wheels, irregular motion, low frame rate, artifacts'
      ]
    },
    {
      id: 'p3-video-glossary',
      title: '8. معجم الإخراج السينمائي والفيديو الرقمي (Cinematic Motion Glossary)',
      summary: 'المصطلحات الفنية المعتمدة في الإخراج الرقمي وهندسة الفيديو',
      content: [
        '• Temporal Coherence: التناسق الزمني بين الإطارات المتتابعة لضمان ثبات هوية الشخصية والبيئة دون ارتعاش.',
        '• Anamorphic Lens: عدسات سينمائية تعطي مظهراً عريضاً وتوهجات أفقية مميزة (Horizontal Lens Flares) وبوكيه بيضاوي.',
        '• Shutter Angle (زاوية الغالق 180°): الإعداد السينمائي القياسي الذي يمنح الحركة ضبابية طبيعية تريح العين البشرية.',
        '• Dolly In / Dolly Out: تقريب الكاميرا بأكملها نحو الهدف أو إبعادها عنه عبر مسار ميكانيكي سلس.',
        '• Frame Rate (FPS): عدد الإطارات في الثانية؛ 24fps للفيلم السينمائي الكلاسيكي، و 60-120fps للحركة البطيئة الفائقة.'
      ]
    },
    {
      id: 'p3-protips',
      title: '9. أسرار مونتاج مقاطع الفيديو المولدة (Post-Gen Editing Secrets)',
      summary: 'كيف تدمج لقطات الذكاء الاصطناعي في إعلان متماسك أو فيلم قصير متقن',
      content: [
        '• قاعدة الثلاث ثوانٍ الذهبية: لا تطالب النموذج بتوليد 10 ثوانٍ في خطوة واحدة؛ ولد لقطات بطول 3 إلى 4 ثوانٍ وادمجها في برنامج مونتاج مع انتقالات ذكية.',
        '• استخدم الصورة كمرجع أولي (Image-to-Video): أنشئ أفضل إطار ثابت في البوابة الأولى بجودة 8K، ثم مرره هنا كإطار أولي لحركة الكاميرا لضمان واقعية مثالية.',
        '• الإثراء الصوتي المتزامن: أضف مؤثرات الصوت المحيطي (Foley & SFX) عبر البوابة الرابعة لتمنح الفيديو وزناً واقعياً مذهلاً.'
      ]
    }
  ]
};
