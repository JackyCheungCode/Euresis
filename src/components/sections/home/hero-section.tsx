"use client";

import { useRef, useState } from "react";
import { PButton, PHeading } from "@porsche-design-system/components-react/ssr";
import { homepageContent } from "@/src/data/homepage";

const HERO_VIDEO = "https://videos.pexels.com/video-files/10825393/10825393-hd_1920_1080_24fps.mp4";

export function HeroSection() {
  const { hero } = homepageContent;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <section className="hero scheme-dark" aria-labelledby="hero-heading">
      <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="hero-content">
        <span className="hero-kicker">{hero.eyebrow}</span>
        <PHeading id="hero-heading" className="hero-heading" tag="h1" size="3xl">
          Precision in<br />every rotation.
        </PHeading>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          <PButton variant="secondary" type="button"><a href="#collections">Explore the range</a></PButton>
        </div>
      </div>
      <span className="hero-index" aria-hidden="true">01 / EURESIS PERFORMANCE WHEELS</span>
      <PButton className="hero-video-control" type="button" variant="secondary" compact hideLabel icon={isPaused ? "play" : "pause"} aria={{ "aria-label": isPaused ? "Play background video" : "Pause background video" }} onClick={toggleVideo}>
        {isPaused ? "Play background video" : "Pause background video"}
      </PButton>
    </section>
  );
}
