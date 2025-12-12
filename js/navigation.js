const routes = {
    home: "../screens/home.html",
    matcher: "../screens/matcher.html",
    skills: "../screens/skills.html",
    login: "../screens/login.html",
    register: "../screens/register.html",
    profile: "../screens/profile.html",
    settings: "../screens/settings.html"
};

function goTo(page){
    if(!routes[page]){
        console.error("Ruta no definida:", page);
        return;
    }
    window.location.href = routes[page];
}
