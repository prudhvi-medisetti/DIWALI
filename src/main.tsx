import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { authenticatePin } from './auth';
import navyaPrincessArtwork from './assets/navyasri-cinematic-princess.png';
import { profiles, type PrivateProfile, type StoryContent } from './profiles';
import './styles.css';

type CSSVariables = React.CSSProperties & Record<`--${string}`, string | number>;
type Point = { x: number; y: number };
type Rocket = Point & { targetY: number; speed: number; trail: Point[]; color: string };
type Particle = Point & { vx: number; vy: number; life: number; radius: number; color: string; trail: Point[] };

type ExperienceStep =
  | { type: 'hero' }
  | { type: 'story'; content: StoryContent }
  | { type: 'special'; content: NonNullable<PrivateProfile['content']['specialSection']> }
  | { type: 'finale'; content: PrivateProfile['content']['finale'] }
  | { type: 'closing'; content: PrivateProfile['content']['finalMessage'] };

const formatText = (text: string, profile: PrivateProfile): string =>
  text.split('{nickname}').join(profile.nickname);

function formatParagraph(text: string): React.ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={index}>{part}</React.Fragment>
  ));
}

function createSteps(profile: PrivateProfile): ExperienceStep[] {
  if (profile.chapterFlow) {
    return [
      { type: 'hero' },
      ...profile.content.story.map((content) => ({ type: 'story' as const, content })),
      { type: 'closing', content: profile.content.finalMessage },
    ];
  }

  const steps: ExperienceStep[] = [{ type: 'hero' }];
  if (!profile.content.hero.includeIntro) steps.push({ type: 'story', content: profile.content.intro });
  steps.push(...profile.content.story.map((content) => ({ type: 'story' as const, content })));

  if (profile.content.specialSection) {
    steps.push({ type: 'special', content: profile.content.specialSection });
  }

  steps.push(
    { type: 'story', content: profile.content.gratitude },
    { type: 'finale', content: profile.content.finale },
    { type: 'closing', content: profile.content.finalMessage },
  );
  return steps;
}

function AmbientParticles() {
  return (
    <div aria-hidden="true" className="ambient-particles">
      {Array.from({ length: 16 }, (_, index) => (
        <i key={index} style={{ '--particle': index } as CSSVariables} />
      ))}
    </div>
  );
}

function Fireworks({ active, finale, emerald = false, fairytale = false }: {
  active: boolean;
  finale: boolean;
  emerald?: boolean;
  fairytale?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || !context || reducedMotion) return undefined;

    let frame = 0;
    let lastTime = 0;
    let lastLaunch = 0;
    let rockets: Rocket[] = [];
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const colors = fairytale
      ? ['#e9c987', '#d2b6f2', '#fff0d4', '#b6b8ff', '#f4a66c']
      : emerald
      ? ['#f5c76b', '#e7d28f', '#fff4d6', '#a8c788', '#f59b6d']
      : ['#ffd38b', '#ffad62', '#ffe8ad', '#f7a5bd', '#f8d876'];

    const resize = (): void => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const launch = (): void => {
      const targetY = height * (0.18 + Math.random() * 0.3);
      rockets.push({
        x: width * (0.12 + Math.random() * 0.76),
        y: height + 4,
        targetY,
        speed: 3.2 + Math.random() * 2.2,
        trail: [],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const burst = (rocket: Rocket): void => {
      const count = finale ? 95 + Math.random() * 35 : 52 + Math.random() * 24;
      const pattern = Math.floor(Math.random() * 3);
      const offset = Math.random() * Math.PI * 2;
      for (let index = 0; index < count; index += 1) {
        const angle = offset + (Math.PI * 2 * index) / count;
        const speed = (pattern === 1 ? 2.2 : 1.2) + Math.random() * (pattern === 2 ? 3.2 : 2.3);
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.85 + Math.random() * 0.5,
          radius: 0.8 + Math.random() * 1.6,
          color: Math.random() > 0.18 ? rocket.color : colors[Math.floor(Math.random() * colors.length)],
          trail: [],
        });
      }
    };

    const drawTrail = (points: Point[], color: string, alpha = 1): void => {
      if (points.length < 2) return;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) {
        context.lineTo(points[index].x, points[index].y);
      }
      context.strokeStyle = color;
      context.globalAlpha = alpha;
      context.lineWidth = 1.4;
      context.shadowBlur = 12;
      context.shadowColor = color;
      context.stroke();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const tick = (time: number): void => {
      const delta = Math.min((time - lastTime) / 16.67 || 1, 2);
      lastTime = time;
      context.clearRect(0, 0, width, height);

      if (active && time - lastLaunch > (finale ? 800 : 1900)) {
        launch();
        lastLaunch = time;
      }

      rockets = rockets.filter((rocket) => rocket.y > rocket.targetY);
      rockets.forEach((rocket) => {
        rocket.trail.unshift({ x: rocket.x, y: rocket.y });
        rocket.trail.length = Math.min(rocket.trail.length, 8);
        rocket.y -= rocket.speed * delta;
        drawTrail(rocket.trail, rocket.color);
        context.beginPath();
        context.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
        context.fillStyle = '#fff2c6';
        context.shadowBlur = 14;
        context.shadowColor = rocket.color;
        context.fill();
        context.shadowBlur = 0;
        if (rocket.y <= rocket.targetY) burst(rocket);
      });

      particles = particles.filter((particle) => particle.life > 0);
      particles.forEach((particle) => {
        particle.trail.unshift({ x: particle.x, y: particle.y });
        particle.trail.length = Math.min(particle.trail.length, 5);
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vy += 0.045 * delta;
        particle.vx *= 0.995;
        particle.life -= 0.009 * delta;
        drawTrail(particle.trail, particle.color, Math.min(particle.life, 0.85));
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.globalAlpha = Math.max(particle.life, 0);
        context.shadowBlur = 12;
        context.shadowColor = particle.color;
        context.fill();
        context.globalAlpha = 1;
        context.shadowBlur = 0;
      });

      if (active || rockets.length || particles.length) frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    if (active) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [active, emerald, fairytale, finale]);

  return <canvas aria-hidden="true" className="fireworks" ref={canvasRef} />;
}

function Lanterns() {
  return (
    <div aria-hidden="true" className="lanterns">
      {Array.from({ length: 7 }, (_, index) => (
        <span className="lantern" key={index} style={{ '--lantern': index } as CSSVariables} />
      ))}
    </div>
  );
}

function Skyline() {
  return (
    <div aria-hidden="true" className="skyline">
      <div className="cityline">
        {Array.from({ length: 19 }, (_, index) => (
          <span
            className="building"
            key={index}
            style={{
              '--height': `${56 + ((index * 37) % 86)}px`,
              '--width': `${36 + ((index * 13) % 30)}px`,
            } as CSSVariables}
          />
        ))}
      </div>
      <div className="horizon-glow" />
    </div>
  );
}

function Diya({ onLight, large = false, lit = true }: { onLight?: () => void; large?: boolean; lit?: boolean }) {
  return (
    <button
      aria-label={onLight ? 'Light the diya' : 'A glowing brass diya'}
      className={`diya ${large ? 'diya-large' : ''} ${lit ? 'is-lit' : ''}`}
      disabled={!onLight}
      onClick={onLight}
      type="button"
    >
      <span className="diya-halo" />
      <span aria-hidden="true" className="flame"><i /></span>
      <span aria-hidden="true" className="wick" />
      <span aria-hidden="true" className="bowl">
        <i className="bowl-rim" />
        <i className="bowl-engraving" />
        <i className="bowl-shine" />
      </span>
      <span aria-hidden="true" className="diya-foot" />
      <span aria-hidden="true" className="rangoli"><i /></span>
      {onLight && <span className="diya-hint">Tap the diya to begin</span>}
    </button>
  );
}

function BalconySilhouette() {
  return (
    <div aria-hidden="true" className="balcony">
      <span className="balcony-moon" />
      <span className="balcony-person" />
      <span className="balcony-rail" />
      <span className="balcony-city" />
    </div>
  );
}

function Polaroids() {
  return (
    <div aria-hidden="true" className="polaroids">
      <div className="polaroid polaroid-one"><span>✦</span><i>bestie energy</i></div>
      <div className="polaroid polaroid-two"><span>☼</span><i>little moments</i></div>
    </div>
  );
}

function SisterhoodIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`sisterhood-illustration ${compact ? 'compact' : ''}`}>
      <span className="sisterhood-orbit" />
      <span className="sister-figure sister-one"><i /></span>
      <span className="sister-figure sister-two"><i /></span>
      <span className="sisterhood-heart">♡</span>
    </div>
  );
}

function ProfileSisterhoodArt({ profile, compact = false }: {
  profile: PrivateProfile;
  compact?: boolean;
}) {
  return <SisterhoodIllustration compact={compact} />;
}

function SiblingIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`siblings-illustration ${compact ? 'compact' : ''}`}>
      <span className="siblings-light" />
      <span className="sibling-figure brother"><i /></span>
      <span className="sibling-figure sister"><i /></span>
      <span className="rakhi-thread" />
      <span className="sibling-star">✦</span>
    </div>
  );
}

function RakhiIllustration() {
  return (
    <div aria-hidden="true" className="rakhi-display">
      <span className="rakhi-beam" />
      <span className="rakhi-threadline" />
      <span className="rakhi-medallion"><i>✿</i><b>✦</b></span>
      <span className="rakhi-flower flower-one">✿</span>
      <span className="rakhi-flower flower-two">✿</span>
      <span className="rakhi-diya">🪔</span>
      <span className="rakhi-gift"><i /><b /></span>
      <span className="rakhi-spark spark-one">✦</span>
      <span className="rakhi-spark spark-two">✧</span>
    </div>
  );
}

function FairytaleCastle() {
  return (
    <div aria-hidden="true" className="fairytale-castle">
      <span className="castle-moon" />
      <span className="castle-tower tower-left"><i /></span>
      <span className="castle-tower tower-right"><i /></span>
      <span className="castle-keep"><i /><b /></span>
      <span className="castle-wing wing-left" />
      <span className="castle-wing wing-right" />
      <span className="castle-gate" />
    </div>
  );
}

function NavyaSriSceneArt({ pose }: { pose: NonNullable<StoryContent['characterScene']> }) {
  return (
    <div
      aria-label="NavyaSri’s cinematic princess, palace, fireworks and Diwali lights"
      className={`navyasri-scene-art pose-${pose}`}
      role="img"
    >
      <img alt="" aria-hidden="true" className="navyasri-princess" src={navyaPrincessArtwork} />
      <span aria-hidden="true" className="princess-spark princess-spark-one">✦</span>
      <span aria-hidden="true" className="princess-spark princess-spark-two">✧</span>
    </div>
  );
}

function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button aria-pressed={!muted} className="sound-toggle" onClick={onToggle} type="button">
      <span aria-hidden="true" className={`sound-icon ${muted ? '' : 'sound-on'}`} />
      Sound {muted ? 'Off' : 'On'}
    </button>
  );
}

function App() {
  const [profile, setProfile] = useState<PrivateProfile | null>(() => {
    const restoredProfileId = import.meta.hot?.data.activeProfileId as string | undefined;
    return profiles.find((candidate) => candidate.id === restoredProfileId) ?? null;
  });
  const [sceneIndex, setSceneIndex] = useState(0);
  const [diyaLit, setDiyaLit] = useState(false);
  const [meaningStarted, setMeaningStarted] = useState(false);
  const [visibleMeaning, setVisibleMeaning] = useState(0);
  const [muted, setMuted] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [readySceneIndex, setReadySceneIndex] = useState<number | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const experienceRef = useRef<HTMLElement | null>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const steps = useMemo(() => profile ? createSteps(profile) : [], [profile]);
  const scene = steps[sceneIndex];
  const finale = scene?.type === 'finale';
  const celebration = scene?.type === 'story' && scene.content.visual === 'celebration';
  const delayedNext = scene?.type === 'story' && scene.content.delayedNext;
  const sceneReady = readySceneIndex === sceneIndex;
  const specialContent = scene?.type === 'special' ? scene.content.content : [];
  const characterScene: NonNullable<StoryContent['characterScene']> =
    scene?.type === 'story' ? scene.content.characterScene ?? 'castle' : 'castle';
  useEffect(() => {
    const hot = import.meta.hot;
    if (!hot) return undefined;
    hot.dispose((data) => {
      data.activeProfileId = profileRef.current?.id;
    });
    return undefined;
  }, []);

  useEffect(() => {
    if (profile?.theme.style !== 'fairytale') return undefined;
    const root = experienceRef.current;
    const supportsMouseParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!root || !supportsMouseParallax || prefersReducedMotion) return undefined;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    root.style.setProperty('--parallax-image-x', '0px');
    root.style.setProperty('--parallax-image-y', '0px');
    const animateParallax = (): void => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      root.style.setProperty('--parallax-x', `${currentX * 14}px`);
      root.style.setProperty('--parallax-y', `${currentY * 10}px`);
      root.style.setProperty('--parallax-image-x', `${currentX * 2}px`);
      root.style.setProperty('--parallax-image-y', `${currentY * 1.5}px`);
      root.style.setProperty('--parallax-lantern-x', `${currentX * 10}px`);
      root.style.setProperty('--parallax-lantern-y', `${currentY * 8}px`);
      root.style.setProperty('--parallax-fireworks-x', `${currentX * 8}px`);
      root.style.setProperty('--parallax-fireworks-y', `${currentY * 6}px`);
      root.style.setProperty('--parallax-particle-x', `${currentX * 18}px`);
      root.style.setProperty('--parallax-particle-y', `${currentY * 14}px`);

      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        frame = window.requestAnimationFrame(animateParallax);
      } else {
        frame = 0;
      }
    };
    const handlePointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (frame === 0) frame = window.requestAnimationFrame(animateParallax);
    };
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        frame = window.requestAnimationFrame(animateParallax);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      root.style.setProperty('--parallax-image-x', '0px');
      root.style.setProperty('--parallax-image-y', '0px');
    };
  }, [profile]);

  useLayoutEffect(() => {
    if (!profile || !sceneRef.current) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = gsap.fromTo(
      sceneRef.current,
      { y: reducedMotion ? 0 : 20, filter: reducedMotion ? 'blur(0px)' : 'blur(7px)' },
      { y: 0, filter: 'blur(0px)', duration: reducedMotion ? 0.15 : 0.85, ease: 'power2.out' },
    );
    return () => {
      tween.kill();
    };
  }, [profile, sceneIndex]);

  useEffect(() => {
    if (scene?.type !== 'special' || !meaningStarted || visibleMeaning >= specialContent.length) return undefined;
    const timer = window.setTimeout(() => setVisibleMeaning((count) => count + 1), 700);
    return () => window.clearTimeout(timer);
  }, [meaningStarted, scene, sceneIndex, specialContent.length, visibleMeaning]);

  useEffect(() => {
    if (!profile || muted || !window.AudioContext) return undefined;
    const audio = new window.AudioContext();
    const gain = audio.createGain();
    const low = audio.createOscillator();
    const high = audio.createOscillator();
    low.type = 'sine';
    low.frequency.value = 110;
    high.type = 'sine';
    high.frequency.value = 164.81;
    gain.gain.value = 0.012;
    low.connect(gain);
    high.connect(gain);
    gain.connect(audio.destination);
    low.start();
    high.start();
    return () => {
      low.stop();
      high.stop();
      void audio.close();
    };
  }, [muted, profile]);

  useEffect(() => {
    if (!delayedNext) {
      setReadySceneIndex(sceneIndex);
      return undefined;
    }
    const timer = window.setTimeout(() => setReadySceneIndex(sceneIndex), 1800);
    return () => window.clearTimeout(timer);
  }, [delayedNext, sceneIndex]);

  const advance = (): void => setSceneIndex((current) => Math.min(current + 1, steps.length - 1));

  const unlockProfile = (unlockedProfile: PrivateProfile): void => {
    setProfile(unlockedProfile);
    setSceneIndex(0);
    setDiyaLit(unlockedProfile.content.hero.includeIntro);
    setMeaningStarted(false);
    setVisibleMeaning(0);
    setWelcomeVisible(true);
    window.setTimeout(() => setWelcomeVisible(false), 1700);
  };

  const begin = (): void => {
    if (diyaLit) return;
    setDiyaLit(true);
    window.setTimeout(() => setSceneIndex(1), 1450);
  };

  const replay = (): void => {
    setProfile(null);
    setSceneIndex(0);
    setDiyaLit(false);
    setMeaningStarted(false);
    setVisibleMeaning(0);
    setMuted(true);
  };

  const appStyle = profile ? {
    '--diwali-bg': profile.theme.background,
    '--diwali-surface': profile.theme.surface,
    '--diwali-primary': profile.theme.primary,
    '--diwali-accent': profile.theme.accent,
    '--diwali-text': profile.theme.text,
    '--diwali-glow': profile.theme.glow,
    '--theme-primary': profile.theme.style === 'emerald' ? profile.theme.accent : profile.theme.primary,
    '--theme-secondary': profile.theme.secondary,
    '--theme-accent': profile.theme.accent,
  } as CSSVariables : undefined;

  return (
    <main
      className={`experience ${profile ? `scene-${sceneIndex} theme-${profile.theme.style} profile-${profile.id}` : 'pin-mode'} ${profile?.chapterFlow ? 'chapter-mode' : ''} ${finale ? 'is-finale' : ''} ${celebration ? 'is-celebration' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
      ref={experienceRef}
      style={appStyle}
    >
      <div aria-hidden="true" className="sky-wash" />
      <Fireworks
        active={Boolean(profile && (diyaLit || welcomeVisible))}
        emerald={profile?.theme.style === 'emerald'}
        fairytale={profile?.theme.style === 'fairytale'}
        finale={Boolean(finale || celebration)}
      />
      <div aria-hidden="true" className="vignette" />
      <Lanterns />
      <AmbientParticles />
      {profile?.theme.style === 'fairytale' && !profile.chapterFlow && <FairytaleCastle />}
      {!profile?.chapterFlow && <Skyline />}
      {profile?.theme.style === 'fairytale' && (
        <NavyaSriSceneArt
          key={`${sceneIndex}-${characterScene}`}
          pose={characterScene}
        />
      )}
      {!profile ? (
        <PinGate onUnlock={unlockProfile} />
      ) : (
        <>
          <header className="topbar">
            <div className="brand">{profile.nickname.toUpperCase()}</div>
            {profile.chapterFlow && (
              <p aria-live="polite" className="chapter-counter">
                {sceneIndex === steps.length - 1
                  ? 'FINAL CHAPTER'
                  : `CHAPTER ${String(sceneIndex + 1).padStart(2, '0')}`}
              </p>
            )}
            <SoundToggle muted={muted} onToggle={() => setMuted((value) => !value)} />
          </header>
          <nav aria-label="Story progress" className="progress">
            {steps.map((_, index) => (
              <span aria-current={index === sceneIndex ? 'step' : undefined} className={index <= sceneIndex ? 'complete' : ''} key={index} />
            ))}
          </nav>
          <section aria-live="polite" className="scene-stage" ref={sceneRef}>
            {scene?.type === 'hero' && (
              <div className={`hero ${profile.content.hero.includeIntro ? 'hero-with-intro' : ''}`}>
                <p className="hero-kicker">{formatText(profile.content.hero.kicker, profile)}</p>
                <h1>{formatText(profile.content.hero.title, profile)}</h1>
                <p className="hero-subtitle">{formatText(profile.content.hero.subtitle, profile)}</p>
                {profile.content.hero.includeIntro && (
                  <StoryCard
                    className="hero-intro-card"
                    eyebrow={formatText(profile.content.intro.eyebrow, profile)}
                    paragraphs={profile.content.intro.paragraphs.map((paragraph) => formatText(paragraph, profile))}
                    title={formatText(profile.content.intro.title, profile)}
                  />
                )}
                {profile.content.hero.includeIntro ? (
                  <Diya large lit />
                ) : (
                  <>
                    <Diya large lit={diyaLit} onLight={begin} />
                    <p className="hero-invitation">{formatText(profile.content.hero.invitation, profile)}</p>
                  </>
                )}
              </div>
            )}

            {scene?.type === 'story' && (
              <StoryScene
                content={scene.content}
                profile={profile}
                revealVisible={sceneReady}
              />
            )}

            {scene?.type === 'special' && (
              <div className={`delulu-scene ${meaningStarted ? 'meaning-open' : ''}`}>
                {!meaningStarted ? (
                  <>
                    <p className="hero-kicker">A very important title</p>
                    <h2>{formatText(scene.content.title, profile)}</h2>
                    <button className="glow-button" onClick={() => setMeaningStarted(true)} type="button">
                      {formatText(scene.content.buttonText, profile)}
                    </button>
                  </>
                ) : (
                  <div className="meaning-card">
                    <p className="paper-eyebrow">A tiny explanation</p>
                    <h2>{formatText(scene.content.buttonText, profile)}</h2>
                    <div className="meaning-lines">
                      {scene.content.content.slice(0, visibleMeaning).map((line, index) => (
                        <p className="meaning-line" key={`${index}-${line}`}>{formatText(line, profile)}</p>
                      ))}
                    </div>
                    {visibleMeaning === scene.content.content.length && <ContinueButton onClick={advance} />}
                  </div>
                )}
              </div>
            )}

            {scene?.type === 'finale' && (
              <div className="finale">
                <div className="mini-diyas" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                <p className="hero-kicker">A wish, wrapped in light</p>
                <h2>{scene.content.title.split('\n').map((line) => <span key={line}>{formatText(line, profile)}</span>)}</h2>
                {scene.content.visual === 'sisterhood' && profile.id !== 'dhanushka' && <ProfileSisterhoodArt compact profile={profile} />}
                {scene.content.visual === 'siblings' && <SiblingIllustration compact />}
                <Diya large lit />
                <div className="final-wish">
                  {scene.content.message.map((line) => <p key={line}>{formatText(line, profile)}</p>)}
                </div>
                <ContinueButton onClick={advance} />
              </div>
            )}

            {scene?.type === 'closing' && (
              <div className={`closing-note ${profile.chapterFlow ? 'chapter-letter' : ''}`}>
                <p className="hero-kicker">{scene.content.eyebrow ?? 'One last thing…'}</p>
                {scene.content.title && <h2 className="closing-title">{formatText(scene.content.title, profile)}</h2>}
                {scene.content.visual === 'sisterhood' && profile.id !== 'dhanushka' && <ProfileSisterhoodArt compact profile={profile} />}
                {scene.content.visual === 'siblings' && <SiblingIllustration compact />}
                <div className="closing-lines">
                  {scene.content.lines.map((line) => <p key={line}>{formatText(line, profile)}</p>)}
                </div>
                <p className="hug">{formatText(scene.content.signoff, profile)}</p>
                {scene.content.signature && <p className="signature">{formatText(scene.content.signature, profile)}</p>}
                <div className="closing-diya"><Diya lit /></div>
                <button className="glow-button replay-button" onClick={replay} type="button">
                  {scene.content.buttonText ?? 'Replay ✨'}
                </button>
              </div>
            )}
            {profile && !scene && (
              <div className="experience-error" role="alert">
                <h2>Something went wrong while opening this memory.</h2>
                <button className="glow-button" onClick={replay} type="button">← Try Again</button>
              </div>
            )}
          </section>
          {(((scene?.type === 'story' && (!delayedNext || sceneReady))
            || (scene?.type === 'hero' && profile.content.hero.includeIntro))) && (
            <ContinueButton
              className="edge-continue"
              label={scene?.type === 'hero' ? profile.content.hero.continueLabel : undefined}
              onClick={advance}
            />
          )}
        </>
      )}
      {profile && welcomeVisible && (
        <div aria-live="polite" className="welcome-overlay">
          <div className="welcome-glow" />
          <div aria-hidden="true" className="unlock-particles">
            {Array.from({ length: 14 }, (_, index) => (
              <i key={index} style={{ '--particle': index } as CSSVariables} />
            ))}
          </div>
          <div className="welcome-diya"><Diya lit /></div>
          <div className="welcome-copy">
            <p className="welcome-heading">Welcome, {profile.nickname} {profile.welcomeMessage ? '♡' : '✨'}</p>
            {profile.welcomeMessage?.map((line) => <p className="welcome-line" key={line}>{line}</p>)}
          </div>
        </div>
      )}
      {!profile && <footer className="footer pin-footer">a little light is waiting for you 🪔</footer>}
      {profile && <footer className="footer">made with a little light <span>•</span> for {profile.nickname} 🪔</footer>}
    </main>
  );
}

function PinGate({ onUnlock }: { onUnlock: (profile: PrivateProfile) => void }) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('');
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const statusTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (busy) return;
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        updatePin(`${pin}${event.key}`);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        updatePin(pin.slice(0, -1));
      } else if (event.key === 'Escape') {
        event.preventDefault();
        updatePin('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, pin]);

  const submitPin = async (value: string): Promise<void> => {
    if (busy || value.length !== 4) return;
    setBusy(true);
    setStatus('');
    try {
      const profile = await authenticatePin(value);
      if (!profile) {
        setPin('');
        setShaking(true);
        setStatus('That key doesn’t seem to fit… ✨');
        if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
        statusTimer.current = window.setTimeout(() => {
          setShaking(false);
          setStatus('');
        }, 2200);
        return;
      }
      setUnlocking(true);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 750));
      onUnlock(profile);
    } catch (error) {
      console.error('Unable to verify the entered PIN.', error);
      setPin('');
      setStatus('We couldn’t open your surprise just now. Please try again. ✨');
    } finally {
      setBusy(false);
    }
  };

  const updatePin = (candidate: string): void => {
    const nextPin = candidate.replace(/\D/g, '').slice(0, 4);
    setPin(nextPin);
    setShaking(false);
    setStatus('');
    if (nextPin.length === 4) void submitPin(nextPin);
  };

  const addDigit = (digit: string): void => {
    if (pin.length < 4 && !busy) updatePin(`${pin}${digit}`);
  };

  return (
    <section
      aria-label="Unlock your Diwali surprise"
      className={`pin-screen ${shaking ? 'pin-error' : ''} ${unlocking ? 'pin-unlocking' : ''}`}
    >
      <div className="pin-panel">
        <p className="pin-eyebrow">A LITTLE DIWALI SURPRISE <span>🪔</span></p>
        <h1>Enter Passcode</h1>
        <div aria-label={`${pin.length} of 4 PIN digits entered`} className="pin-dots">
          {[0, 1, 2, 3].map((index) => <span className={index < pin.length ? 'filled' : ''} key={index} />)}
        </div>
        <div aria-label="PIN keypad" className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((key, index) => (
            key ? (
              <button
                aria-label={`Enter ${key}`}
                className="keypad-key"
                disabled={busy}
                key={`${key}-${index}`}
                onClick={() => addDigit(key)}
                type="button"
              >
                {key}
              </button>
            ) : <span aria-hidden="true" className="keypad-spacer" key={`spacer-${index}`} />
          ))}
        </div>
        <p aria-live="polite" className={`pin-status ${status ? 'visible' : ''}`}>
          {status || (unlocking ? 'Opening your surprise… ✨' : 'A four-digit key opens this little memory')}
        </p>
      </div>
    </section>
  );
}

function StoryScene({ content, profile, revealVisible }: {
  content: StoryContent;
  profile: PrivateProfile;
  revealVisible: boolean;
}) {
  const layoutClass = content.visual || profile.chapterFlow ? 'story-layout' : '';
  return (
    <div className={`${layoutClass} ${content.visual === 'polaroids' ? 'playful-layout' : ''}`}>
      <StoryCard
        className={content.items ? 'wish-scene-card' : ''}
        chapter={content.chapter}
        eyebrow={formatText(content.eyebrow, profile)}
        items={content.items?.map((item) => ({
          icon: item.icon,
          text: formatText(item.text, profile),
        }))}
        paragraphs={content.paragraphs.map((paragraph) => formatText(paragraph, profile))}
        revealParagraphs={revealVisible
          ? content.revealParagraphs?.map((paragraph) => formatText(paragraph, profile))
          : undefined}
        title={formatText(content.title, profile)}
      />
      {content.visual === 'balcony' && <BalconySilhouette />}
      {content.visual === 'polaroids' && <Polaroids />}
      {content.visual === 'sisterhood' && profile.id !== 'dhanushka' && <ProfileSisterhoodArt profile={profile} />}
      {content.visual === 'siblings' && <SiblingIllustration />}
      {content.visual === 'rakhi' && <RakhiIllustration />}
      {content.visual === 'celebration' && <DiwaliCelebrationLights />}
    </div>
  );
}

function DiwaliCelebrationLights() {
  return (
    <div aria-hidden="true" className="celebration-diyas">
      {Array.from({ length: 7 }, (_, index) => <span key={index}>🪔</span>)}
    </div>
  );
}

function StoryCard({ eyebrow, title, paragraphs, items, revealParagraphs, chapter, className = '' }: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  items?: Array<{ icon: string; text: string }>;
  revealParagraphs?: string[];
  chapter?: string;
  className?: string;
}) {
  return (
    <article className={`story-card ${className}`}>
      {chapter && <p className="chapter-label">{chapter}</p>}
      <p className="paper-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="story-copy">
        {paragraphs.map((paragraph) => <p key={paragraph}>{formatParagraph(paragraph)}</p>)}
        {revealParagraphs?.map((paragraph, index) => (
          <p className="revealed-copy" key={`${index}-${paragraph}`}>{formatParagraph(paragraph)}</p>
        ))}
      </div>
      {items && (
        <div className="wish-grid">
          {items.map((item) => (
            <div className="wish-card" key={item.text}>
              <span>{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      )}
      <span aria-hidden="true" className="card-flower">✿</span>
    </article>
  );
}

function ContinueButton({ onClick, className = '', label = 'Next' }: { onClick: () => void; className?: string; label?: string }) {
  return <button className={`continue-button ${className}`} onClick={onClick} type="button">{label} <span>→</span></button>;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing root element');
createRoot(rootElement).render(<App />);
