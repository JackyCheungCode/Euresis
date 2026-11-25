"use client";

import { useRef, useState } from "react";
import {
  PButton,
  PHeading,
  PLink,
} from "@porsche-design-system/components-react/ssr";
import { homepageContent } from "@/src/data/homepage";

const HERO_VIDEO =
  "https://videos.pexels.com/video-files/10825393/10825393-hd_1920_1080_24fps.mp4";

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
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div className="hero-content">
        <PHeading id="hero-heading" className="hero-heading" tag="h1" size="3xl">
          <span className="hero-heading__eyebrow">EURESIS</span>
          Precision in
          <br />
          every rotation.
        </PHeading>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          <PLink href="#collections" icon="arrow-right" className="hero-cta">
            Explore collections
          </PLink>
        </div>
      </div>

      <PButton
        className="hero-video-control"
        type="button"
        variant="secondary"
        compact
        hideLabel
        icon={isPaused ? "play" : "pause"}
        aria={{ "aria-label": isPaused ? "Play background video" : "Pause background video" }}
        onClick={toggleVideo}
      >
        {isPaused ? "Play background video" : "Pause background video"}
      </PButton>
    </section>
  );
}
