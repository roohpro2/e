import { PortalManual } from '../portalManuals';

export const portal1Manual: PortalManual = {
  windowId: 1,
  portalTitle: 'بوابة الصور الواقعية والفوتوغرافية (Photorealistic & Cinematic Studio)',
  portalSubtitle: 'الدليل الهندسي الشامل لتوليد صور فوتوغرافية فائقة النقاء بدقة 8K ومحاكاة الكاميرات والعدسات السينمائية العالمية',
  totalLinesEstimate: 380,
  badge: 'دليل تشغيلي متقدم: استوديو الواقعية 8K',
  overview: 'تعتبر هذه البوابة المركز الرئيسي لإنتاج الصور الفوتوغرافية التي لا يمكن تمييزها عن لقطات الكاميرات الحقيقية. يعتمد النظام على تحويل الأوصاف النصية المجردة إلى معادلات بصرية تحاكي المستشعرات الرقمية، والعدسات الاحترافية، وتدرجات الإضاءة الطبيعية، والعمق الميداني، ومسام الجلد، والظلال الفيزيائية الدقيقة.',
  sections: [
    {
      id: 'p1-architecture',
      title: '1. البنية المعمارية ونظام محاكاة البصريات (Optical Simulation Architecture)',
      summary: 'فهم آلية عمل محرك الرؤية وكيفية ترجمة الكلمات إلى فيزياء ضوئية حقيقية',
      content: [
        'يعمل محرك توليد الصور الواقعية على محاكاة المستشعرات الرقمية ذات الإطار الكامل (Full-Frame Sensors) والمتوسطة (Medium Format Sensors).',
        'عند صياغة البرومبت، لا يتعامل الذكاء الاصطناعي مع الكلمات كنصوص لغوية مجردة، بل كمعاملات بصرية هندسية تحاكي حركة الفوتونات الضوئية:',
        '• معامل تشتت الضوء (Light Diffusion): يحسب مسار الفوتونات عبر الغلاف الجوي، أو زجاج النوافذ، أو كتل السحب والضباب.',
        '• الانكسار تحت السطحي (Subsurface Scattering - SSS): السر الحقيقي وراء المظهر الطبيعي لجلد الإنسان، وأوراق الشجر، والبتلات، والشمع، والرخام.',
        '• البعد البؤري وعمق الميدان (Focal Length & Depth of Field): تحديد عزل الخلفية (Bokeh) باستخدام فتحات عدسة واسعة من f/1.2 إلى f/2.8.',
        '• التردد العالي للتفاصيل (High-Frequency Micro-Textures): إبراز تفاصيل مسام الجلد، ونسيج الأقمشة، وتعرجات الصخور الدقيقة دون تشويش.',
        '• الانعكاسات الحقيقية وقانون فرينل (Fresnel Reflections): حساب زاوية الرؤية بالنسبة للأسطح المبللة والمعدنية والزجاجية لتجنب اللمعان الزائف.',
        '• التشويش الحبيبي التناظري (Analog Film Grain): إضافة تدرج ناعم يحاكي حساسية أفلام 35mm لكسر الجمود الرقمي.',
        '• النطاق الديناميكي العالي (HDR Sensor Dynamic Range): الحفاظ على تفاصيل الظلال العميقة وتفاصيل الإضاءات الساطعة دون احتراق.',
        '• التشوه البصري الطبيعي (Optical Vignetting & Distortion): محاكاة انحناء حواف العدسات الواسعة وتلاشي الضوء عند الأطراف بنعومة.',
        'الهدف الأساسي للبوابة هو القضاء التام على التأثير البلاستيكي (Plastic Look) الذي تعاني منه الصور المولدة بالذكاء الاصطناعي الرديء.',
        'يتكامل المحرك بسلاسة مع مكتبات النماذج العالمية مثل FLUX.1 Dev و Midjourney v6.1 و SDXL Photorealism للوصول إلى نقاء بصري استثنائي.'
      ]
    },
    {
      id: 'p1-workflow',
      title: '2. مسار العمل الاحترافي خطوة بخطوة (Professional Step-by-Step Workflow)',
      summary: 'خريطة الطريق التنفيذية لإنتاج لقطة فوتوغرافية معتمدة بجودة مجلات التصوير العالمية',
      content: [
        'الخطوة الأولى: تحديد موضوع اللقطة بدقة مادية قابلة للقياس (Subject Definition)',
        'ابدأ بتحديد العنصر الأساسي بدون حشو لغوي؛ بدلاً من "رجل وسيم"، اكتب: "بورتريه قريب لرجل بدوي في الستينيات من عمره، ذو لحية بيضاء رمادية وتجاعيد دقيقة حول العينين".',
        'حدد زاوية النظر وتعبير الوجه وحالة التركيز (e.g., piercing intense gaze looking slightly away from the camera lens).',
        '',
        'الخطوة الثانية: اختيار نوع الكاميرا والمستشعر المناسب للمشهد (Camera & Sensor Selection)',
        'حدد الكاميرا لمنح النموذج مرجعية فيزيائية ولونية محددة بدقة:',
        '- كاميرات Hasselblad H6D-100c أو Phase One XF IQ4: للقطات الإعلانية فائقة الدقة وألوان الاستوديو الحيادية ذات التدرج اللوني 16-bit.',
        '- كاميرات Leica M11 مع عدسة Leica Summilux 50mm f/1.4: لتوثيق الشارع والصور الصحفية ذات التباين الدافئ والملمس الإنساني المميز.',
        '- كاميرات Sony A7R V أو Canon EOS R5 مع عدسة 85mm f/1.2: لبورتريهات الموضة والعزل السينمائي المتقن والبوكيه الدائري الحريري.',
        '- عدسات Macro 100mm f/2.8: لتصوير قطرات الندى، ومسام الجلد، وقزحية العين، والمجوهرات الدقيقة.',
        '',
        'الخطوة الثالثة: هندسة الإضاءة ومصادرها (Lighting Architecture & Falloff)',
        'الإضاءة هي روح الصورة؛ حدد نوعها ومصدرها وزاويتها بدقة:',
        '• إضاءة ريمبرانت (Rembrandt Lighting): تخلق مثلث ضوء مميز تحت العين في الجانب المظلل من الوجه مما يمنحه عمقاً درامياً.',
        '• إضاءة الشفق الذهبي (Golden Hour Rim Light): تمنح الموضوع هالة دافئة عند الحواف وتفصله عن الخلفية بنعومة بالغة.',
        '• الإضاءة الحجمية (Volumetric God Rays): تظهر جزيئات الغبار أو الضباب مع خيوط ضوء الشمس النافذة من الشرفات أو الغابات.',
        '• الإضاءة المشتتة عبر السحاب (Overcast Softbox Sky): ضوء طبيعي خافت وموحد يقلل الظلال القاسية على البشرة وتدرجات الثياب.',
        '• إضاءة الكياروسكورو (Chiaroscuro High Contrast): تباين حاد بين الضوء الشديد والعتمة المطلقة لمحاكاة لوحات عصر النهضة.',
        '',
        'الخطوة الرابعة: ضبط التكوين الفني والمساحات الفارغة (Composition & Negative Space)',
        'استخدم قواعد التكوين مثل قاعدة الأثلاث (Rule of Thirds)، والخطوط الإرشادية (Leading Lines)، والتماثل، ونسبة العزل (Bokeh Quality).',
        'حدد المسافة بين الكاميرا والهدف (Extreme Close-up, Medium Close-up, Wide Environmental Shot).',
        '',
        'الخطوة الخامسة: التدقيق اللوني والتصدير المتقن (Color Grading & Film Stock)',
        'حدد النمط اللوني النهائي مثل كوداك إكتار (Kodak Ektar 100) للتشبع الطبيعي للمناظر، أو كوداك بورترا (Kodak Portra 400) لنضارة البشرة.'
      ]
    },
    {
      id: 'p1-prompt-grammar',
      title: '3. قواعد صياغة البرومبت الفوتوغرافي (Prompt Grammar & Vocabulary)',
      summary: 'القالب الهندسي القياسي لتركيب الأوامر الاحترافية لضمان أعلى نسبة نجاح من المحاولة الأولى',
      content: [
        'تعتمد الصياغة الاحترافية على معادلة العناصر الستة الذهبية:',
        '[الموضوع الأساسي بالتفصيل المادي] + [البيئة والخلفية المعمارية أو الطبيعية] + [نوع ومصدر الإضاءة وزاويتها] + [الكاميرا والعدسة وإعدادات الغالق والفتحة] + [الملمس وجودة الخامة الدقيقة] + [النمط اللوني ومعايير الريندر السينمائي]',
        '',
        'قاموس المصطلحات البصرية المعتمدة عالمياً:',
        '• مصطلحات الإضاءة: Softbox diffuse lighting, Edge rim lighting, Dappled sunlight through foliage, Chiaroscuro high contrast, Cinematic moody tone, Twilight ambient blue hour glow.',
        '• مصطلحات العدسات والفتحة: 85mm f/1.4 prime lens, 100mm macro f/2.8, 35mm street documentary lens, Shallow depth of field, Creamy circular bokeh, Tilt-shift perspective.',
        '• مصطلحات الملمس والواقعية: Micro skin pores, Fine peach fuzz, Subtle natural skin imperfections, Visible fabric weave texture, Water droplets condensation, Weathered sandstone texture.',
        '• مصطلحات نقاء الألوان والأفلام: Shot on 35mm film, Kodak Portra 400 color grain, Hasselblad natural color solution, Uncompressed RAW 8k quality, Photorealistic color fidelity.',
        '',
        'أهمية درع الموجهات السلبية (Negative Prompts):',
        'يجب دائماً استخدام موجهات الحماية لمنع الأخطاء الشائعة:',
        'negative prompt: plastic skin, airbrushed, cartoon, CGI render, 3D doll, oversaturated, blurry, bad anatomy, deformed fingers, extra limbs, lowres, doll face, fake reflections, watermark.'
      ]
    },
    {
      id: 'p1-parameters',
      title: '4. مصفوفة ضبط البارامترات الهندسية (Advanced Parameter Calibration)',
      summary: 'القيم الدقيقة لضبط مقياس التوجيه، خطوات التوليد، وأخذ العينات للحصول على أعلى استقرار',
      content: [
        '1. مقياس التوجيه (Guidance Scale / CFG Scale):',
        '• القيمة الموصى بها للواقعية الفائقة: بين 6.0 و 7.5.',
        '• إذا زادت القيمة عن 8.5، تبدأ الحواف بالاحتراق وتظهر هالات لونية مصطنعة ويزداد التباين بشكل غير طبيعي وتتلف البشرة.',
        '• إذا انخفضت القيمة عن 5.0، يتجاهل النموذج تفاصيل الكاميرا وتصبح اللقطة عشوائية وخارجة عن السيطرة.',
        '',
        '2. عدد خطوات التوليد (Inference Steps):',
        '• من 35 إلى 50 خطوة لنماذج SDXL و FLUX Dev للحصول على أنقى ملامح لمسام الجلد وشعر الوجه وتدرج الظلال.',
        '• الزيادة فوق 60 خطوة تستهلك وقتاً مضاعفاً دون فارق بصري ملحوظ، وقد تؤدي إلى تنعيم غير مرغوب فيه في الملامح.',
        '',
        '3. خوارزمية أخذ العينات (Sampler / Scheduler):',
        '• DPM++ 2M Karras: الخيار الأفضل إطلاقاً للواقعية البشرية والتفاصيل الطبيعية المتوازنة والسرعة العالية.',
        '• Euler a (Euler Ancestral): ممتاز للمشاهد الضبابية واللقطات الحالمة والمطر ولكنه قد يغير ملامح الوجه بين البذور المختلفة.',
        '',
        '4. البذرة العشوائية (Seed Control):',
        '• ثبت رقم البذرة (Fixed Seed) عند ضبط الإضاءة أو زاوية الكاميرا فقط، لتضمن عدم تغيير ملامح الشخصية أو البيئة.',
        '• استخدم البذرة العشوائية (-1) فقط أثناء استكشاف الأفكار الأولية والتكوينات الجديدة.'
      ]
    },
    {
      id: 'p1-camera-lenses-matrix',
      title: '5. مصفوفة الكاميرات والعدسات الاحترافية (Camera & Optics Matrix)',
      summary: 'دليل اختيار البعد البؤري المناسب لكل نوع من أنواع التصوير الواقعي',
      content: [
        '• عدسة 14mm إلى 24mm (Ultra-Wide): ممتازة للمناظر الطبيعية الصحراوية، والهندسة المعمارية الداخلية الضخمة، واللقطات الدرامية من زوايا منخفضة.',
        '• عدسة 35mm (Documentary & Environmental Portrait): عدسة القصة الإنسانية؛ تظهر الشخص مع جزء كافٍ من بيئته المحيطة بتناسب واقعي.',
        '• عدسة 50mm (Nifty Fifty / Normal Perspective): تحاكي منظور العين البشرية تماماً دون أي تشوه كروي، ومثالية للقطات الحوارات اليومية.',
        '• عدسة 85mm (The Portrait King): ملكة تصوير الوجوه؛ تقدم عزلاً خلفياً خرافياً (Creamy Bokeh) مع تسطيح ملامح الأنف والوجنتين بأجمل شكل طبيعي.',
        '• عدسة 105mm إلى 135mm (Fashion Telephoto): تستخدم في تصوير الأزياء الراقية وضغط المسافات بين الهدف والخلفية البعيدة.',
        '• عدسة 200mm إلى 400mm (Super Telephoto): لعزل الحيوانات البرية والطيور في بيئتها الطبيعية دون إزعاجها.'
      ]
    },
    {
      id: 'p1-masters-influence',
      title: '6. بصمات عمالقة التصوير الفوتوغرافي (Master Photographers Styles)',
      summary: 'كيف تستحضر أسلوب أشهر المصورين العالميين في لقطاتك بكلمات مفتاحية دقيقة',
      content: [
        '• ستيف ماكوري (Steve McCurry Style): ألوان مشبعة دافئة، عيون ثاقبة ذات تعبير إنساني ملحمي، وأقمشة تراثية غنية بالزخارف اليدوية.',
        '• آني ليبوفيتز (Annie Leibovitz Style): إضاءة استوديو متقنة كلوحات العصر الفيكتوري، دراما تعبيرية، وتكوينات معقدة تروي حكاية شخصية متكاملة.',
        '• بيتر ليندبيرغ (Peter Lindbergh Style): صور أبيض وأسود خام خالية من التجميل المصطنع، تبرز روح الإنسان وتجاعيد الزمن بأعلى درجات الصدق.',
        '• أنسل آدامز (Ansel Adams Style): تصوير المناظر الطبيعية بنظام المناطق (Zone System) بأعلى تباين ممكن بين أبيض الثلج وأسود الصخور الحاد.'
      ]
    },
    {
      id: 'p1-troubleshooting',
      title: '7. دليل استكشاف الأعطال وحل المشكلات الشائعة (Troubleshooting Matrix)',
      summary: 'كيف تعالج الأخطاء البصرية الشائعة مثل المظهر البلاستيكي، تشوه الأصابع، والعيون الزجاجية',
      content: [
        'المشكلة 1: ظهور الوجه بمظهر بلاستيكي ناعم يشبه الدمى (Plastic / Doll Skin Look)',
        '• السبب: استخدام كلمات عامة مثل "hyper-realistic" أو "smooth face" وارتفاع قيمة الـ CFG فوق 8.0.',
        '• الحل: احذف "smooth" فوراً وأضف: "subtle natural skin imperfections, visible pores, micro-details, natural peach fuzz, shot on 35mm Kodak Portra film".',
        '',
        'المشكلة 2: تشوه أصابع اليدين أو الأطراف (Extra or Deformed Fingers)',
        '• السبب: تعقيد زاوية اليد وصغر حجمها داخل الإطار الواسع.',
        '• الحل: اختر لقطة مقربة (Medium Shot) أو اجعل اليد ممسكة بشيء محدد بوضوح مثل: "holding an antique brass cup firmly in hand" مع إضافة "bad hands, deformed fingers" في السلبيات.',
        '',
        'المشكلة 3: لمعان العينين الزائد والمظهر الزجاجي المصطنع (Glassy Uncanny Eyes)',
        '• السبب: غياب مصدر انعكاس الضوء الطبيعي (Catchlight).',
        '• الحل: حدد مصدر الانعكاس بالاسم: "natural softbox catchlight reflection in pupils, authentic detailed iris texture, realistic cornea refraction".',
        '',
        'المشكلة 4: احتراق الإضاءة في الخلفية أو ابيضاض السماء (Blown-out Highlights)',
        '• السبب: غياب تحديد التعريض الضوئي المتوازن.',
        '• الحل: أضف "balanced dynamic range, soft gradient sky, film highlight rolloff, golden hour exposure".'
      ]
    },
    {
      id: 'p1-blueprints',
      title: '8. نماذج وسيناريوهات جاهزة للإنتاج الفوري (Production-Ready Blueprints)',
      summary: 'أوامر برومبت متكاملة ومجربة لإنتاج لقطات غلاف المجلات العالمية',
      content: [
        'النموذج 1: بورتريه الصقار العربي الأصيل (Falconer Desert Portrait)',
        'البرومبت الكامل: National Geographic style medium close-up photograph of an authentic Emirati falconer in traditional white kandura and keffiyeh holding a majestic peregrine falcon on a weathered leather glove, golden hour desert sand dunes background, dramatic side rim light catching desert dust particles, highly detailed weathered face, visible skin pores, authentic falcon plumage, shot on Hasselblad H6D-100c with 85mm f/1.4 lens, creamy bokeh, natural color grading --ar 16:9 --style raw',
        'الموجه السلبي: plastic skin, airbrush, cartoon, oversaturated, deformed beak, extra fingers, cgi render, blurry eyes',
        '',
        'النموذج 2: لقطة استوديو الموضة والأزياء الراقية (High-Fashion Editorial)',
        'البرومبت الكامل: Editorial high-fashion portrait of an elegant woman draped in emerald silk cape, minimalist architectural concrete studio setting, Rembrandt softbox key light with subtle silver reflector fill, sharp focus on eyes, delicate natural freckles, fine hair strands, shot on Leica M11 with Summilux 50mm f/1.4, cinematic film tone, Kodak Portra 400 grain --ar 4:5',
        'الموجه السلبي: 3d render, mannequin, glossy wax skin, cartoon, bad symmetry, distorted hands',
        '',
        'النموذج 3: لقطة شمسية للمحيط والموجة المائية (Ocean Wave Macro)',
        'البرومبت الكامل: Macro action photography of a translucent emerald ocean wave breaking at sunset, crystalline seafoam details, suspended micro water droplets glistening in golden backlight, shot on Canon EOS R5 with 100mm f/2.8 Macro lens, shutter speed 1/8000s, crisp high-speed freeze frame --ar 16:9',
        'الموجه السلبي: blurry, motion blur, painterly, plastic water, low resolution, noise'
      ]
    },
    {
      id: 'p1-glossary',
      title: '9. معجم المصطلحات الفوتوغرافية التخصصية (Bilingual Optical Glossary)',
      summary: 'قاموس المصطلحات الفنية المعتمدة لمهندسي البرومبت والمصورين الرقميين',
      content: [
        '• Bokeh: التأثير الجمالي لتمويه وعزل الأجزاء الخارجة عن بؤرة التركيز في خلفية اللقطة.',
        '• Rembrandt Lighting: تقنية إضاءة استوديو كلاسيكية تميزها بقعة ضوء مثلثة الشكل على خد الجانب المظلل من الوجه.',
        '• Dynamic Range: النطاق بين أكثر مناطق الصورة قتامة وأكثرها إشراقاً قبل فقدان التفاصيل.',
        '• Subsurface Scattering (SSS): ظاهرة فيزيائية يدخل فيها الضوء سطح مادة شبه شفافة كالجلد ويتشتت بداخلها قبل الخروج.',
        '• Catchlight: الانعكاس المضيء لمصدر الضوء داخل بؤبؤ وقزحية عين الشخص، وهو ما يمنحها الحيوية والبريق الطبيعي.',
        '• Chromatic Aberration: التشتت اللوني عند حواف الأجسام بسبب اختلاف انكسار الأطوال الموجية داخل زجاج العدسة.',
        '• Raw Sensor Output: البيانات البصرية النقية غير المضغوطة الملتقطة من مستشعر الكاميرا بدون أي معالجة تنعيم رقمية.'
      ]
    },
    {
      id: 'p1-protips',
      title: '10. نصائح وخفايا المحترفين وحيل الإنتاج الذكي (Mastery Hacks & Pro Secrets)',
      summary: 'أسرار سرية ترفع جودة صورك من مستوى الهواة إلى المعايير التجارية العالمية',
      content: [
        '• سر التوازن الواقعي: اذكر عيباً بشرياً واحداً دائماً في الوصف؛ مثلاً "tiny birthmark on cheek" أو "faint laugh lines" أو "slight asymmetrical eyebrow"، فالذكاء الاصطناعي يصبح مفرط المثالية بدون هذا التوجيه.',
        '• سر العدسات الكلاسيكية: أضف عبارة "shot on vintage Carl Zeiss lens with subtle analog vignetting" لإضفاء دفء بصري كلاسيكي لا يمكن منافسته.',
        '• محاذاة الإضاءة المتعددة: استخدم تقنية Three-Point Lighting في الوصف دائماً: "Key light at 45 degrees, subtle cool blue fill light, warm rim hair light".',
        '• تجنب الكلمات الميتة: احذف تماماً عبارات "photorealistic, 8k, ultra, hyper" واستبدلها بمواصفات حقيقية مثل "shot on 35mm film, Hasselblad H6D, 85mm prime lens f/1.4".'
      ]
    }
  ]
};
