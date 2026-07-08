import { useEffect, useRef, useState } from "react";

export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || !("IntersectionObserver" in window)) {
            setVisible(true);
            return;
        }

        const io = new IntersectionObserver(([entry], obs) => {
            if (entry.isIntersecting) {
                setVisible(true);
                obs.unobserve(el);
            }
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const cls = [
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
    ].filter(Boolean).join(" ");

    return (
        <Tag ref={ref} className={cls} {...rest}>
            {children}
        </Tag>
    );
}
