/* Shared estimate for private parties, first birthdays and seminars. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const el = (id) => document.getElementById(id);
  const won = (n) => Number(n).toLocaleString("ko-KR") + "원";
  const rates = { weekday: 25000, weekend: 30000, included: 5, extra: 10000, dol: 200000, proposal: 100000 };
  const menus = {
    meal: { name: "식사형", price: 35000, description: "불고기·잡채 등 메인 요리, 라이스 메뉴, 샐러드, 제철 과일·디저트·음료", image: "assets/dol-buffet.png" },
    finger: { name: "핑거푸드형", price: 20000, description: "미니 샌드위치, 카나페·카프레제 꼬치, 쿠키·휘낭시에, 과일 컵, 커피·주스·생수", image: "assets/finger-food.png" },
  };
  const events = { party: "프라이빗 파티", dol: "돌잔치", seminar: "기업 세미나" };
  const params = new URLSearchParams(location.search);
  const fixedEvent = form.dataset.event !== "general" ? form.dataset.event : null;
  const localToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const today = localToday();
  el("date").min = today;
  const incomingDate = params.get("date");
  el("date").value = incomingDate && /^\d{4}-\d{2}-\d{2}$/.test(incomingDate) && incomingDate >= today ? incomingDate : today;
  if (!el("date").value) el("date").value = today;
  for (let h = 0; h < 24; h++) {
    const time = String(h).padStart(2, "0") + ":00";
    el("startTime").add(new Option(time, time));
  }
  el("startTime").value = /^([01]\d|2[0-3]):00$/.test(params.get("time") || "") ? params.get("time") : "18:00";
  const incomingHours = Number(params.get("hours"));
  el("hours").value = String(Number.isInteger(incomingHours) && incomingHours >= 3 && incomingHours <= 12 ? incomingHours : 3);
  el("eventType").value = fixedEvent || (events[params.get("event")] ? params.get("event") : "party");

  function configureEvent(initial = false) {
    const event = el("eventType").value;
    const seminar = event === "seminar";
    const party = event === "party";
    const previous = Number(el("guests").value) || (seminar ? 30 : 10);
    const requested = initial && params.has("guests") ? Number(params.get("guests")) : previous;
    const max = seminar ? 30 : 100;
    el("guests").replaceChildren();
    for (let n = 10; n <= max; n++) el("guests").add(new Option(`${n}명`, String(n)));
    el("guests").value = String(Math.min(max, Math.max(10, Math.round(requested) || 10)));
    el("guestGuide").textContent = seminar ? "세미나 테이블 기준 10~30명 선택 가능합니다." : "최소 10명부터 선택 가능합니다.";
    el("eventFacilities").textContent = seminar ? "30인 테이블 · 대형 TV · 음향시설 무료 제공 (공간 대여료 별도)" : "행사에 맞는 케이터링을 선택해 주세요.";
    el("dolTableOption").hidden = event !== "dol";
    el("dolEstimateLine").hidden = event !== "dol";
    el("dolTable").checked = event === "dol";
    el("proposalOption").hidden = !party;
    el("proposalEstimateLine").hidden = !party;
    el("proposal").checked = false;
    el("catering").checked = Boolean(fixedEvent) || params.has("event");
    el("cateringType").value = event === "dol" ? "meal" : "finger";
    if (initial) {
      if (params.has("dol")) el("dolTable").checked = event === "dol" && params.get("dol") === "1";
      if (params.has("proposal")) el("proposal").checked = party && params.get("proposal") === "1";
      if (params.has("catering")) el("catering").checked = params.get("catering") === "1";
      if (menus[params.get("menu")]) el("cateringType").value = params.get("menu");
    }
    el("bookingSelection").hidden = false;
    el("bookingSelection").textContent = seminar ? "기업 세미나 · 테이블, 대형 TV, 음향시설 무료 제공" : party ? "프라이빗 파티 · 프로포즈 세팅 선택 가능" : "돌잔치 구성 · 식사형 또는 핑거푸드형 선택 가능";
    const image = document.querySelector(".booking-mood img");
    if (image) {
      image.src = seminar ? "assets/glass-seminar.png" : event === "dol" ? "assets/glass-dol.png" : "assets/glass-party.png";
      image.alt = seminar ? "통유리 라운지의 세미나 AI 연출 이미지" : event === "dol" ? "통유리 라운지의 돌상 AI 연출 이미지" : "통유리 라운지의 프라이빗 파티 AI 연출 이미지";
    }
    if (!initial) update();
  }

  function update() {
    const event = el("eventType").value;
    const date = el("date").value;
    const weekend = [0, 5, 6].includes(new Date(date + "T12:00:00").getDay());
    const hourly = weekend ? rates.weekend : rates.weekday;
    const hours = Number(el("hours").value);
    const guests = Number(el("guests").value);
    const menu = menus[el("cateringType").value];
    const catering = el("catering").checked;
    const space = hourly * hours;
    const extra = Math.max(0, guests - rates.included) * rates.extra;
    const food = catering ? menu.price * guests : 0;
    const dol = el("dolTable").checked && event === "dol" ? rates.dol : 0;
    const proposal = el("proposal").checked && event === "party" ? rates.proposal : 0;
    const total = space + extra + food + dol + proposal;
    el("cateringOptions").hidden = !catering;
    el("cateringMenu").textContent = `${menu.description} · 예시 ${won(menu.price)} / 1인`;
    el("cateringSummary").textContent = catering ? `케이터링 · ${menu.name}` : "케이터링 서비스";
    el("spaceAmount").textContent = won(space);
    el("guestAmount").textContent = won(extra);
    el("cateringAmount").textContent = won(food);
    el("dolAmount").textContent = won(dol);
    el("proposalAmount").textContent = won(proposal);
    el("totalAmount").textContent = won(total);
    el("rateSummary").textContent = `${date || "날짜 미선택"} · ${weekend ? "주말(금~일)" : "평일(월~목)"} ${won(hourly)}/시간 · ${hours}시간 · ${guests}명`;
    const link = new URLSearchParams({ event, date, time: el("startTime").value, hours: String(hours), guests: String(guests), catering: catering ? "1" : "0", menu: el("cateringType").value, dol: dol ? "1" : "0", proposal: proposal ? "1" : "0" });
    el("continueBooking").hidden = !fixedEvent;
    el("continueBooking").href = "booking.html?" + link.toString();
    return { event, date, hours, guests, menu, catering, space, extra, food, dol, proposal, total };
  }

  form.addEventListener("submit", (e) => e.preventDefault());
  const chooseProposal = el("chooseProposal");
  if (chooseProposal) chooseProposal.addEventListener("click", () => {
    el("proposal").checked = true;
    update();
    el("event-estimate").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  form.addEventListener("input", update);
  form.addEventListener("change", (e) => {
    if (e.target.id === "eventType") configureEvent();
    else update();
  });
  el("copyEstimate").addEventListener("click", async () => {
    if (!form.reportValidity()) return;
    const r = update();
    const end = (Number(el("startTime").value.slice(0, 2)) + r.hours);
    const text = [
      "[NOVA PRIVATE LOUNGE 견적]", `행사: ${events[r.event]}`, `날짜: ${r.date}`,
      `시간: ${el("startTime").value} ~ ${end >= 24 ? "익일 " : ""}${String(end % 24).padStart(2, "0")}:00 (${r.hours}시간)`,
      `인원: ${r.guests}명`, `공간 이용료: ${won(r.space)}`, `추가 인원: ${won(r.extra)}`,
      ...(r.event === "dol" ? [`돌상 세팅: ${won(r.dol)}`] : []),
      ...(r.event === "party" ? [`프로포즈 세팅: ${r.proposal ? won(r.proposal) + " · 장미꽃잎 길, LED 촛불, 풍선" : "선택 안 함"}`] : []),
      `케이터링 서비스: ${r.catering ? r.menu.name + " · " + won(r.menu.price) + " × " + r.guests + "명 = " + won(r.food) : "선택 안 함"}`,
      ...(r.event === "seminar" ? ["30인 테이블 · 대형 TV · 음향시설 무료 제공"] : []),
      `예상 합계: ${won(r.total)}`, `요청사항: ${el("request").value || "없음"}`,
      "케이터링 단가는 연습용 예시입니다. 최종 구성과 금액은 상담 후 확정됩니다.",
    ].join("\n");
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement("textarea");
        field.value = text; field.style.position = "fixed"; field.style.opacity = "0";
        document.body.append(field); field.select();
        const copied = document.execCommand("copy"); field.remove();
        if (!copied) throw new Error("copy failed");
      }
      alert("견적 내용이 복사되었습니다.");
    } catch { alert("견적을 복사하지 못했습니다. 브라우저의 복사 권한을 확인해 주세요."); }
  });
  configureEvent(true);
  update();
});
