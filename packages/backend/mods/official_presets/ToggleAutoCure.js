var u = Object.defineProperty;
var I = (t, a, e) => a in t ? u(t, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[a] = e;
var i = (t, a, e) => (I(t, typeof a != "symbol" ? a + "" : a, e), e);
const g = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xOSAzSDVjLTEuMSAwLTEuOTkuOS0xLjk5IDJMMyAxOWMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bS0xIDExaC00djRoLTR2LTRINnYtNGg0VjZoNHY0aDR2NHoiLz48L3N2Zz4=";
class s {
  constructor() {
    i(this, "logger");
    i(this, "meta", {
      scope: "median",
      id: "toggleAutoCure",
      type: "quick-access-plugin"
    });
    i(this, "icon", g);
    i(this, "autoCure", !1);
  }
  click() {
    sac.toggleAutoCure(!this.autoCure);
  }
  async showAsync() {
    return this.autoCure = await sac.getAutoCureState(), `自动治疗: ${this.autoCure ? "开" : "关"}`;
  }
}
export {
  s as default
};
//# sourceMappingURL=ToggleAutoCure.js.map
