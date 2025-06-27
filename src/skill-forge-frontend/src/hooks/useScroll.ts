import { useEffect, useState } from 'react';

export const useScrollPosition = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            setScrollPosition(position);
            setIsScrolled(position > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { scrollPosition, isScrolled };
};

export const useActiveSection = (sections: string[], offset: number = 100) => {
    const [activeSection, setActiveSection] = useState(sections[0] || '');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + offset;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections, offset]);

    return activeSection;
};
