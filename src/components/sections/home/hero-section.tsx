"use client";

import { useRef, useState } from "react";
import { EButton, EHeading } from "@/src/components/ui/carbon-primitives";
import { homepageContent } from "@/src/data/homepage";

const HERO_VIDEO = "https://videos.pexels.com/video-files/20244146/20244146-uhd_4096_2160_30fps.mp4";
const HERO_POSTER = "https://images.pexels.com/videos/19927386/pexels-photo-19927386.jpeg?auto=compress&dpr=1&h=1200&w=2000";

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
      <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={HERO_POSTER} aria-hidden="true" tabIndex={-1}>
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="hero-content">
        <span className="hero-kicker">{hero.eyebrow}</span>
        <EHeading id="hero-heading" className="hero-heading" tag="h1" size="3xl">
          Precision in<br />every rotation.
        </EHeading>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          <a className="hero-primary-link" href="/wheels">Explore wheels <span aria-hidden="true">↗</span></a>
          <a className="hero-secondary-link" href="/wheels#vehicle-fitment">Find your fitment</a>
        </div>
      </div>
      <span className="hero-index" aria-hidden="true">01 / EURESIS PERFORMANCE WHEELS</span>
      <EButton className="hero-video-control" type="button" variant="secondary" compact hideLabel icon={isPaused ? "play" : "pause"} aria={{ "aria-label": isPaused ? "Play background video" : "Pause background video" }} onClick={toggleVideo}>
        {isPaused ? "Play background video" : "Pause background video"}
      </EButton>
    </section>
  );
}
