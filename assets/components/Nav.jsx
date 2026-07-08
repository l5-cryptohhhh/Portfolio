import StaggeredMenu from "../../src/components/StaggeredMenu/StaggeredMenu.jsx";

const MENU_ITEMS = [
    { label: "Home", ariaLabel: "Vai all'inizio", link: "#top" },
    { label: "Chi sono", ariaLabel: "Vai alla sezione chi sono", link: "#chi-sono" },
    { label: "Progetti", ariaLabel: "Vai alla sezione progetti", link: "#progetti" },
    { label: "Competenze", ariaLabel: "Vai alla sezione competenze", link: "#competenze" },
    { label: "Attestati", ariaLabel: "Vai alla sezione attestati", link: "#attestati" },
    { label: "Contatti", ariaLabel: "Vai alla sezione contatti", link: "#contatti" },
];

const SOCIAL_ITEMS = [
    { label: "GitHub", link: "https://github.com/l5-cryptohhhh" },
    { label: "LinkedIn", link: "https://www.linkedin.com/in/manuel-nunziata-800494372/" },
];

export default function Nav() {
    return (
        <StaggeredMenu
            position="right"
            isFixed={true}
            items={MENU_ITEMS}
            socialItems={SOCIAL_ITEMS}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#fff"
            openMenuButtonColor="#fff"
            changeMenuColorOnOpen={false}
            colors={["#B497CF", "#5227FF"]}
            accentColor="#FF9FFC"
        />
    );
}
