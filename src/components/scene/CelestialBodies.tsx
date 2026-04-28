import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export function CelestialBodies() {
  const { sunEmotion, theme } = useAppStore();
  const isDark = theme === 'dark';

  // Expresiones del sol
  const sunFaces: Record<string, { eyes: string; mouth: string }> = {
    neutral: {
      eyes: "M 30,40 Q 35,35 40,40 M 60,40 Q 65,35 70,40",
      mouth: "M 40,60 Q 50,68 60,60"
    },
    happy: {
      eyes: "M 30,38 Q 35,32 40,38 M 60,38 Q 65,32 70,38",
      mouth: "M 32,58 Q 50,78 68,58"
    },
    curious: {
      eyes: "M 32,40 L 38,40 M 62,36 Q 66,32 70,36",
      mouth: "M 42,62 Q 50,66 58,62"
    },
    sleeping: {
      eyes: "M 30,40 L 40,40 M 60,40 L 70,40",
      mouth: "M 42,62 Q 50,65 58,62"
    }
  };

  // Expresiones de la luna
  const moonFaces: Record<string, { eyes: string; mouth: string }> = {
    neutral: {
      eyes: "M 30,42 L 40,42 M 60,42 L 70,42",
      mouth: "M 40,62 Q 50,67 60,62"
    },
    happy: {
      eyes: "M 30,40 Q 35,35 40,40 M 60,40 Q 65,35 70,40",
      mouth: "M 35,60 Q 50,75 65,60"
    },
    curious: {
      eyes: "M 33,42 L 37,42 M 60,38 Q 65,34 70,38",
      mouth: "M 44,63 Q 50,67 56,63"
    },
    sleeping: {
      eyes: "M 30,42 L 40,42 M 60,42 L 70,42",
      mouth: "M 44,64 Q 50,66 56,64"
    }
  };

  const face = isDark ? (moonFaces[sunEmotion] || moonFaces.neutral) : (sunFaces[sunEmotion] || sunFaces.neutral);

  return (
    <div className="fixed top-16 right-8 md:top-24 md:right-16 w-32 h-32 pointer-events-none z-10">
      {!isDark ? (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: sunEmotion === 'happy' ? 1.15 : 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <motion.div 
            className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl"
            animate={{ opacity: sunEmotion === 'happy' ? 0.8 : 0.5 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-4 bg-gradient-to-br from-yellow-100 to-orange-300 rounded-full shadow-lg flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <circle cx="22" cy="52" r="8" fill="#fca5a5" opacity="0.4" />
              <circle cx="78" cy="52" r="8" fill="#fca5a5" opacity="0.4" />
              <path d={face.eyes} stroke="#c2410c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d={face.mouth} stroke="#c2410c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: sunEmotion === 'happy' ? 1.1 : 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <motion.div 
            className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl"
            animate={{ opacity: sunEmotion === 'happy' ? 0.35 : 0.15 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-4 bg-gradient-to-br from-slate-100 to-slate-300 rounded-full shadow-[0_0_30px_rgba(199,210,254,0.2)] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <circle cx="22" cy="54" r="7" fill="#c4b5fd" opacity="0.3" />
              <circle cx="78" cy="54" r="7" fill="#c4b5fd" opacity="0.3" />
              <path d={face.eyes} stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d={face.mouth} stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  );
}
