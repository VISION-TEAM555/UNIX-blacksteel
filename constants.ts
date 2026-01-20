import { AppMode } from './types';

export const APP_NAME = "UNIX BLACKSTEEL";

export const MODE_CONFIG: Record<AppMode, { label: string; icon: string; promptModifier: string }> = {
  [AppMode.STUDY]: {
    label: "وضعية الدراسة",
    icon: "📚",
    promptModifier: "اشرح هذا المفهوم كأستاذ جامعي خبير، بأسلوب متدرج من السهل إلى الصعب. استخدم أمثلة واقعية."
  },
  [AppMode.RESEARCH]: {
    label: "وضعية البحث",
    icon: "🔍",
    promptModifier: "قدم بحثاً مفصلاً ومنظماً حول هذا الموضوع. اذكر المصادر إن أمكن، واستخدم هيكلية أكاديمية."
  },
  [AppMode.SUMMARY]: {
    label: "وضعية التلخيص",
    icon: "📝",
    promptModifier: "لخص النص أو المفهوم التالي في نقاط رئيسية واضحة ومباشرة. ركز على الجوهر."
  },
  [AppMode.VISUAL]: {
    label: "توليد صور",
    icon: "🎨",
    promptModifier: "Generate an image description."
  },
  [AppMode.MINDMAP]: {
    label: "خريطة ذهنية",
    icon: "🧠",
    promptModifier: "Create a hierarchical JSON structure for a mind map."
  }
};

export const INITIAL_SYSTEM_INSTRUCTION = `
You are Unix Blacksteel, a premium, advanced AI research assistant.
Your primary language is Arabic.
You are objective, precise, and highly intellectual.
Format your responses using clean Markdown (headers, lists, bold text).
Never mention that you are an AI model unless explicitly asked.
Adopt a 'Blacksteel' persona: professional, efficient, and slightly futuristic.
`;

export const MINDMAP_SYSTEM_INSTRUCTION = `
You are a JSON generator for mind maps.
Output ONLY valid JSON. No markdown fences.
Structure: { "name": "Root Topic", "children": [ { "name": "Subtopic", "children": [...] } ] }
Keep node names concise (max 5 words).
`;
