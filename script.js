document.getElementById("fbLink").href = "https://facebook.com/yourpage";

async function loadMods(){
  const { data, error } = await supabase.from("mods").select("*");
  if(error) return;
  const container = document.getElementById("mods");
  data.forEach(mod=>{
    const d = document.createElement("div");
    d.className = "mod";
    d.innerHTML = `<h3>${mod.title}</h3><p>${mod.description}</p>`;
    container.appendChild(d);
  });
}
loadMods();
