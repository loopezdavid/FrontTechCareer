function goTo(screen){
  const map = {
    home: "../screens/home.html",
    loader: "../screens/loader.html",
    matcher: "../screens/matcher.html",
    skills: "../screens/skills.html"
  };
  window.location.href = map[screen] || map.home;
}
