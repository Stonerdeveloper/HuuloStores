
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Hero.css';

const Hero = ({ slides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (!slides || slides.length === 0) return null;

    return (
        <div className="hero-slider">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                >
                    <div className="hero-overlay"></div>
                    <div className="container hero-content">
                        <h2 className="hero-title">{slide.title}</h2>
                        <p className="hero-subtitle">{slide.subtitle}</p>
                        <button
                            className="hero-cta"
                            style={{ backgroundColor: slide.color || 'var(--color-primary)' }}
                        >
                            {slide.cta}
                        </button>
                    </div>
                </div>
            ))}

            <button className="slider-btn prev" onClick={prevSlide}>
                <ChevronLeft size={24} />
            </button>
            <button className="slider-btn next" onClick={nextSlide}>
                <ChevronRight size={24} />
            </button>

            <div className="slider-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
